import Link from 'next/link';

import PageNotice from './components/PageNotice';
import { pl } from './i18n/pl';

export default function NotFound() {
  return (
    <PageNotice title={pl.notFound.title} body={pl.notFound.body}>
      <Link href="/" className="btn btnPrimary">
        {pl.notFound.backHome}
      </Link>
    </PageNotice>
  );
}
