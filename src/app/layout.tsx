import type { Metadata } from 'next';
import './globals.css';
import { GameProvider } from '@/app/components/game-provider';
import AppLayout from '@/app/components/app-layout';

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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <GameProvider>
          <AppLayout>{children}</AppLayout>
        </GameProvider>
      </body>
    </html>
  );
}
