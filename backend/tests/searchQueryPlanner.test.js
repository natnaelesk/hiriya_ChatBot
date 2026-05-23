import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/llm/groq.js', () => ({
  chat: vi.fn(),
}));

const { chat } = await import('../src/llm/groq.js');
const { cleanSearchQuery, planWebSearchQuery } = await import('../src/search/searchQueryPlanner.js');

describe('web search query planner', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  it('cleans a model-generated search query', () => {
    expect(cleanSearchQuery('Search query: "Ambo University main campus location"', 'fallback')).toBe(
      'Ambo University main campus location',
    );
  });

  it('uses the LLM to turn vague user text into a better web query', async () => {
    process.env.WEB_SEARCH_QUERY_PLANNER = 'true';
    chat.mockResolvedValue('Ambo University main campus location Ambo Ethiopia');

    await expect(planWebSearchQuery('where is main campus')).resolves.toBe(
      'Ambo University main campus location Ambo Ethiopia',
    );
    expect(chat).toHaveBeenCalledOnce();
  });

  it('falls back to an Ambo University query if planning fails', async () => {
    process.env.WEB_SEARCH_QUERY_PLANNER = 'true';
    chat.mockRejectedValue(new Error('llm unavailable'));

    await expect(planWebSearchQuery('nearest church')).resolves.toBe(
      'nearest church Ambo University Ambo Ethiopia',
    );
  });
});
