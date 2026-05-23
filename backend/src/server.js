import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { ragRouter } from './routes/rag.js';
import { chatRouter } from './routes/chat.js';
import { chatsRouter } from './routes/chats.js';
import { ttsRouter } from './routes/tts.js';
import { errorHandler, notFound } from './middleware/error.js';
import { attachAuth } from './middleware/clerk.js';

export function createServer() {
  const app = express();

  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (origins.includes('*') || origins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(attachAuth());

  app.get('/', (_req, res) => {
    res.json({
      service: 'hiriya-backend',
      version: '0.1.0',
      docs: '/api/health',
    });
  });

  app.use('/api/health', healthRouter);
  app.use('/api/rag', ragRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/chats', chatsRouter);
  app.use('/api/tts', ttsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
