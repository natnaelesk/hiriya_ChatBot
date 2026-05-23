import { describe, it, expect } from 'vitest';
import { chunkText } from '../src/rag/chunker.js';

describe('chunkText', () => {
  it('returns empty for empty input', () => {
    expect(chunkText('')).toEqual([]);
    expect(chunkText('   ')).toEqual([]);
  });

  it('produces a single chunk for short text', () => {
    const out = chunkText('Hello world. This is a small document about something.');
    expect(out.length).toBe(1);
    expect(out[0].content).toMatch(/Hello world/);
  });

  it('respects markdown headings as section boundaries', () => {
    const text = `# Section A\n\nA1 content here.\n\n# Section B\n\nB1 content here.`;
    const out = chunkText(text);
    expect(out.length).toBeGreaterThanOrEqual(2);
    expect(out[0].content).toMatch(/Section A/);
    expect(out[1].content).toMatch(/Section B/);
  });

  it('breaks long sections into multiple chunks with overlap', () => {
    const para = 'This is a sentence about Ambo University. '.repeat(60); // ~2400 chars => ~600 tokens
    const out = chunkText(para, { targetTokens: 200, overlapTokens: 30, hardMaxTokens: 240 });
    expect(out.length).toBeGreaterThan(2);
    for (const c of out) {
      expect(Math.ceil(c.content.length / 4)).toBeLessThanOrEqual(280);
    }
  });

  it('strips null bytes', () => {
    const out = chunkText('Hello\u0000world');
    expect(out[0].content).toBe('Helloworld');
  });
});
