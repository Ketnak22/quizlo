import Link from 'next/link';

import { pl } from './i18n/pl';
import { REPO_URL } from './lib/config';
import { getGameSummaries, getPopularGames } from './lib/firebase';
import styles from './page.module.css';
import QuizSelector from './QuizSelector';

// The list comes from Firestore and must stay fresh, so never prerender this page at build time.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const [games, popularGames] = await Promise.all([getGameSummaries(), getPopularGames()]);

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentWrapper}>
        <section className={styles.quizListSection}>
          <div className={styles.titleHolder}>
            <h1>{pl.home.welcome}</h1>
            <h2>{pl.home.availableQuizzes}</h2>
          </div>
          <div className={styles.quizList}>
            {games.length > 0 ? <QuizSelector quizzes={games} /> : <p>{pl.home.noQuizzes}</p>}
          </div>
        </section>

        {popularGames.length > 0 && (
          <aside className={styles.popularQuizzesSidebar}>
            <h3>{pl.home.popularQuizzes}</h3>
            <ul>
              {popularGames.map((game) => (
                <li key={game.id}>
                  <Link href={`/game/${game.id}`}>{game.name}</Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      <section className={styles.about}>
        <h3>{pl.home.aboutTitle}</h3>
        <p>{pl.home.aboutBody}</p>
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          {pl.home.repoLink}
        </a>
      </section>
    </div>
  );
}
