import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  normalizeDuckDuckGoHtml,
  normalizeDuckDuckGoInstant,
  searchWeb,
} from '../src/search/duckduckgo.js';

describe('DuckDuckGo web search', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it('normalizes DuckDuckGo HTML results into frontend source objects', () => {
    const out = normalizeDuckDuckGoHtml(`
      <div class="result">
        <a class="result__a" href="/l/?uddg=https%3A%2F%2Fexample.edu%2Finfo">Official Site</a>
        <a class="result__snippet">Useful result snippet.</a>
      </div>
    `);

    expect(out).toEqual([
      {
        id: 'web-source-1',
        type: 'web',
        title: 'Official Site',
        source: 'https://example.edu/info',
        url: 'https://example.edu/info',
        score: null,
        snippet: 'Useful result snippet.',
      },
    ]);
  });

  it('normalizes DuckDuckGo Lite results', () => {
    const out = normalizeDuckDuckGoHtml(`
      <table>
        <tr>
          <td>1.</td>
          <td>
            <a rel="nofollow" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.edu%2Finfo" class="result-link">Official Site</a>
          </td>
        </tr>
        <tr>
          <td></td>
          <td class="result-snippet">Useful lite snippet.</td>
        </tr>
      </table>
    `);

    expect(out[0]).toMatchObject({
      id: 'web-source-1',
      type: 'web',
      title: 'Official Site',
      url: 'https://example.edu/info',
      snippet: 'Useful lite snippet.',
    });
  });

  it('filters web map service results so maps come from locations.json only', () => {
    const out = normalizeDuckDuckGoHtml(`
      <div class="result">
        <a class="result__a" href="https://maps.google.com/">Google Maps</a>
        <a class="result__snippet">Map result.</a>
      </div>
      <div class="result">
        <a class="result__a" href="https://example.edu/info">Official Site</a>
        <a class="result__snippet">Useful result snippet.</a>
      </div>
    `);

    expect(out).toHaveLength(1);
    expect(out[0].url).toBe('https://example.edu/info');
  });

  it('normalizes DuckDuckGo instant answers', () => {
    const out = normalizeDuckDuckGoInstant({
      Heading: 'Ambo University',
      AbstractText: 'Ambo University is a public university.',
      AbstractURL: 'https://example.edu/ambo',
    });

    expect(out[0]).toMatchObject({
      id: 'web-source-1',
      type: 'web',
      title: 'Ambo University',
      url: 'https://example.edu/ambo',
      snippet: 'Ambo University is a public university.',
    });
  });

  it('does not call fetch when web search is disabled', async () => {
    process.env.WEB_SEARCH_ENABLED = 'false';
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(searchWeb('Ambo University')).resolves.toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns normalized HTML results from DuckDuckGo', async () => {
    process.env.WEB_SEARCH_ENABLED = 'true';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => `
        <div class="result">
          <a class="result__a" href="https://example.com">Result</a>
          <a class="result__snippet">A web snippet</a>
        </div>
      `,
    });

    const results = await searchWeb('query', { maxResults: 1, timeoutMs: 100 });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: 'web-source-1',
      type: 'web',
      title: 'Result',
      url: 'https://example.com/',
    });
  });
});
