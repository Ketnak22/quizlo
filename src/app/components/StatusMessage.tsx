import styles from './StatusMessage.module.css';

interface StatusMessageProps {
  variant: 'loading' | 'error';
  children: React.ReactNode;
}

export default function StatusMessage({ variant, children }: StatusMessageProps) {
  return (
    <div className={styles.status} role={variant === 'error' ? 'alert' : 'status'}>
      {variant === 'loading' && <span className={styles.spinner} aria-hidden="true" />}
      <p className={variant === 'error' ? styles.error : undefined}>{children}</p>
    </div>
  );
}
