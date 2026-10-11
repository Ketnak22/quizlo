'use client';

import PageNotice from './components/PageNotice';
import { pl } from './i18n/pl';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <PageNotice title={pl.error.title} body={pl.error.body}>
      <button type="button" className="btn btnPrimary" onClick={reset}>
        {pl.error.retry}
      </button>
    </PageNotice>
  );
}
