import { Router } from 'express';
import { synthesize } from '../tts/elevenlabs.js';
import { logger } from '../lib/logger.js';

export const ttsRouter = Router();

ttsRouter.post('/', async (req, res) => {
  const text = req.body?.text;
  if (typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Body must include a non-empty `text` string.' });
  }
  try {
    const stream = await synthesize(text, { voiceId: req.body?.voiceId });
    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'no-store');
    if (typeof stream.pipe === 'function') {
      stream.pipe(res);
      return;
    }
    // Web ReadableStream from undici fetch
    for await (const chunk of stream) {
      res.write(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    res.end();
  } catch (err) {
    logger.warn('tts failed', { error: err.message });
    const status = err.status || 500;
    res.status(status).json({ error: err.expose ? err.message : 'TTS failed' });
  }
});
