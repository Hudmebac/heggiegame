import type { Metadata } from 'next';
import './globals.css';
import { GameProvider, useGame } from '@/app/components/game-provider';
import Header from '@/app/components/header';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'HEGGIE: Hegg Interstellar Exchange',
  description: 'A space trading game.',
};

function AppLayout({ children }: { children: React.ReactNode }) {
  const { gameState } = useGame();

  if (!gameState) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr] h-screen bg-background text-foreground font-body antialiased">
      <aside className="hidden lg:block border-r bg-card/50">
        <Header playerStats={gameState.playerStats} />
      </aside>
      <main className="overflow-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

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
