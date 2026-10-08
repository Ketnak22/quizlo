import removePolishChars from '@/app/utils/removePolishChars';

export function normalizeAnswer(text: string): string {
  return removePolishChars(text).toLowerCase();
}

/**
 * Returns the indexes of all not-yet-guessed answers that match the input. Identical answers match
 * together, so a quiz that repeats an answer never makes the player type it twice.
 */
export function findNewMatches(
  input: string,
  answers: readonly string[],
  guessed: ReadonlySet<number>,
): number[] {
  const normalizedInput = normalizeAnswer(input);
  if (normalizedInput === '') return [];

  return answers.flatMap((answer, index) =>
    !guessed.has(index) && normalizeAnswer(answer) === normalizedInput ? [index] : [],
  );
}
