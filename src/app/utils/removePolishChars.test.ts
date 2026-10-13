import { describe, expect, it } from 'vitest';

import removePolishChars from './removePolishChars';

describe('removePolishChars', () => {
  it('replaces lowercase and uppercase Polish letters', () => {
    expect(removePolishChars('zażółć gęślą jaźń')).toBe('zazolc gesla jazn');
    expect(removePolishChars('ĄĆĘŁŃÓŚŹŻ')).toBe('ACELNOSZZ');
  });

  it('handles letters written in decomposed Unicode form', () => {
    expect(removePolishChars('Gdańsk'.normalize('NFD'))).toBe('Gdansk');
  });

  it('trims and collapses whitespace', () => {
    expect(removePolishChars('  Nowy \t  Jork\n')).toBe('Nowy Jork');
  });

  it('leaves other characters untouched', () => {
    expect(removePolishChars('Quiz-123!')).toBe('Quiz-123!');
    expect(removePolishChars('')).toBe('');
  });
});
