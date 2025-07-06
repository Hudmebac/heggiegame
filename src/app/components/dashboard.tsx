'use client';

import { useState, useEffect, useTransition } from 'react';
import type { GameState, Item, PriceHistory, EncounterResult } from '@/lib/types';
import { runMarketSimulation, resolveEncounter, runAvatarGeneration } from '@/app/actions';

import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"


import Header from './header';
import PlayerProfile from './player-profile';
import ShipManagement from './ship-management';
import TradingInterface from './trading-interface';
import MarketChart from './market-chart';
import Leaderboard from './leaderboard';
import PirateEncounter from './pirate-encounter';
import GalaxyMap from './galaxy-map';
import { Loader2 } from 'lucide-react';


const initialGameState: GameState = {
  playerStats: {
    netWorth: 10000,
    fuel: 80,
    maxFuel: 100,
    cargo: 10,
    maxCargo: 50,
    insurance: true,
    avatarUrl: 'https://placehold.co/96x96/1A2942/3B82F6.png',
  },
  items: [
    { name: 'Quantum Processors', currentPrice: 1200, supply: 50, demand: 80, cargoSpace: 2, owned: 5 },
    { name: 'Cryo-Gas', currentPrice: 350, supply: 200, demand: 150, cargoSpace: 5, owned: 0 },
    { name: 'Asteroid Minerals', currentPrice: 80, supply: 1000, demand: 800, cargoSpace: 10, owned: 0 },
    { name: 'Bioluminescent Fungi', currentPrice: 550, supply: 100, demand: 120, cargoSpace: 3, owned: 0 },
    { name: 'Zero-Point Energy Cells', currentPrice: 5000, supply: 10, demand: 25, cargoSpace: 1, owned: 0 },
  ],
  priceHistory: {
    'Quantum Processors': [1200],
    'Cryo-Gas': [350],
    'Asteroid Minerals': [80],
    'Bioluminescent Fungi': [550],
    'Zero-Point Energy Cells': [5000],
  },
  leaderboard: [
    { rank: 1, trader: 'Cmdr. Alex "Void" Ryder', netWorth: 15_780_234, fleetSize: 12 },
    { rank: 2, trader: 'Captain Eva "Stardust" Rostova', netWorth: 12_450_987, fleetSize: 8 },
    { rank: 3, trader: 'Jax "The Comet" Williams', netWorth: 9_876_543, fleetSize: 15 },
    { rank: 4, trader: 'You', netWorth: 10000, fleetSize: 1 },
    { rank: 5, trader: 'Baron Von "Blackhole" Hess', netWorth: 8_123_456, fleetSize: 5 },
  ],
  pirateEncounter: {
    name: 'Dread Captain "Scar" Ironheart',
    shipType: 'Marauder-class Corvette',
    threatLevel: 'Medium',
  },
};

export default function Dashboard() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast()
  const [isSimulatingMarket, startMarketTransition] = useTransition();
  const [isResolvingEncounter, startEncounterTransition] = useTransition();
  const [isGeneratingAvatar, startAvatarGenerationTransition] = useTransition();
  const [chartItem, setChartItem] = useState<string>(initialGameState.items[0].name);
  const [encounterResult, setEncounterResult] = useState<EncounterResult | null>(null);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedState = localStorage.getItem('heggieGameState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Basic validation
        if(parsedState.playerStats && parsedState.items) {
          const mergedState = {
            ...initialGameState,
            ...parsedState,
            playerStats: {
              ...initialGameState.playerStats,
              ...parsedState.playerStats,
            },
          };
          setGameState(mergedState);
          setChartItem(mergedState.items[0]?.name || initialGameState.items[0].name);
        }
      }
    } catch (error) {
      console.error("Failed to load game state from local storage:", error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        const leaderboardWithPlayer = gameState.leaderboard.map(entry => 
          entry.trader === 'You' ? { ...entry, netWorth: gameState.playerStats.netWorth } : entry
        ).sort((a, b) => b.netWorth - a.netWorth).map((entry, index) => ({...entry, rank: index + 1}));
        
        const stateToSave = {...gameState, leaderboard: leaderboardWithPlayer};
        localStorage.setItem('heggieGameState', JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Failed to save game state to local storage:", error);
      }
    }
  }, [gameState, isClient]);

  const handleTrade = (itemName: string, type: 'buy' | 'sell', amount: number) => {
    setGameState(prev => {
      const item = prev.items.find(i => i.name === itemName);
      if (!item) return prev;

      const newPlayerStats = { ...prev.playerStats };
      const newItems = [...prev.items];
      const itemIndex = newItems.findIndex(i => i.name === itemName);
      const updatedItem = { ...item };

      const totalCost = item.currentPrice * amount;
      const totalCargo = item.cargoSpace * amount;

      if (type === 'buy') {
        if (newPlayerStats.netWorth < totalCost) {
          toast({ variant: "destructive", title: "Transaction Failed", description: "Not enough credits." });
          return prev;
        }
        if (newPlayerStats.cargo + totalCargo > newPlayerStats.maxCargo) {
          toast({ variant: "destructive", title: "Transaction Failed", description: "Not enough cargo space." });
          return prev;
        }
        newPlayerStats.netWorth -= totalCost;
        newPlayerStats.cargo += totalCargo;
        updatedItem.owned += amount;
      } else { // sell
        if (item.owned < amount) {
          toast({ variant: "destructive", title: "Transaction Failed", description: "Not enough items to sell." });
          return prev;
        }
        newPlayerStats.netWorth += totalCost;
        newPlayerStats.cargo -= totalCargo;
        updatedItem.owned -= amount;
      }

      newItems[itemIndex] = updatedItem;
      return { ...prev, playerStats: newPlayerStats, items: newItems };
    });
  };

  const handleSimulateMarket = () => {
    startMarketTransition(async () => {
      const input = {
        items: gameState.items.map(({ name, currentPrice, supply, demand }) => ({ name, currentPrice, supply, demand })),
        eventDescription: 'A surprise solar flare has disrupted major trade routes.',
      };

      try {
        const result = await runMarketSimulation(input);
        setGameState(prev => {
          const newItems = [...prev.items];
          const newPriceHistory: PriceHistory = { ...prev.priceHistory };

          result.forEach(update => {
            const itemIndex = newItems.findIndex(i => i.name === update.name);
            if (itemIndex !== -1) {
              newItems[itemIndex].currentPrice = update.newPrice;
              if (newPriceHistory[update.name]) {
                newPriceHistory[update.name] = [...newPriceHistory[update.name], update.newPrice].slice(-20); // Keep last 20 prices
              } else {
                newPriceHistory[update.name] = [update.newPrice];
              }
            }
          });

          return { ...prev, items: newItems, priceHistory: newPriceHistory };
        });
        toast({ title: "Market Update", description: "Prices have fluctuated across the galaxy." });
      } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Simulation Failed", description: errorMessage });
      }
    });
  };

  const handlePirateAction = (action: 'fight' | 'evade' | 'bribe' | 'scan') => {
    if (action === 'scan') {
        toast({ title: "Scan initiated", description: "Scanning pirate vessel... results pending. (Feature coming soon!)" });
        return;
    }
    
    if (!gameState.pirateEncounter) return;

    startEncounterTransition(async () => {
        const input = {
            action,
            playerNetWorth: gameState.playerStats.netWorth,
            playerCargo: gameState.playerStats.cargo,
            pirateName: gameState.pirateEncounter!.name,
            pirateThreatLevel: gameState.pirateEncounter!.threatLevel,
        };
        try {
            const result = await resolveEncounter(input);
            setEncounterResult(result);

            setGameState(prev => {
                const newPlayerStats = { ...prev.playerStats };
                newPlayerStats.netWorth -= result.creditsLost;
                newPlayerStats.cargo -= result.cargoLost;
                if (newPlayerStats.cargo < 0) newPlayerStats.cargo = 0;

                // For simplicity, we just remove cargo space units, not specific items.
                // A more complex game could have a more detailed inventory management.

                // Remove the pirate after the encounter is acknowledged
                return { ...prev, playerStats: newPlayerStats };
            });

        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Encounter Failed", description: errorMessage });
        }
    });
  };

  const handleGenerateAvatar = () => {
    startAvatarGenerationTransition(async () => {
      try {
        const result = await runAvatarGeneration({ description: 'A futuristic space trader pilot, male, with a cybernetic eye' });
        setGameState(prev => ({
          ...prev,
          playerStats: {
            ...prev.playerStats,
            avatarUrl: result.avatarDataUri,
          }
        }));
        toast({ title: "Avatar Generated", description: "Your new captain's portrait is ready." });
      } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Avatar Generation Failed", description: errorMessage });
      }
    });
  };


  const handleCloseEncounterDialog = () => {
    setEncounterResult(null);
    setGameState(prev => ({...prev, pirateEncounter: null}));
  }
  
  const leaderboardWithPlayer = gameState.leaderboard.map(entry => 
    entry.trader === 'You' ? { ...entry, netWorth: gameState.playerStats.netWorth } : entry
  ).sort((a, b) => b.netWorth - a.netWorth).map((entry, index) => ({...entry, rank: index + 1}));

  if (!isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-6 lg:p-8 font-body">
      <Header playerStats={gameState.playerStats} />
      <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6">
          <TradingInterface items={gameState.items} onTrade={handleTrade} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <MarketChart 
              priceHistory={gameState.priceHistory} 
              items={gameState.items.map(i => i.name)}
              selectedItem={chartItem}
              onSelectItem={setChartItem}
            />
            <GalaxyMap />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6">
          <PlayerProfile 
            stats={gameState.playerStats} 
            onGenerateAvatar={handleGenerateAvatar} 
            isGeneratingAvatar={isGeneratingAvatar}
          />
          <ShipManagement stats={gameState.playerStats} />
           <div className="flex justify-center">
            <Button onClick={handleSimulateMarket} disabled={isSimulatingMarket} className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
              {isSimulatingMarket ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Simulate Market Prices
            </Button>
          </div>
          {gameState.pirateEncounter && <PirateEncounter pirate={gameState.pirateEncounter} onAction={handlePirateAction} isResolving={isResolvingEncounter} />}
          <Leaderboard data={leaderboardWithPlayer} />
        </div>
      </main>
      
      {encounterResult && (
        <AlertDialog open={!!encounterResult} onOpenChange={handleCloseEncounterDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{`Encounter with ${gameState.pirateEncounter?.name || 'Pirate'} Resolved`}</AlertDialogTitle>
              <AlertDialogDescription>
                {encounterResult.narrative}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="text-sm space-y-2">
                <p><strong>Outcome:</strong> <span className="font-mono">{encounterResult.outcome.replace('_', ' ')}</span></p>
                <p><strong>Credits Lost:</strong> <span className="font-mono text-amber-400">{encounterResult.creditsLost} ¢</span></p>
                <p><strong>Cargo Lost:</strong> <span className="font-mono text-sky-400">{encounterResult.cargoLost} t</span></p>
                <p><strong>Ship Damage:</strong> <span className="font-mono text-red-400">{encounterResult.damageTaken}</span></p>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleCloseEncounterDialog}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Toaster />
    </div>
  );
}
