import { describe, expect, it } from 'vitest';

import { mapContentSchema, nameSchema, quizUploadSchema } from '../../src/app/lib/schemas';
import { hasAllPathIds, sanitizeSvg } from '../../src/app/lib/svg';
import { seedGames } from './index';

describe('seed games', () => {
  it('has unique ids', () => {
    const ids = seedGames.map((game) => game.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers every game mode', () => {
    const count = (type: string) => seedGames.filter((game) => game.type === type).length;
    expect(count('quiz')).toBe(2);
    expect(count('matchingQuiz')).toBe(2);
    expect(count('map')).toBe(1);
  });

  it.each(seedGames)('$id passes the upload validation', (game) => {
    expect(nameSchema.safeParse(game.name).success).toBe(true);

    if (game.type === 'map') {
      const regions = mapContentSchema.parse(game.content);
      const svg = sanitizeSvg(game.svg ?? '');
      expect(svg).not.toBeNull();
      expect(hasAllPathIds(svg ?? '', Object.keys(regions))).toBe(true);
    } else {
      expect(quizUploadSchema.safeParse({ ...game.content, type: game.type }).success).toBe(true);
    }
  });
});
