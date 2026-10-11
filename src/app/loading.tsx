import StatusMessage from './components/StatusMessage';
import { pl } from './i18n/pl';

export default function Loading() {
  return <StatusMessage variant="loading">{pl.loading}</StatusMessage>;
}
