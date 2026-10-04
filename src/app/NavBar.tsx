import Image from 'next/image';
import Link from 'next/link';

import styles from './NavBar.module.css';

export default function NavBar() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link href="/" className={styles.logoLink}>
          <Image src="/logo.svg" width={126} height={44} alt="quizlo" priority />
        </Link>
        <nav className={styles.navContainer}>
          <Link href="/create/quiz" className={styles.navButton}>
            Stwórz quiz
          </Link>
          <Link href="/create/map" className={styles.navButton}>
            Prześlij mapę
          </Link>
        </nav>
      </div>
    </header>
  );
}
