import { pl } from '@/app/i18n/pl';
import styles from './game.module.css';
import type { AnswerGame } from './useAnswerGame';

interface GamePanelProps {
  game: AnswerGame;
  variant: 'quiz' | 'map';
}

export default function GamePanel({ game, variant }: GamePanelProps) {
  const points = game.guessed.size;

  const score = (
    <div className={styles.points}>
      <span>{pl.game.points}</span>
      <p>
        {points} / {game.maxPoints}
      </p>
    </div>
  );

  const answerInput = (
    <input
      type="text"
      className={variant === 'quiz' ? styles.quizInput : undefined}
      aria-label={pl.game.answerLabel}
      placeholder={pl.game.answerPlaceholder}
      value={game.input}
      onChange={(e) => game.handleInput(e.target.value)}
      autoComplete="off"
      autoFocus
    />
  );

  const giveUpButton = (
    <button type="button" className="btn btnDanger" onClick={game.giveUp}>
      {pl.game.giveUp}
    </button>
  );

  const results = (
    <div className={styles.results} role="status">
      <h2>{pl.game.finished}</h2>
      <p>{pl.game.finalScore(points, game.maxPoints)}</p>
      <p>{points === game.maxPoints ? pl.game.perfectScore : pl.game.missedAnswersHint}</p>
    </div>
  );

  if (variant === 'quiz') {
    return (
      <>
        <div className={styles.quizControls}>
          {score}
          {!game.isFinished && giveUpButton}
        </div>
        {game.isFinished ? results : answerInput}
      </>
    );
  }

  return (
    <div className={`card ${styles.panel}`}>
      {score}
      {game.isFinished ? (
        results
      ) : (
        <div className={styles.answerRow}>
          {answerInput}
          {giveUpButton}
        </div>
      )}
    </div>
  );
}
