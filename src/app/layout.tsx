import type { Metadata } from 'next';
import './globals.css';

import NavBar from './components/NavBar';
import { pl } from './i18n/pl';

export const metadata: Metadata = {
  title: pl.meta.title,
  description: pl.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
