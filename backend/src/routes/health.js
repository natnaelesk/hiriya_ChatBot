import { Router } from 'express';
import { pingDb } from '../db/client.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const db = await pingDb();
  res.json({
    status: db.ok ? 'ok' : 'degraded',
    service: 'hiriya-backend',
    timestamp: new Date().toISOString(),
    checks: {
      db,
      env: {
        gemini: Boolean(process.env.GEMINI_API_KEY),
        groq: Boolean(process.env.GROQ_API_KEY),
        elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
        clerk: Boolean(process.env.CLERK_SECRET_KEY),
        supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      },
    },
  });
});
