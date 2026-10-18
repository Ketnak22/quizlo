'use client';

import StatusMessage from '@/app/components/StatusMessage';
import { pl } from '@/app/i18n/pl';
import { type QuizContent, quizContentSchema } from '@/app/lib/schemas';
import type { GameRecord } from '@/app/types/game';
import styles from './game.module.css';
import GamePanel from './GamePanel';
import { useAnswerGame } from './useAnswerGame';
import { useGameData } from './useGameData';

function parseQuiz(game: GameRecord): QuizContent {
  return quizContentSchema.parse(JSON.parse(game.jsonData));
}

export default function QuizPlayer({ quizId }: { quizId: string }) {
  const quiz = useGameData(quizId, parseQuiz);

  if (quiz.status === 'loading') {
    return <StatusMessage variant="loading">{pl.game.loading}</StatusMessage>;
  }
  if (quiz.status === 'error') {
    return <StatusMessage variant="error">{quiz.message}</StatusMessage>;
  }
  return <QuizBoard quiz={quiz.data} />;
}

function QuizBoard({ quiz }: { quiz: QuizContent }) {
  const game = useAnswerGame(quiz.answers);
  const { keys, headers } = quiz;

  return (
    <div className={styles.quizBoard}>
      <div className={`card ${styles.quizCard}`}>
        <h1 className={styles.title}>{quiz.question}</h1>
        <GamePanel game={game} variant="quiz" />

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            {headers && (
              <thead>
                <tr>
                  <th>{headers[0]}</th>
                  <th>{headers[1]}</th>
                </tr>
              </thead>
            )}
            <tbody>
              {quiz.answers.map((answer, index) => {
                const isGuessed = game.guessed.has(index);
                const isRevealed = isGuessed || game.isFinished;

                return (
                  <tr key={index}>
                    {keys && <td className={styles.keyCell}>{keys[index]}</td>}
                    <td
                      className={`${styles.answerCell} ${isGuessed ? styles.correct : ''} ${
                        isRevealed && !isGuessed ? styles.missed : ''
                      }`}
                    >
                      {isRevealed ? answer : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
