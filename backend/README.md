# `backend/` — Hiriya API

Node 20 + Express 4. ESM only. Hosts the RAG pipeline, Groq LLM proxy,
ElevenLabs TTS proxy, and Postgres-backed chat persistence.

## Run locally

```bash
cd backend
cp .env.example .env
# fill in keys
npm install
npm run dev
```

Then hit:

- `GET  /api/health`
- `POST /api/rag/query` `{ "query": "..." }`
- `POST /api/chat` (SSE) `{ "message": "...", "chatId"?: "...", "history"?: [...] }`
- `GET  /api/chats` (auth required)
- `POST /api/tts` `{ "text": "..." }` → `audio/mpeg`

## Scripts

| Command           | What it does                                               |
| ----------------- | ---------------------------------------------------------- |
| `npm run dev`     | `node --watch src/index.js`                                |
| `npm run start`   | Production entry.                                          |
| `npm run ingest`  | Walks `backend/data/`, chunks + embeds + upserts.          |
| `npm run reset`   | Truncates `documents` (and `chunks` cascades).             |
| `npm run migrate` | Prints SQL for the migrations folder; paste into Supabase. |
| `npm test`        | Vitest unit + integration tests.                           |
| `npm run lint`    | ESLint.                                                    |

## Tests

`tests/` covers:

- `chunker` — section / paragraph / overlap behaviour.
- `retriever` — RRF correctness.
- `citations` — extract + validate.
- `specialCases` — greeting/identity/farewell shortcuts.
- `health` — supertest end-to-end with no real keys configured (graceful
  degradation).

## Env vars

See `.env.example`. The only required keys for *anything* to work are
`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (DB) and `GEMINI_API_KEY`
(retrieval) + `GROQ_API_KEY` (LLM). Clerk and ElevenLabs are optional —
the app degrades gracefully without them.

## Deployment (Fly.io)

```bash
flyctl launch --no-deploy --copy-config --name hiriya-api --region fra
flyctl secrets set \
  GEMINI_API_KEY=... \
  GROQ_API_KEY=... \
  ELEVENLABS_API_KEY=... \
  SUPABASE_URL=... \
  SUPABASE_SERVICE_ROLE_KEY=... \
  CLERK_SECRET_KEY=... \
  CORS_ORIGINS=https://hiriya.vercel.app
flyctl deploy
```

After first deploy, run ingestion against production Supabase (locally is
fine — the script uses your `.env`):

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... GEMINI_API_KEY=... \
  npm run ingest
```
