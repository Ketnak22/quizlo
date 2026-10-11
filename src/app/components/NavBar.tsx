import Image from 'next/image';
import Link from 'next/link';

import { pl } from '@/app/i18n/pl';
import styles from './NavBar.module.css';

export default function NavBar() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link href="/" className={styles.logoLink}>
          <Image src="/logo.svg" width={126} height={44} alt={pl.nav.logoAlt} priority />
        </Link>
        <nav className={styles.nav}>
          <Link href="/create/quiz" className="btn btnPrimary">
            {pl.nav.createQuiz}
          </Link>
          <Link href="/create/map" className="btn btnPrimary">
            {pl.nav.uploadMap}
          </Link>
        </nav>
      </div>
    </header>
  );
}
