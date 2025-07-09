
'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import Header from '@/app/components/header';
import { Menu, Loader2 } from 'lucide-react';
import GameModalsAndEncounters from '@/app/components/game-ui/GameModalsAndEncounters';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import GameSetup from '@/app/components/game-setup';
import GameOver from '@/app/components/game-over';
import { Toaster } from '@/components/ui/toaster';
import { FACTIONS_DATA } from '@/lib/factions';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { gameState, isClient, isGeneratingNewGame } = useGame();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && gameState?.playerStats.faction) {
      const factionData = FACTIONS_DATA.find(f => f.id === gameState.playerStats.faction);
      if (factionData) {
        document.documentElement.style.setProperty('--primary', factionData.color.primary);
        document.documentElement.style.setProperty('--accent', factionData.color.accent);
        document.documentElement.style.setProperty('--ring', factionData.color.primary);
      }
    }
  }, [gameState?.playerStats.faction]);

  if (!isClient || isGeneratingNewGame) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            {isGeneratingNewGame && (
                <>
                    <h2 className="text-2xl font-headline text-primary">Generating Your Galaxy...</h2>
                    <p className="text-muted-foreground">Calibrating star charts and preparing your new career.</p>
                </>
            )}
        </div>
    );
  }
  
  if (!gameState) {
    return (
      <>
        <GameSetup />
        <Toaster />
      </>
    );
  }

  if (gameState.isGameOver) {
    return (
      <>
        <GameOver />
        <Toaster />
      </>
    );
  }
  
  return (
    <div className="grid lg:grid-cols-[280px_1fr] h-screen bg-background text-foreground font-body antialiased">
      <aside className="hidden lg:block border-r bg-card/50">
        <Header playerStats={gameState!.playerStats} />
      </aside>
      
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:hidden sticky top-0 z-10">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
              <Header playerStats={gameState!.playerStats} onLinkClick={() => setIsSheetOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <GameModalsAndEncounters />
      <Toaster />
    </div>
  );
}
