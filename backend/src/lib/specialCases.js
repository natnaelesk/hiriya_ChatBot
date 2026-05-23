// Lightweight rule-based shortcuts for greetings, identity questions, etc.
// Bypassing the full RAG pipeline for these:
//   - is much faster (no Gemini, no Groq, no DB),
//   - avoids weird-looking citations on small talk,
//   - keeps the persona warm.
//
// Must be conservative: when in doubt, fall through to the full pipeline.

// Include short/casual spellings (e.g. "hy") so they don't hit RAG and get a false "not in knowledge base".
const GREET =
  /^\s*(hi|hii+|hy|hey+|yo|hola|selam|salam|salem|salom|halo|hello+)[\s!.?,]*$/i;
const HOWAREYOU = /^\s*(how\s+are\s+you|how['’]?s\s+it\s+going|sup|what['’]?s\s+up)[\s!.?,]*$/i;
const THANKS = /\b(thank(s| ?you)|thx|amesegen[a-z]*)\b/i;
const BYE = /^\s*(bye|goodbye|see\s+you|cya|farewell|ciao)[\s!.?,]*$/i;
const WHO = /\b(who|what)\s+(are|is)\s+you\b|tell\s+me\s+about\s+yourself/i;
const CREATOR = /\b(who\s+(made|created|built)|who['’]?s?\s+your\s+(creator|developer|maker))\b/i;

export function tryShortcut(message) {
  const m = String(message ?? '').trim();
  if (!m) return null;

  if (GREET.test(m)) {
    return "Selam! I'm **Hiriya**, your Ambo University assistant. What can I help you with today?";
  }
  if (HOWAREYOU.test(m)) {
    return "I'm doing great, thanks for asking! Ready to help you with anything about **Ambo University** — admissions, programs, campus locations, you name it.";
  }
  if (THANKS.test(m) && m.split(/\s+/).length <= 4) {
    return "You're very welcome! Anything else you'd like to know about **Ambo University**?";
  }
  if (BYE.test(m)) {
    return 'Goodbye! Wishing you a wonderful day at **Ambo University**. Come back anytime.';
  }
  if (WHO.test(m)) {
    return "I'm **Hiriya**, the AI assistant for **Ambo University** in Ethiopia. I help students and visitors with information about campuses, programs, services, and more.";
  }
  if (CREATOR.test(m)) {
    return "Hiriya was created by the **Ambo University Developer's Club**; **Natnael Eskinder** is the club leader.";
  }
  return null;
}
