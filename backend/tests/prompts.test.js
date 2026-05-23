import { describe, expect, it } from 'vitest';
import { buildSystemMessage, formatWebContext } from '../src/lib/prompts.js';

describe('prompt context formatting', () => {
  it('keeps knowledge-base and web context separate', () => {
    const prompt = buildSystemMessage({
      kbContext: '[1] (id=kb-source-1)\nMain campus context',
      webContext: '[W1] (id=web-source-1)\nFresh web context',
      history: '',
      query: 'Where is the main campus?',
    });

    expect(prompt).toContain('# KNOWLEDGE BASE CONTEXT');
    expect(prompt).toContain('Main campus context');
    expect(prompt).toContain('# WEB CONTEXT');
    expect(prompt).toContain('Fresh web context');
  });

  it('formats web context with stable source ids', () => {
    const context = formatWebContext([
      {
        id: 'web-source-1',
        title: 'Official Page',
        url: 'https://example.edu',
        snippet: 'Current public information.',
      },
    ]);

    expect(context).toContain('id=web-source-1');
    expect(context).toContain('url="https://example.edu"');
    expect(context).toContain('Current public information.');
  });
});
