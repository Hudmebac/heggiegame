
'use client';

import { useGame } from '@/app/components/game-provider';
import Header from '@/app/components/header';
import { Menu } from 'lucide-react';
import GameModalsAndEncounters from '@/app/components/game-ui/GameModalsAndEncounters';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { gameState } = useGame();

  // The parent component (GameProvider) now ensures gameState is valid here.
  // This component's only job is to lay out the active game.
  if (!gameState || gameState.isGameOver) {
    // This should not be reached if the provider is structured correctly,
    // but it's a good safeguard.
    return null; 
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr] h-screen bg-background text-foreground font-body antialiased">
      <aside className="hidden lg:block border-r bg-card/50">
        <Header playerStats={gameState.playerStats} />
      </aside>
      
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:hidden sticky top-0 z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>Main navigation links and player status.</SheetDescription>
              </SheetHeader>
              <Header playerStats={gameState.playerStats} />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <GameModalsAndEncounters />
    </div>
  );
}
