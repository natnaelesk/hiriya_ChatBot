import { describe, it, expect } from 'vitest';
import { extractCitations, validateCitations } from '../src/lib/citations.js';

describe('extractCitations', () => {
  it('extracts ids from [src:UUID] tokens', () => {
    const text = 'Foo [src:abc12345] bar baz [src:def67890].';
    expect(extractCitations(text)).toEqual(['abc12345', 'def67890']);
  });
  it('returns [] when no citations are present', () => {
    expect(extractCitations('plain text')).toEqual([]);
    expect(extractCitations('')).toEqual([]);
    expect(extractCitations(null)).toEqual([]);
  });
});

describe('validateCitations', () => {
  it('keeps tokens whose ids are in the allow-list', () => {
    const r = validateCitations('Foo [src:abc12345] bar.', ['abc12345']);
    expect(r.text).toBe('Foo [src:abc12345] bar.');
    expect(r.valid).toEqual(['abc12345']);
    expect(r.invalid).toEqual([]);
  });
  it('strips invented citations and reports them', () => {
    const r = validateCitations('Foo [src:phantom1] bar [src:real0001].', ['real0001']);
    expect(r.text).toMatch(/Foo\s+bar \[src:real0001\]\./);
    expect(r.valid).toEqual(['real0001']);
    expect(r.invalid).toEqual(['phantom1']);
  });
  it('handles empty input gracefully', () => {
    const r = validateCitations('', ['abc']);
    expect(r.text).toBe('');
    expect(r.valid).toEqual([]);
    expect(r.invalid).toEqual([]);
  });
});
