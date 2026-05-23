import { chat } from '../llm/groq.js';
import { logger } from '../lib/logger.js';

const ENABLED = (process.env.WEB_SEARCH_QUERY_PLANNER ?? 'true').toLowerCase() !== 'false';

const SYSTEM = `You create one high-quality web search query for a university assistant.

Goal:
- Convert the user's message into a precise internet search query.
- Add missing context such as "Ambo University", "Ambo Ethiopia", campus name, office name, or nearby place type when implied.
- Do NOT answer the user.
- Do NOT use citations.
- Output ONLY the search query text.

Examples:
User: where is main campus
Search query: Ambo University main campus location Ambo Ethiopia

User: nearest church
Search query: nearest church to Ambo University main campus Ambo Ethiopia

User: registrar contact
Search query: Ambo University registrar office contact Ethiopia`;

function fallbackQuery(message) {
  const text = String(message ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (/ambo\s+university/i.test(text)) return text;
  return `${text} Ambo University Ambo Ethiopia`;
}

export function cleanSearchQuery(candidate, fallback) {
  const cleaned = String(candidate ?? '')
    .replace(/^search query:\s*/i, '')
    .replace(/^["']|["']$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned || cleaned.length > 220 || /[\n{}[\]]/.test(cleaned)) return fallback;
  return cleaned;
}

export async function planWebSearchQuery(message, history = []) {
  const fallback = fallbackQuery(message);
  if (!ENABLED || !fallback) return fallback;

  const recent = (history ?? [])
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  try {
    const out = await chat({
      messages: [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `Conversation so far:\n${recent || '(none)'}\n\nLatest user message:\n${message}\n\nSearch query:`,
        },
      ],
      maxTokens: 80,
      temperature: 0.0,
    });
    return cleanSearchQuery(out, fallback);
  } catch (err) {
    logger.warn('web search query planning failed (using fallback)', { error: err.message });
    return fallback;
  }
}
