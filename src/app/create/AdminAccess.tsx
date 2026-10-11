import { pl } from '@/app/i18n/pl';
import styles from './creator.module.css';

interface AdminAccessProps {
  uploadsEnabled: boolean;
  token: string;
  onTokenChange: (token: string) => void;
}

export default function AdminAccess({ uploadsEnabled, token, onTokenChange }: AdminAccessProps) {
  if (!uploadsEnabled) {
    return <p className={styles.notice}>{pl.creator.demoNotice}</p>;
  }

  return (
    <div className={styles.notice}>
      <p>{pl.creator.tokenNotice}</p>
      <label className={styles.field}>
        <span>{pl.creator.tokenLabel}</span>
        <input
          type="password"
          placeholder={pl.creator.tokenPlaceholder}
          value={token}
          onChange={(e) => onTokenChange(e.target.value)}
          autoComplete="off"
        />
      </label>
    </div>
  );
}
