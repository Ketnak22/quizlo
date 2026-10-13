import { describe, expect, it } from 'vitest';

import { findNewMatches, normalizeAnswer } from './answers';

const NONE = new Set<number>();

describe('normalizeAnswer', () => {
  it('ignores case, diacritics and extra whitespace', () => {
    expect(normalizeAnswer('  ŁÓDŹ  ')).toBe(normalizeAnswer('lodz'));
    expect(normalizeAnswer('Ameryka   Północna')).toBe('ameryka polnocna');
  });
});

describe('findNewMatches', () => {
  const answers = ['Warszawa', 'Kraków', 'Łódź'];

  it('finds an exact answer', () => {
    expect(findNewMatches('Kraków', answers, NONE)).toEqual([1]);
  });

  it('accepts input without Polish letters and in any case', () => {
    expect(findNewMatches('krakow', answers, NONE)).toEqual([1]);
    expect(findNewMatches('LODZ', answers, NONE)).toEqual([2]);
  });

  it('returns nothing for a partial or wrong answer', () => {
    expect(findNewMatches('Krak', answers, NONE)).toEqual([]);
    expect(findNewMatches('Gdańsk', answers, NONE)).toEqual([]);
  });

  it('skips answers that were already guessed', () => {
    expect(findNewMatches('krakow', answers, new Set([1]))).toEqual([]);
  });

  it('matches every occurrence of a repeated answer at once', () => {
    expect(findNewMatches('tak', ['tak', 'nie', 'Tak'], NONE)).toEqual([0, 2]);
    expect(findNewMatches('tak', ['tak', 'nie', 'Tak'], new Set([0]))).toEqual([2]);
  });

  it('never matches blank input', () => {
    expect(findNewMatches('', answers, NONE)).toEqual([]);
    expect(findNewMatches('   ', ['', ' '], NONE)).toEqual([]);
  });
});
