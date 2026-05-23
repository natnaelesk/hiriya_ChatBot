import { describe, it, expect } from 'vitest';
import { tryShortcut } from '../src/lib/specialCases.js';

describe('tryShortcut', () => {
  it('matches greetings (case insensitive, with punctuation)', () => {
    expect(tryShortcut('hi')).toMatch(/Hiriya/);
    expect(tryShortcut('hy')).toMatch(/Hiriya/);
    expect(tryShortcut('Hello!')).toMatch(/Hiriya/);
    expect(tryShortcut('Selam')).toMatch(/Hiriya/);
  });

  it('matches farewells', () => {
    expect(tryShortcut('bye')).toMatch(/Goodbye/);
    expect(tryShortcut('see you')).toMatch(/Goodbye/);
  });

  it('matches identity questions', () => {
    expect(tryShortcut('Who are you?')).toMatch(/Hiriya/);
    expect(tryShortcut('What are you?')).toMatch(/Hiriya/);
    expect(tryShortcut('Tell me about yourself.')).toMatch(/Hiriya/);
  });

  it('matches creator question', () => {
    expect(tryShortcut('Who built you?')).toMatch(/Natnael Eskinder|Developer's Club/);
  });

  it('returns null for substantive questions', () => {
    expect(tryShortcut('What programs are offered at Ambo University?')).toBeNull();
    expect(tryShortcut('Where is the library located on the main campus?')).toBeNull();
  });

  it('does not match the word "thanks" inside a longer sentence', () => {
    expect(tryShortcut('Can you give me thanks-related ceremony info?')).toBeNull();
  });

  it('handles empty / whitespace inputs', () => {
    expect(tryShortcut('')).toBeNull();
    expect(tryShortcut('   ')).toBeNull();
  });
});
