import { Router } from 'express';
import { retrieve } from '../rag/retriever.js';
import { rerank } from '../rag/reranker.js';
import { rewriteQuery } from '../rag/queryRewriter.js';
import { streamChat } from '../llm/groq.js';
import { buildSystemMessage, formatContext, formatHistory, formatWebContext } from '../lib/prompts.js';
import { tryShortcut } from '../lib/specialCases.js';
import { openSseStream } from '../lib/sse.js';
import { getDb } from '../db/client.js';
import { logger } from '../lib/logger.js';
import { validateCitations } from '../lib/citations.js';
import { searchWeb } from '../search/duckduckgo.js';
import { planWebSearchQuery } from '../search/searchQueryPlanner.js';

const CANDIDATES = Number(process.env.RAG_CANDIDATES ?? 20);
const TOP_K = Number(process.env.RAG_TOP_K ?? 5);
const WEB_MAX_RESULTS = Number(process.env.WEB_SEARCH_MAX_RESULTS ?? 5);

export const chatRouter = Router();

const TITLE_MAX = 60;

async function ensureChat(db, userId, chatId) {
  if (chatId) {
    const { data, error } = await db.from('chats').select('id, user_id').eq('id', chatId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    if (data.user_id !== userId) return null;
    return data;
  }
  const { data, error } = await db
    .from('chats')
    .insert({ user_id: userId, title: null })
    .select('id, user_id')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

async function loadHistory(db, chatId, limit = 20) {
  const { data, error } = await db
    .from('messages')
    .select('role, content')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) {
    logger.warn('failed to load history', { chatId, error: error.message });
    return [];
  }
  return data ?? [];
}

async function persistTurn(db, chatId, userMessage, assistantMessage, sources) {
  if (!chatId) return;
  const { error } = await db.from('messages').insert([
    { chat_id: chatId, role: 'user', content: userMessage, sources: [] },
    { chat_id: chatId, role: 'assistant', content: assistantMessage, sources },
  ]);
  if (error) logger.warn('failed to persist messages', { chatId, error: error.message });

  // First-message auto-title.
  const title = userMessage.replace(/\s+/g, ' ').trim().slice(0, TITLE_MAX);
  await db.from('chats').update({ title }).eq('id', chatId).is('title', null);
}

chatRouter.post('/', async (req, res) => {
  const { message, chatId, history: clientHistory } = req.body ?? {};
  if (typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Body must include a non-empty `message`.' });
  }
  const userMsg = message.trim();
  const userId = req.auth?.userId ?? null; // populated by clerk middleware (Phase 4)
  const wantsPersist = Boolean(userId);

  const sse = openSseStream(res);
  let aborted = false;
  req.on('close', () => {
    aborted = true;
  });

  try {
    sse.send('start', { ts: Date.now() });

    // 1. Special-case shortcuts: greetings/farewells/identity.
    const shortcut = tryShortcut(userMsg);
    if (shortcut) {
      sse.send('sources', { sources: [] });
      // Stream char-by-char-ish for parity with LLM path.
      for (const piece of shortcut.match(/.{1,12}/gs) ?? [shortcut]) {
        if (aborted) break;
        sse.send('delta', { text: piece });
      }
      sse.send('done', { reason: 'shortcut' });
      sse.close();

      if (wantsPersist) {
        try {
          const db = getDb();
          let chat = await ensureChat(db, userId, chatId);
          if (chat) await persistTurn(db, chat.id, userMsg, shortcut, []);
        } catch (err) {
          logger.warn('persist (shortcut) failed', { error: err.message });
        }
      }
      return;
    }

    // 2a. Load conversation history first (needed for query rewriting).
    let history = [];
    let chat = null;
    if (wantsPersist) {
      try {
        const db = getDb();
        chat = await ensureChat(db, userId, chatId);
        if (chat) {
          history = await loadHistory(db, chat.id);
          sse.send('chat', { chatId: chat.id });
        }
      } catch (err) {
        logger.warn('chat init failed (continuing as guest)', { error: err.message });
      }
    } else if (Array.isArray(clientHistory)) {
      history = clientHistory.filter(
        (m) => m && typeof m.role === 'string' && typeof m.content === 'string',
      );
    }

    // 2b. Rewrite the query for retrieval if it depends on prior turns.
    const retrievalQuery = await rewriteQuery(userMsg, history);
    if (retrievalQuery !== userMsg) {
      logger.debug('query rewritten for retrieval', {
        original: userMsg,
        rewritten: retrievalQuery,
      });
    }

    // 2c. Retrieve a wide KB candidate pool and always blend with web snippets.
    let chunks = [];
    let webSources = [];
    try {
      const kbPromise = retrieve(retrievalQuery, { topK: CANDIDATES, candidates: CANDIDATES }).then(
        (candidates) => rerank(retrievalQuery, candidates, { topN: TOP_K }),
      );
      const webPromise = planWebSearchQuery(userMsg, history).then((webQuery) => {
        if (webQuery !== userMsg) {
          logger.debug('query planned for web search', { original: userMsg, webQuery });
        }
        return searchWeb(webQuery, { maxResults: WEB_MAX_RESULTS });
      });
      [chunks, webSources] = await Promise.all([kbPromise, webPromise]);
    } catch (err) {
      logger.error('retrieve failed', { error: err.message });
      sse.send('error', { code: 'retrieval_failed', message: err.message });
      sse.close();
      return;
    }

    const kbSources = chunks.map((c) => ({
      id: c.id,
      type: 'kb',
      title: c.document?.title ?? null,
      source: c.document?.source ?? null,
      score: typeof c.score === 'number' ? Number(c.score.toFixed(4)) : null,
      rerankScore: typeof c.rerankScore === 'number' ? c.rerankScore : null,
      snippet: c.content.slice(0, 240),
    }));
    const sources = [...kbSources, ...webSources];
    sse.send('sources', { sources });

    // 3. Build the prompt.
    const systemContent = buildSystemMessage({
      kbContext: formatContext(chunks),
      webContext: formatWebContext(webSources),
      history: formatHistory(history),
      query: userMsg,
    });
    const messages = [
      { role: 'system', content: systemContent },
      ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMsg },
    ];

    // 4. Stream Groq response, accumulating for persistence.
    let stream;
    try {
      stream = await streamChat({ messages, maxTokens: 1400 });
    } catch (err) {
      logger.error('llm start failed', { error: err.message });
      sse.send('error', { code: 'llm_failed', message: err.message });
      sse.close();
      return;
    }

    let assistantText = '';
    try {
      for await (const part of stream) {
        if (aborted) break;
        const delta = part.choices?.[0]?.delta?.content ?? '';
        if (delta) {
          assistantText += delta;
          sse.send('delta', { text: delta });
        }
      }
    } catch (err) {
      logger.error('llm stream errored', { error: err.message });
      sse.send('error', { code: 'llm_stream_failed', message: err.message });
    }

    // 4b. Citation hygiene: strip any phantom [src:UUID] tokens the model invented.
    const allowedIds = [...chunks.map((c) => c.id), ...webSources.map((s) => s.id)];
    const cleaned = validateCitations(assistantText, allowedIds);
    if (cleaned.invalid.length > 0) {
      logger.warn('stripped invalid citations', { invalid: cleaned.invalid });
    }
    sse.send('done', { length: cleaned.text.length, citedSourceIds: cleaned.valid });
    sse.close();

    // 5. Persist (best-effort, after stream closes).
    if (chat && cleaned.text) {
      try {
        await persistTurn(getDb(), chat.id, userMsg, cleaned.text, sources);
      } catch (err) {
        logger.warn('persist (chat) failed', { error: err.message });
      }
    }
  } catch (err) {
    logger.error('chat handler crashed', { error: err.message, stack: err.stack });
    try {
      sse.send('error', { code: 'unknown', message: err.message });
      sse.close();
    } catch {
      // socket already gone
    }
  }
});
