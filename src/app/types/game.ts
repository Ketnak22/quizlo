export type GameType = 'quiz' | 'matchingQuiz' | 'map';

export interface GameSummary {
  id: string;
  name: string;
}

/** A game as returned by `/api/game/[id]`. `jsonData` holds the serialized game content. */
export interface GameRecord {
  type: GameType;
  name: string;
  jsonData: string;
  svgData: string | null;
}
