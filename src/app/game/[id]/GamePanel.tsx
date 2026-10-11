import { pl } from '@/app/i18n/pl';
import styles from './game.module.css';
import type { AnswerGame } from './useAnswerGame';

export default function GamePanel({ game }: { game: AnswerGame }) {
  const points = game.guessed.size;

  return (
    <div className={`card ${styles.panel}`}>
      <div className={styles.points}>
        <span>{pl.game.points}</span>
        <p>
          {points} / {game.maxPoints}
        </p>
      </div>

      {game.isFinished ? (
        <div className={styles.results} role="status">
          <h2>{pl.game.finished}</h2>
          <p>{pl.game.finalScore(points, game.maxPoints)}</p>
          <p>{points === game.maxPoints ? pl.game.perfectScore : pl.game.missedAnswersHint}</p>
        </div>
      ) : (
        <div className={styles.answerRow}>
          <input
            type="text"
            aria-label={pl.game.answerLabel}
            placeholder={pl.game.answerPlaceholder}
            value={game.input}
            onChange={(e) => game.handleInput(e.target.value)}
            autoComplete="off"
            autoFocus
          />
          <button type="button" className="btn btnDanger" onClick={game.giveUp}>
            {pl.game.giveUp}
          </button>
        </div>
      )}
    </div>
  );
}
