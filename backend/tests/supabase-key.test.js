import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('getDb publishable key guard', () => {
  const origUrl = process.env.SUPABASE_URL;
  const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    vi.resetModules();
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_publishable_testkey123';
  });

  afterEach(() => {
    process.env.SUPABASE_URL = origUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = origKey;
  });

  it('throws before creating a client when the key is publishable', async () => {
    const { getDb } = await import('../src/db/client.js');
    expect(() => getDb()).toThrow(/publishable key/);
  });
});
