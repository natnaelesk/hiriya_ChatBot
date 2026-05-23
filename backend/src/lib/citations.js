// Best-effort citation validator.
//
// The system prompt asks the LLM to append [src:CHUNK_ID] tokens after sentences
// that use a fact from the retrieved context. We can't truly verify factuality,
// but we can:
//   1. Extract all citation tokens the model emitted.
//   2. Strip any whose chunk id wasn't actually retrieved (the model invented
//      the id), since those are guaranteed-false citations.
//   3. Surface the validated citation list so the UI can highlight which
//      sources were claimed.

const TOKEN_RE = /\[src:([a-zA-Z0-9_-]{6,80})\]/gi;

export function extractCitations(text) {
  const out = [];
  if (!text) return out;
  let m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(text)) !== null) out.push(m[1]);
  return out;
}

export function validateCitations(text, allowedIds) {
  if (!text) return { text, valid: [], invalid: [] };
  const allowed = new Set((allowedIds ?? []).map(String));
  const valid = new Set();
  const invalid = new Set();
  const cleaned = String(text).replace(TOKEN_RE, (match, id) => {
    if (allowed.has(String(id))) {
      valid.add(id);
      return match; // keep the token in the text
    }
    invalid.add(id);
    return ''; // strip phantom citation
  });
  return {
    text: cleaned.replace(/[ \t]+([.,;:!?])/g, '$1').replace(/[ \t]{2,}/g, ' '),
    valid: [...valid],
    invalid: [...invalid],
  };
}
