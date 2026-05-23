import { Router } from 'express';
import { retrieve } from '../rag/retriever.js';
import { logger } from '../lib/logger.js';

export const ragRouter = Router();

ragRouter.post('/query', async (req, res) => {
  const { query, k, candidates, threshold, hybrid } = req.body ?? {};
  if (typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'Body must include a non-empty `query` string.' });
  }

  try {
    const chunks = await retrieve(query.trim(), {
      topK: typeof k === 'number' ? k : undefined,
      candidates: typeof candidates === 'number' ? candidates : undefined,
      threshold: typeof threshold === 'number' ? threshold : undefined,
      hybrid: typeof hybrid === 'boolean' ? hybrid : undefined,
    });

    const sources = chunks.map((c) => ({
      id: c.id,
      title: c.document?.title ?? null,
      source: c.document?.source ?? null,
      score: typeof c.score === 'number' ? Number(c.score.toFixed(4)) : null,
    }));

    res.json({
      query,
      chunks: chunks.map((c) => ({
        id: c.id,
        content: c.content,
        score: c.score,
        document: c.document,
      })),
      sources,
    });
  } catch (err) {
    logger.error('rag/query failed', { error: err.message });
    res.status(500).json({ error: 'Retrieval failed', detail: err.message });
  }
});
