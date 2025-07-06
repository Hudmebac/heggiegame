'use client';

import { useState, useEffect, useTransition } from 'react';
import type { GameState, Item, PriceHistory } from '@/lib/types';
import { runMarketSimulation } from '@/app/actions';

import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Button } from '@/components/ui/button';

import Header from './header';
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
  const [isPending, startTransition] = useTransition();
  const [chartItem, setChartItem] = useState<string>(initialGameState.items[0].name);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedState = localStorage.getItem('heggieGameState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Basic validation
        if(parsedState.playerStats && parsedState.items) {
          setGameState(parsedState);
          setChartItem(parsedState.items[0]?.name || initialGameState.items[0].name);
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
    startTransition(async () => {
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
          <ShipManagement stats={gameState.playerStats} />
           <div className="flex justify-center">
            <Button onClick={handleSimulateMarket} disabled={isPending} className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Simulate Market Prices
            </Button>
          </div>
          {gameState.pirateEncounter && <PirateEncounter pirate={gameState.pirateEncounter} />}
          <Leaderboard data={leaderboardWithPlayer} />
        </div>
      </main>
      <Toaster />
    </div>
  );
}
