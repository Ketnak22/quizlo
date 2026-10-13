import { describe, expect, it } from 'vitest';

import { pl } from '@/app/i18n/pl';
import { MAX_INPUT_LENGTH } from './config';
import { mapContentSchema, nameSchema, quizUploadSchema } from './schemas';

const tooLong = 'x'.repeat(MAX_INPUT_LENGTH + 1);

const quiz = { type: 'quiz', question: 'Pytanie', answers: ['Odpowiedź'] };
const matchingQuiz = {
  type: 'matchingQuiz',
  question: 'Pytanie',
  answers: ['Warszawa', 'Paryż'],
  keys: ['Polska', 'Francja'],
  headers: ['Kraj', 'Stolica'],
};

function firstError(result: { error?: { issues: { message: string }[] } }) {
  return result.error?.issues[0].message;
}

describe('nameSchema', () => {
  it('trims the name', () => {
    expect(nameSchema.parse('  Stolice  ')).toBe('Stolice');
  });

  it('rejects blank and too long names', () => {
    expect(firstError(nameSchema.safeParse('   '))).toBe(pl.validation.nameEmpty);
    expect(nameSchema.safeParse(tooLong).success).toBe(false);
  });

  it('accepts a name of exactly the maximum length', () => {
    expect(nameSchema.safeParse('x'.repeat(MAX_INPUT_LENGTH)).success).toBe(true);
  });
});

describe('quizUploadSchema', () => {
  it('accepts a plain quiz without keys and headers', () => {
    expect(quizUploadSchema.safeParse(quiz).success).toBe(true);
  });

  it('accepts a complete matching quiz', () => {
    expect(quizUploadSchema.safeParse(matchingQuiz).success).toBe(true);
  });

  it('rejects an unknown type', () => {
    const result = quizUploadSchema.safeParse({ ...quiz, type: 'map' });
    expect(firstError(result)).toBe(pl.validation.typeInvalid);
  });

  it('rejects a quiz without answers', () => {
    const result = quizUploadSchema.safeParse({ ...quiz, answers: [] });
    expect(firstError(result)).toBe(pl.validation.answersRequired);
  });

  it('rejects blank and too long answers', () => {
    expect(quizUploadSchema.safeParse({ ...quiz, answers: ['  '] }).success).toBe(false);
    expect(quizUploadSchema.safeParse({ ...quiz, answers: [tooLong] }).success).toBe(false);
  });

  it('requires one key per answer in a matching quiz', () => {
    const result = quizUploadSchema.safeParse({ ...matchingQuiz, keys: ['Polska'] });
    expect(firstError(result)).toBe(pl.validation.keysMismatch);
  });

  it('requires exactly two headers in a matching quiz', () => {
    const result = quizUploadSchema.safeParse({ ...matchingQuiz, headers: ['Kraj'] });
    expect(firstError(result)).toBe(pl.validation.headersRequired);
  });
});

describe('mapContentSchema', () => {
  it('accepts a mapping of path ids to region names', () => {
    expect(mapContentSchema.parse({ a: ' Europa ' })).toEqual({ a: 'Europa' });
  });

  it('rejects an empty mapping', () => {
    expect(firstError(mapContentSchema.safeParse({}))).toBe(pl.validation.regionsRequired);
  });

  it('rejects blank, too long and non-string region names', () => {
    expect(mapContentSchema.safeParse({ a: ' ' }).success).toBe(false);
    expect(mapContentSchema.safeParse({ a: tooLong }).success).toBe(false);
    expect(mapContentSchema.safeParse({ a: 1 }).success).toBe(false);
  });
});
