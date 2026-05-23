import { describe, it, expect } from 'vitest';
import { reciprocalRankFusion } from '../src/rag/retriever.js';

describe('reciprocalRankFusion', () => {
  it('fuses two ranked lists giving boost to items high in both', () => {
    const A = [{ id: '1' }, { id: '2' }, { id: '3' }];
    const B = [{ id: '2' }, { id: '4' }, { id: '1' }];
    const fused = reciprocalRankFusion([A, B]);
    expect(fused[0].id).toBe('2');
    // id=1 is rank 0 in A and rank 2 in B → should beat 4 (only present in B)
    const ids = fused.map((x) => x.id);
    expect(ids.indexOf('1')).toBeLessThan(ids.indexOf('4'));
  });

  it('handles empty lists', () => {
    expect(reciprocalRankFusion([[], []])).toEqual([]);
  });

  it('preserves item shape from the first list it appeared in', () => {
    const A = [{ id: '1', src: 'A' }, { id: '2', src: 'A' }];
    const B = [{ id: '2', src: 'B' }, { id: '3', src: 'B' }];
    const fused = reciprocalRankFusion([A, B]);
    const two = fused.find((x) => x.id === '2');
    expect(two.src).toBe('A');
  });
});
