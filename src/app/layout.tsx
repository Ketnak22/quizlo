import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

import NavBar from './components/NavBar';
import { pl } from './i18n/pl';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'latin-ext'],
});

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
      <body className={geistSans.variable}>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
