
'use client';

import { useGame } from '@/app/components/game-provider';
import Header from '@/app/components/header';
import { Loader2 } from 'lucide-react';
import GameModalsAndEncounters from '@/app/components/game-ui/GameModalsAndEncounters';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { gameState, isClient } = useGame();

  if (!isClient || !gameState) {
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
      <GameModalsAndEncounters />
    </div>
  );
}
