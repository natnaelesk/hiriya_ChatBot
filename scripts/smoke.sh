#!/usr/bin/env bash
# Smoke test the deployed Hiriya backend.
#
# Usage:
#   ./scripts/smoke.sh https://hiriya-api.fly.dev
#
# Exits non-zero if any check fails.
set -euo pipefail

API_URL="${1:-${API_URL:-http://localhost:3001}}"
API_URL="${API_URL%/}"

green() { printf '\033[32m%s\033[0m\n' "$*"; }
red()   { printf '\033[31m%s\033[0m\n' "$*"; }
bold()  { printf '\033[1m%s\033[0m\n' "$*"; }

bold "🩺 Smoke testing $API_URL"

# 1. Health
echo
bold "1. GET /api/health"
HEALTH_BODY="$(curl -fsS "$API_URL/api/health")"
echo "$HEALTH_BODY"
echo "$HEALTH_BODY" | grep -q '"service":"hiriya-backend"' || { red "✗ unexpected health body"; exit 1; }
green "✓ health responded"

# 2. Greeting shortcut over /api/chat (no Gemini/Groq required)
echo
bold "2. POST /api/chat (greeting shortcut)"
RESP="$(curl -fsS -N -X POST "$API_URL/api/chat" \
  -H 'Content-Type: application/json' \
  -d '{"message":"hello"}' \
  --max-time 15 || true)"
echo "$RESP" | head -8
echo "$RESP" | grep -q 'event: delta' || { red "✗ no SSE delta from greeting shortcut"; exit 1; }
green "✓ chat shortcut streamed"

# 3. RAG query (only meaningful if backend has Gemini + Supabase configured)
echo
bold "3. POST /api/rag/query (skipped if RAG keys missing)"
RAG_RESP="$(curl -sS -X POST "$API_URL/api/rag/query" \
  -H 'Content-Type: application/json' \
  -d '{"query":"What programs does Ambo University offer?","k":3}' || true)"
if echo "$RAG_RESP" | grep -q '"chunks"'; then
  green "✓ RAG query returned chunks"
elif echo "$RAG_RESP" | grep -q 'GEMINI_API_KEY missing\|SUPABASE'; then
  echo "$RAG_RESP"
  echo "(skipping — RAG keys not configured)"
else
  red "✗ unexpected RAG response: $RAG_RESP"
  exit 1
fi

echo
green "All smoke checks passed for $API_URL"
