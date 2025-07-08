import type { Metadata } from 'next';
import './globals.css';
import { GameProvider } from '@/app/components/game-provider';
import AppLayout from '@/app/components/app-layout';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'HEGGIE: Hegg Interstellar Exchange',
  description: 'A space trading game.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} dark`}>
      <head>
        <link rel="icon" href="/images/favicon/favicon.ico" sizes="any" />
      </head>
      <body suppressHydrationWarning={true}>
        <GameProvider>
          <AppLayout>{children}</AppLayout>
        </GameProvider>
      </body>
    </html>
  );
}
