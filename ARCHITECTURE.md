# Architecture

A walkthrough of how Hiriya works under the hood — the design choices, the
accuracy techniques, and the auth model.

---

## 1. Stack at a glance

| Layer        | Choice                                           | Why                                                   |
| ------------ | ------------------------------------------------ | ----------------------------------------------------- |
| Frontend     | Vite 7 + React 19 + Tailwind 4                   | Modern, fast HMR, no SSR overhead for this use case. |
| Backend      | Express 4 (ESM, Node 20)                         | Familiar, zero magic, plays well with SSE.            |
| Auth         | Clerk (`@clerk/express`, `@clerk/clerk-react`)   | Drop-in JWT auth with a great free tier.              |
| Embeddings   | Gemini `gemini-embedding-001` (768-dim)          | MTEB top-tier quality, free tier, asymmetric mode.    |
| Vector store | Supabase Postgres + `pgvector` HNSW              | One DB for vectors + chats. No separate infra.        |
| LLM          | Groq `llama-3.3-70b-versatile` (`8b-instant` fb) | Fastest hosted inference; ~500 t/s.                   |
| Reranker     | Groq `llama-3.1-8b-instant`                      | Cheap, fast, JSON-disciplined enough.                 |
| TTS          | ElevenLabs Brian                                 | Warm voice; proxied so the key stays server-side.     |
| Hosting      | Vercel (frontend), Fly.io (backend)              | Free tiers, single-region OK for a demo.              |

---

## 2. Ingestion pipeline

`backend/scripts/ingest.js` walks `backend/data/` and dispatches to the right
parser per extension:

```
PDF / MD / HTML / TXT / JSON
        │
        ▼
   parseFile()           ─── pdf-parse / cheerio / passthrough
        │
        ▼
   chunkText()           ─── §-aware, ~500-token chunks, 50-token overlap
        │
        ▼
   embed(... 'RETRIEVAL_DOCUMENT')   ─── Gemini, batched 100/req, retry+backoff
        │
        ▼
   upsert into Supabase  ─── content_hash dedupe → idempotent re-runs
```

Two important details:

- **Asymmetric embedding task types**: documents are embedded with
  `taskType=RETRIEVAL_DOCUMENT`, queries with `RETRIEVAL_QUERY`. Gemini exposes
  this and it materially improves recall.
- **Stable content hashing** at the document level: re-running ingestion is a
  no-op for unchanged files. New files insert; modified files replace.

---

## 3. Retrieval pipeline

```
user message ────────────────────────────────────────────────┐
                                                              │
            ┌─────────────────────────────────────────────┐   │
            │ 0. tryShortcut()                            │   │
            │    Greetings / identity / farewells        │   │
            │    bypass the whole pipeline.              │   │
            └─────────────────────────────────────────────┘   │
                                                              ▼
            ┌─────────────────────────────────────────────────────┐
            │ 1. queryRewriter (Groq 8b, JSON-disciplined)        │
            │    "and the second one?" → "details about Program X"│
            └─────────────────────────────────────────────────────┘
                            │
                            ▼
            ┌────────────────────────────────────────────────────┐
            │ 2. retrieve()                                      │
            │    a) vector top-20 (pgvector cosine, score thresh)│
            │    b) FTS top-20 (websearch_to_tsquery + ts_rank)  │
            │    c) Reciprocal Rank Fusion (k=60)                │
            └────────────────────────────────────────────────────┘
                            │ ~20 candidates
                            ▼
            ┌────────────────────────────────────────────────────┐
            │ 3. rerank() (Groq 8b)                              │
            │    Score each candidate 0–10 vs. query → keep top 5│
            └────────────────────────────────────────────────────┘
                            │ ~5 chunks
                            ▼
            ┌────────────────────────────────────────────────────┐
            │ 4. prompt build                                    │
            │    SYSTEM_PROMPT with grounding rules + chunk ids  │
            │    + last 10 turns of conversation                 │
            └────────────────────────────────────────────────────┘
                            │
                            ▼
            ┌────────────────────────────────────────────────────┐
            │ 5. streamChat (Groq 70b)                           │
            │    SSE delta events to the client                  │
            └────────────────────────────────────────────────────┘
                            │
                            ▼
            ┌────────────────────────────────────────────────────┐
            │ 6. validateCitations()                             │
            │    Strip [src:UUID] tokens whose ids weren't       │
            │    actually retrieved. Persist cleaned reply.      │
            └────────────────────────────────────────────────────┘
```

### Why these specific levers?

| Lever                 | Failure mode it fights                                                |
| --------------------- | --------------------------------------------------------------------- |
| Asymmetric embedding  | Symmetric embeddings underweight short queries vs. long passages.    |
| Hybrid + RRF          | Pure cosine misses keyword/abbreviation matches (e.g. "AU 2024-25"). |
| Reranker              | Top-K vector hits can have wrong topic → reorder by semantic match.  |
| Query rewriting       | Multi-turn questions starve retrieval (no entity in the message).    |
| Score thresholding    | Empty knowledge base → don't surface noise; let the model refuse.    |
| Citation validation   | LLMs invent citation ids when asked to cite — strip phantoms.        |

All of these are tunable via env vars; see `backend/.env.example`.

---

## 4. Chat persistence

Two tables (`backend/src/db/migrations/002_chat.sql`):

- `chats(id, user_id, title, created_at, updated_at)`
- `messages(id, chat_id, role, content, sources jsonb, created_at)`

Trigger `messages_bump_chat` updates `chats.updated_at` whenever a message is
added so the sidebar can sort by recency.

Persistence is **conditional** on `req.auth.userId` being populated:

- **Guest** (no Clerk session): chat works, history persists in
  `localStorage` only. Backend doesn't write anything.
- **Signed-in**: backend creates / re-uses a `chats` row for the current
  conversation, persists both user and assistant messages, and trims the
  context window to the last N turns.

The middleware (`backend/src/middleware/clerk.js`) is **non-rejecting**: a
missing or invalid token does NOT block the request, it just leaves
`req.auth` undefined. Routes that *require* auth (the `/api/chats` CRUD
routes) check explicitly and return 401.

---

## 5. Streaming

The chat endpoint replies with Server-Sent Events:

```
event: start     → { ts }
event: chat      → { chatId }              (only when persistence happens)
event: sources   → { sources: [...] }      (sent before the LLM token stream)
event: delta     → { text: "..." }         (one per Groq stream delta)
event: error     → { code, message }
event: done      → { length, citedSourceIds }
```

The frontend's `streamChat` async iterator parses these and the `useChat`
hook updates state incrementally so the UI streams token-by-token.

Cancel button calls `AbortController.abort()` on the fetch, which the SSE
loop and the Groq SDK both respect.

---

## 6. Frontend state

A small set of focused hooks:

- `useAuthToken` — `getToken()` and `useAuthState()` that work whether or not
  `<ClerkProvider>` is mounted.
- `useChat` — owns messages, streaming state, error, send/cancel/clear,
  guest-mode `localStorage` persistence.
- `useChats` — sidebar chat list (only meaningful for signed-in users).

Components are presentational: `Sidebar`, `WelcomeScreen`, `ChatMessages`,
`ChatInput`, `Sources`, `ErrorBanner`, `Markdown`, `Navbar`. Everything is
controlled by props; state lives one level up in `App.jsx`.

---

## 7. Security

- **No provider keys in the browser**: Groq + ElevenLabs both proxied through
  the backend. Gemini calls are exclusively server-side.
- **CORS allow-list** via `CORS_ORIGINS`.
- **Service-role Supabase key** stays on the server; we never use the anon
  key from the browser because we don't expose Supabase to the client.
- **Clerk JWT**: validated by `@clerk/express` against Clerk's JWKS.
- **Citation validation**: LLM cannot smuggle made-up source ids into the UI.

---

## 8. Observability

- Tiny structured logger (`backend/src/lib/logger.js`) with
  `LOG_LEVEL=debug|info|warn|error`.
- Every retrieval logs `{ vectorHits, hybrid, returned, ms }`.
- Reranker logs `{ kept, topScore }`.
- Errors include the path and a JSON-stringified meta object so they grep
  cleanly.

---

## 9. CI

`.github/workflows/ci.yml` runs `lint` and `test` for both workspaces on
push and PR. Tests are pure-Node Vitest + supertest (backend) and Vitest +
RTL (frontend), no live network calls.

---

## 10. What's next?

If we keep iterating, the highest-ROI follow-ups are:

1. **Multi-query expansion**: paraphrase the query 3× and dedupe results.
2. **Response evaluation**: a tiny offline harness that scores answers
   against gold Q/A pairs to track retrieval quality over time.
3. **Streaming source updates**: emit `sources` *during* the rerank pass so
   the UI can show "thinking… considering 12 documents…".
4. **Multimodal embeddings**: Gemini supports image embeddings; we could
   index slide decks and brochures.
5. **Per-user rate limiting** on `/api/chat`.
