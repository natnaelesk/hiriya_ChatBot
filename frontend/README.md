# `frontend/` — Hiriya UI

Vite 7 + React 19 + Tailwind 4. Talks to the backend over HTTP + SSE; never
holds provider API keys.

## Run locally

```bash
cd frontend
cp .env.example .env.local
# set VITE_API_URL=http://localhost:3001
# (optionally) set VITE_CLERK_PUBLISHABLE_KEY
npm install
npm run dev
```

Open <http://localhost:5173>.

## Env vars

| Var                            | Required? | What it does                                          |
| ------------------------------ | --------- | ----------------------------------------------------- |
| `VITE_API_URL`                 | yes       | Backend base URL (e.g. `https://hiriya-api.fly.dev`). |
| `VITE_CLERK_PUBLISHABLE_KEY`   | optional  | Enables sign-in. Without it, the app is guest-only.   |

## Architecture (high level)

```
App.jsx
 ├─ Sidebar          ← chat list (signed-in users only)
 ├─ Navbar           ← theme + Clerk SignIn/UserButton
 ├─ WelcomeScreen    ← prompt chips when no messages yet
 ├─ ChatMessages     ← Markdown + Sources panel + TTS button
 │   └─ Sources      ← collapsible citations
 ├─ ErrorBanner      ← friendly mapping of backend error codes
 └─ ChatInput        ← auto-resize textarea + send/cancel button

Hooks
 ├─ useAuthToken     ← stable getToken() that no-ops without ClerkProvider
 ├─ useChat          ← messages, streaming, send/cancel/clear, guest persistence
 └─ useChats         ← server-backed chat list for signed-in users

services/apiClient.js   ← single source of truth for backend HTTP/SSE
services/ttsService.js  ← talks to /api/tts; falls back to Web Speech API
```

## Tests

```bash
npm test
```

Covers:

- `<Sources />` toggle / count.
- `<ErrorBanner />` code → friendly copy mapping.
- `<WelcomeScreen />` chips fire `onPick`.

## Deployment (Vercel)

`vercel.json` sets the framework, build command, and SPA rewrites. Configure
the env vars in the Vercel dashboard, then push to `main`.
