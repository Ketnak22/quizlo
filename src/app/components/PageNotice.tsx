import styles from './PageNotice.module.css';

interface PageNoticeProps {
  title: string;
  body: string;
  children: React.ReactNode;
}

/** Full-page message used by the 404 and error screens. */
export default function PageNotice({ title, body, children }: PageNoticeProps) {
  return (
    <div className={`card ${styles.notice}`}>
      <h1>{title}</h1>
      <p>{body}</p>
      {children}
    </div>
  );
}
