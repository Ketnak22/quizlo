import { useState } from 'react';

import { findNewMatches } from '@/app/lib/answers';

export interface AnswerGame {
  input: string;
  guessed: ReadonlySet<number>;
  maxPoints: number;
  isFinished: boolean;
  handleInput: (value: string) => void;
  giveUp: () => void;
}

export function useAnswerGame(answers: readonly string[]): AnswerGame {
  const [input, setInput] = useState('');
  const [guessed, setGuessed] = useState<ReadonlySet<number>>(new Set());
  const [gaveUp, setGaveUp] = useState(false);

  const handleInput = (value: string) => {
    const matches = findNewMatches(value, answers, guessed);
    if (matches.length === 0) {
      setInput(value);
      return;
    }

    setGuessed(new Set([...guessed, ...matches]));
    setInput('');
  };

  return {
    input,
    guessed,
    maxPoints: answers.length,
    isFinished: gaveUp || guessed.size === answers.length,
    handleInput,
    giveUp: () => setGaveUp(true),
  };
}
