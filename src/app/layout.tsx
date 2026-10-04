import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

import NavBar from './NavBar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'latin-ext'],
});

export const metadata: Metadata = {
  title: 'quizlo',
  description: 'Quizy z wiedzy ogólnej i geografii: wpisywanie odpowiedzi, parowanie i mapy.',
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
