import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

let app;

beforeAll(async () => {
  // Ensure no real Supabase calls happen.
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.CLERK_SECRET_KEY;
  const { createServer } = await import('../src/server.js');
  app = createServer();
});

describe('GET /api/health', () => {
  it('returns ok=false when supabase is not configured', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('hiriya-backend');
    expect(res.body.checks.db.ok).toBe(false);
    expect(res.body.checks.env.supabase).toBe(false);
  });
});

describe('POST /api/rag/query', () => {
  it('rejects empty query', async () => {
    const res = await request(app).post('/api/rag/query').send({ query: '' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/chats', () => {
  it('requires auth (401 when no token)', async () => {
    const res = await request(app).get('/api/chats');
    expect(res.status).toBe(401);
  });
});
