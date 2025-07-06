'use client';

import { useState, useEffect, useTransition } from 'react';
import type { GameState, Item, PriceHistory, EncounterResult, System, Route, Pirate } from '@/lib/types';
import { runMarketSimulation, resolveEncounter, runAvatarGeneration, runEventGeneration } from '@/app/actions';

import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"


import Header from './header';
import PlayerProfile from './player-profile';
import ShipManagement from './ship-management';
import TradingInterface from './trading-interface';
import MarketChart from './market-chart';
import Leaderboard from './leaderboard';
import PirateEncounter from './pirate-encounter';
import GalaxyMap from './galaxy-map';
import TradeDialog from './trade-dialog';
import { Loader2 } from 'lucide-react';


const systems: System[] = [
    { name: 'Sol', x: 20, y: 30 },
    { name: 'Kepler-186f', x: 45, y: 65 },
    { name: 'Sirius', x: 75, y: 25 },
    { name: 'Proxima Centauri', x: 80, y: 80 },
    { name: 'TRAPPIST-1', x: 5, y: 85 },
];

const routes: Route[] = [
    { from: 'Sol', to: 'Kepler-186f' },
    { from: 'Sol', to: 'Sirius' },
    { from: 'Kepler-186f', to: 'Proxima Centauri' },
    { from: 'Sirius', to: 'Proxima Centauri' },
    { from: 'Kepler-186f', to: 'TRAPPIST-1' },
];

const pirateNames = ['Dread Captain "Scar" Ironheart', 'Admiral "Voidgazer" Kael', 'Captain "Mad" Mel', 'Commander "Hex" Stryker'];
const shipTypes = ['Marauder-class Corvette', 'Reaper-class Frigate', 'Void-reaver Battleship', 'Shadow-class Interceptor'];
const threatLevels: Pirate['threatLevel'][] = ['Low', 'Medium', 'High', 'Critical'];

function generateRandomPirate(): Pirate {
    return {
        name: pirateNames[Math.floor(Math.random() * pirateNames.length)],
        shipType: shipTypes[Math.floor(Math.random() * shipTypes.length)],
        threatLevel: threatLevels[Math.floor(Math.random() * threatLevels.length)],
    }
}

const initialGameState: GameState = {
  playerStats: {
    netWorth: 10000,
    fuel: 80,
    maxFuel: 100,
    cargo: 10,
    maxCargo: 50,
    insurance: true,
    avatarUrl: 'https://placehold.co/96x96/1A2942/7DD3FC.png',
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
  pirateEncounter: null,
  systems: systems,
  routes: routes,
  currentSystem: 'Sol',
};

export default function Dashboard() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast()
  const [isSimulating, startSimulationTransition] = useTransition();
  const [isResolvingEncounter, startEncounterTransition] = useTransition();
  const [isGeneratingAvatar, startAvatarGenerationTransition] = useTransition();
  const [chartItem, setChartItem] = useState<string>(initialGameState.items[0].name);
  const [encounterResult, setEncounterResult] = useState<EncounterResult | null>(null);
  const [tradeDetails, setTradeDetails] = useState<{item: Item, type: 'buy' | 'sell'} | null>(null);
  const [travelDestination, setTravelDestination] = useState<System | null>(null);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedState = localStorage.getItem('heggieGameState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
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

  const handleInitiateTrade = (item: Item, type: 'buy' | 'sell') => {
    setTradeDetails({ item, type });
  };

  const handleSimulateMarket = () => {
    startSimulationTransition(async () => {
      try {
        const eventResult = await runEventGeneration();
        const eventDescription = eventResult.eventDescription;

        const input = {
          items: gameState.items.map(({ name, currentPrice, supply, demand }) => ({ name, currentPrice, supply, demand })),
          eventDescription,
        };

        const result = await runMarketSimulation(input);
        setGameState(prev => {
          const newItems = [...prev.items];
          const newPriceHistory: PriceHistory = { ...prev.priceHistory };

          result.forEach(update => {
            const itemIndex = newItems.findIndex(i => i.name === update.name);
            if (itemIndex !== -1) {
              newItems[itemIndex].currentPrice = update.newPrice;
              if (newPriceHistory[update.name]) {
                newPriceHistory[update.name] = [...newPriceHistory[update.name], update.newPrice].slice(-20);
              } else {
                newPriceHistory[update.name] = [update.newPrice];
              }
            }
          });

          return { ...prev, items: newItems, priceHistory: newPriceHistory };
        });
        toast({ title: "Galactic News Flash!", description: eventDescription });
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
                return { ...prev, playerStats: newPlayerStats };
            });

        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Encounter Failed", description: errorMessage });
        }
    });
  };

  const handleGenerateAvatar = (description: string) => {
    startAvatarGenerationTransition(async () => {
      try {
        const result = await runAvatarGeneration({ description });
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

  const handleInitiateTravel = (systemName: string) => {
    if (systemName === gameState.currentSystem) return;
    const destination = gameState.systems.find(s => s.name === systemName);
    if (destination) {
        setTravelDestination(destination);
    }
  };

  const handleConfirmTravel = () => {
      if (!travelDestination) return;

      const currentSystem = gameState.systems.find(s => s.name === gameState.currentSystem);
      if (!currentSystem) return;

      const distance = Math.hypot(travelDestination.x - currentSystem.x, travelDestination.y - currentSystem.y);
      const fuelCost = Math.round(distance / 5);

      if (gameState.playerStats.fuel < fuelCost) {
          toast({
              variant: "destructive",
              title: "Travel Failed",
              description: `Not enough fuel. You need ${fuelCost} SU, but you only have ${gameState.playerStats.fuel}.`
          });
          setTravelDestination(null);
          return;
      }
      
      setTravelDestination(null);

      startSimulationTransition(async () => {
        const stateBeforeTravel = gameState;
        
        const travelledState = {
            ...stateBeforeTravel,
            playerStats: {
                ...stateBeforeTravel.playerStats,
                fuel: stateBeforeTravel.playerStats.fuel - fuelCost,
            },
            currentSystem: travelDestination.name,
            pirateEncounter: Math.random() < 0.3 ? generateRandomPirate() : null,
        };

        const marketInput = {
            items: travelledState.items.map(({ name, currentPrice, supply, demand }) => ({ name, currentPrice, supply, demand })),
            eventDescription: `You've arrived at ${travelDestination.name}. The local market is buzzing with new opportunities.`,
        };

        try {
            const marketResult = await runMarketSimulation(marketInput);
            const newItems = [...travelledState.items];
            const newPriceHistory: PriceHistory = { ...travelledState.priceHistory };

            marketResult.forEach(update => {
                const itemIndex = newItems.findIndex(i => i.name === update.name);
                if (itemIndex !== -1) {
                    newItems[itemIndex].currentPrice = update.newPrice;
                    if (newPriceHistory[update.name]) {
                        newPriceHistory[update.name] = [...newPriceHistory[update.name], update.newPrice].slice(-20);
                    } else {
                        newPriceHistory[update.name] = [update.newPrice];
                    }
                }
            });

            setGameState({ ...travelledState, items: newItems, priceHistory: newPriceHistory });
            toast({
                title: "Arrival",
                description: `You have arrived at the ${travelDestination.name} system. Your journey consumed ${fuelCost} fuel units.`
            });

        } catch (error) {
            setGameState(travelledState);
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Market Update Failed", description: errorMessage });
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

  const travelFuelCost = travelDestination ? Math.round(Math.hypot(travelDestination.x - (gameState.systems.find(s => s.name === gameState.currentSystem)?.x || 0), travelDestination.y - (gameState.systems.find(s => s.name === gameState.currentSystem)?.y || 0)) / 5) : 0;

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
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6">
          <TradingInterface items={gameState.items} onInitiateTrade={handleInitiateTrade} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <MarketChart 
              priceHistory={gameState.priceHistory} 
              items={gameState.items.map(i => i.name)}
              selectedItem={chartItem}
              onSelectItem={setChartItem}
            />
            <GalaxyMap 
              systems={gameState.systems}
              routes={gameState.routes}
              currentSystem={gameState.currentSystem}
              onTravel={handleInitiateTravel}
            />
          </div>
        </div>

        <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6">
          <PlayerProfile 
            stats={gameState.playerStats} 
            onGenerateAvatar={handleGenerateAvatar} 
            isGeneratingAvatar={isGeneratingAvatar}
          />
          <ShipManagement stats={gameState.playerStats} currentSystem={gameState.currentSystem} />
           <div className="flex justify-center">
            <Button onClick={handleSimulateMarket} disabled={isSimulating} className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
              {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Simulate Market Event
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
                <p><strong>Ship Damage:</strong> <span className="font-mono text-destructive">{encounterResult.damageTaken}</span></p>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleCloseEncounterDialog}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {travelDestination && (
        <AlertDialog open={!!travelDestination} onOpenChange={() => setTravelDestination(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Interstellar Travel</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to travel to the <span className="font-bold text-primary">{travelDestination.name}</span> system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="text-sm space-y-2">
                <p><strong>Destination:</strong> <span className="font-mono">{travelDestination.name}</span></p>
                <p><strong>Estimated Fuel Cost:</strong> <span className="font-mono text-amber-400">{travelFuelCost} SU</span></p>
                <p className={gameState.playerStats.fuel - travelFuelCost < 0 ? 'text-destructive' : ''}>
                  <strong>Remaining Fuel:</strong> <span className="font-mono">{gameState.playerStats.fuel - travelFuelCost} SU</span>
                </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmTravel} disabled={isSimulating || gameState.playerStats.fuel < travelFuelCost}>
                {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Engage Warp Drive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <TradeDialog
        isOpen={!!tradeDetails}
        onOpenChange={(open) => !open && setTradeDetails(null)}
        item={tradeDetails?.item ?? null}
        tradeType={tradeDetails?.type ?? 'buy'}
        playerStats={gameState.playerStats}
        onTrade={handleTrade}
      />

      <Toaster />
    </div>
  );
}
