import styles from './NavBar.module.css'

import Image from "next/image";

export default function NavBar() {
    return (
        <header className={styles.header}>
        <div className={styles.headerContainer}>
          <a href="/" className={styles.logoLink}>
            <Image className={"logoImage"} src="/logo.svg" width={126} height={44} alt="quizlo" priority />
          </a>
          <nav className={styles.navContainer}>
            <a href="/create/quiz" className={styles.navButton}>Stwórz quiz</a>
            <a href="/create/map" className={styles.navButton}>Prześlij mapę</a>
            <div className={styles.searchHolder}>
              <input type="text" placeholder="Wyszukaj quiz..." className={styles.searchInput} />
              <button type="button" className={styles.searchButton}>
                &#128269;
              </button>
            </div>
          </nav>
        </div>
      </header>
    );
}