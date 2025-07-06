'use client';

import { createContext, useContext, useState, useEffect, useTransition, ReactNode, useCallback } from 'react';
import type { GameState, Item, PriceHistory, EncounterResult, System, Route, Pirate, PlayerStats, Quest, CargoUpgrade, WeaponUpgrade, ShieldUpgrade } from '@/lib/types';
import { runMarketSimulation, resolveEncounter, runAvatarGeneration, runEventGeneration, runPirateScan, runBioGeneration, runQuestGeneration } from '@/app/actions';

import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import TradeDialog from './trade-dialog';
import { Loader2 } from 'lucide-react';
import PirateEncounter from './pirate-encounter';

const systems: System[] = [
    { name: 'Sol', x: 20, y: 30, security: 'High', economy: 'Industrial' },
    { name: 'Kepler-186f', x: 45, y: 65, security: 'Medium', economy: 'Agricultural' },
    { name: 'Sirius', x: 75, y: 25, security: 'High', economy: 'High-Tech' },
    { name: 'Proxima Centauri', x: 80, y: 80, security: 'Low', economy: 'Extraction' },
    { name: 'TRAPPIST-1', x: 5, y: 85, security: 'Anarchy', economy: 'Refinery' },
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

const cargoUpgrades: CargoUpgrade[] = [
    { capacity: 50, cost: 0 },
    { capacity: 75, cost: 5000 },
    { capacity: 100, cost: 12000 },
    { capacity: 150, cost: 25000 },
];
const weaponUpgrades: WeaponUpgrade[] = [
    { level: 1, name: 'Mk. I Laser', cost: 0 },
    { level: 2, name: 'Mk. II Pulse Laser', cost: 10000 },
    { level: 3, name: 'Mk. III Plasma Cannon', cost: 30000 },
];
const shieldUpgrades: ShieldUpgrade[] = [
    { level: 1, name: 'Class-A Deflector', cost: 0 },
    { level: 2, name: 'Class-B Field', cost: 7500 },
    { level: 3, name: 'Class-C Barrier', cost: 20000 },
];


function generateRandomPirate(): Pirate {
    return {
        name: pirateNames[Math.floor(Math.random() * pirateNames.length)],
        shipType: shipTypes[Math.floor(Math.random() * shipTypes.length)],
        threatLevel: threatLevels[Math.floor(Math.random() * threatLevels.length)],
    }
}

const initialGameState: GameState = {
  playerStats: {
    name: 'You',
    bio: 'A mysterious trader with a past yet to be written. The galaxy is full of opportunity, and your story is just beginning.',
    netWorth: 10000,
    fuel: 80,
    maxFuel: 100,
    cargo: 10,
    maxCargo: 50,
    insurance: true,
    avatarUrl: 'https://placehold.co/96x96/1A2942/7DD3FC.png',
    weaponLevel: 1,
    shieldLevel: 1,
  },
  items: [
    { name: 'Quantum Processors', currentPrice: 1200, supply: 50, demand: 80, cargoSpace: 2, owned: 5 },
    { name: 'Cryo-Gas', currentPrice: 350, supply: 200, demand: 150, cargoSpace: 5, owned: 0 },
    { name: 'Asteroid Minerals', currentPrice: 80, supply: 1000, demand: 800, cargoSpace: 10, owned: 0 },
    { name: 'Bioluminescent Fungi', currentPrice: 550, supply: 100, demand: 120, cargoSpace: 3, owned: 0 },
    { name: 'Zero-Point Energy Cells', currentPrice: 5000, supply: 10, demand: 25, cargoSpace: 1, owned: 0 },
    { name: 'Refined He-3 Isotope', currentPrice: 800, supply: 150, demand: 100, cargoSpace: 4, owned: 0 },
    { name: 'Xenocrystal Shards', currentPrice: 2500, supply: 30, demand: 50, cargoSpace: 1, owned: 0 },
    { name: 'Gene-Spliced Kava Root', currentPrice: 200, supply: 500, demand: 400, cargoSpace: 2, owned: 0 },
    { name: 'Mycelial Network Spores', currentPrice: 1800, supply: 60, demand: 40, cargoSpace: 0.5, owned: 0 },
    { name: 'Graviton Emitters', currentPrice: 7500, supply: 5, demand: 15, cargoSpace: 3, owned: 0 },
    { name: 'Void Opals', currentPrice: 10000, supply: 8, demand: 12, cargoSpace: 0.2, owned: 0 },
    { name: 'Decommissioned Ship Parts', currentPrice: 450, supply: 80, demand: 120, cargoSpace: 20, owned: 0 },
    { name: 'Sentient AI Cores', currentPrice: 50000, supply: 2, demand: 5, cargoSpace: 2, owned: 0 },
    { name: 'Stellar Flares (Data)', currentPrice: 3200, supply: 25, demand: 35, cargoSpace: 0.1, owned: 0 },
    { name: 'Medical Nanites', currentPrice: 2200, supply: 70, demand: 90, cargoSpace: 0.5, owned: 0 },
    { name: 'Terraforming Agents', currentPrice: 4000, supply: 15, demand: 20, cargoSpace: 8, owned: 0 },
    { name: 'Luxury Spices', currentPrice: 900, supply: 300, demand: 350, cargoSpace: 1, owned: 0 },
    { name: 'Illegal Cybernetics', currentPrice: 6500, supply: 12, demand: 30, cargoSpace: 2, owned: 0 },
  ],
  priceHistory: {
    'Quantum Processors': [1200],
    'Cryo-Gas': [350],
    'Asteroid Minerals': [80],
    'Bioluminescent Fungi': [550],
    'Zero-Point Energy Cells': [5000],
    'Refined He-3 Isotope': [800],
    'Xenocrystal Shards': [2500],
    'Gene-Spliced Kava Root': [200],
    'Mycelial Network Spores': [1800],
    'Graviton Emitters': [7500],
    'Void Opals': [10000],
    'Decommissioned Ship Parts': [450],
    'Sentient AI Cores': [50000],
    'Stellar Flares (Data)': [3200],
    'Medical Nanites': [2200],
    'Terraforming Agents': [4000],
    'Luxury Spices': [900],
    'Illegal Cybernetics': [6500],
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
  quests: [],
};

interface GameContextType {
  gameState: GameState | null;
  isClient: boolean;
  isSimulating: boolean;
  isResolvingEncounter: boolean;
  isGeneratingAvatar: boolean;
  isGeneratingBio: boolean;
  isScanning: boolean;
  isGeneratingQuests: boolean;
  chartItem: string;
  setChartItem: (item: string) => void;
  handleTrade: (itemName: string, type: 'buy' | 'sell', amount: number) => void;
  handleInitiateTrade: (item: Item, type: 'buy' | 'sell') => void;
  handleSimulateMarket: () => void;
  handlePirateAction: (action: 'fight' | 'evade' | 'bribe' | 'scan') => void;
  handleGenerateAvatar: (description: string) => void;
  handleGenerateBio: (name?: string) => void;
  handleGenerateQuests: () => void;
  setPlayerName: (name: string) => void;
  handleInitiateTravel: (systemName: string) => void;
  handleRefuel: () => void;
  handleUpgradeShip: (upgradeType: 'cargo' | 'weapon' | 'shield') => void;
  cargoUpgrades: CargoUpgrade[];
  weaponUpgrades: WeaponUpgrade[];
  shieldUpgrades: ShieldUpgrade[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const [isSimulating, startSimulationTransition] = useTransition();
  const [isResolvingEncounter, startEncounterTransition] = useTransition();
  const [isGeneratingAvatar, startAvatarGenerationTransition] = useTransition();
  const [isGeneratingBio, startBioGenerationTransition] = useTransition();
  const [isGeneratingQuests, startQuestGenerationTransition] = useTransition();
  const [isScanning, startScanTransition] = useTransition();
  const [chartItem, setChartItem] = useState<string>(initialGameState.items[0].name);
  const [encounterResult, setEncounterResult] = useState<EncounterResult | null>(null);
  const [tradeDetails, setTradeDetails] = useState<{ item: Item, type: 'buy' | 'sell' } | null>(null);
  const [travelDestination, setTravelDestination] = useState<System | null>(null);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedState = localStorage.getItem('heggieGameState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState.playerStats && parsedState.items) {
          const mergedState = {
            ...initialGameState,
            ...parsedState,
            quests: parsedState.quests || [],
            playerStats: {
              ...initialGameState.playerStats,
              ...parsedState.playerStats,
            },
            systems: initialGameState.systems,
            routes: initialGameState.routes,
          };
          setGameState(mergedState);
          setChartItem(mergedState.items[0]?.name || initialGameState.items[0].name);
        } else {
            setGameState(initialGameState);
        }
      } else {
        setGameState(initialGameState);
      }
    } catch (error) {
      console.error("Failed to load game state from local storage:", error);
      setGameState(initialGameState);
    }
  }, []);

  useEffect(() => {
    if (isClient && gameState) {
      try {
        const player = gameState.leaderboard.find(e => e.trader === 'You' || e.trader === gameState.playerStats.name);

        const leaderboardWithPlayer = gameState.leaderboard.map(entry => {
            if (player && entry.rank === player.rank) {
                return { ...entry, trader: gameState.playerStats.name, netWorth: gameState.playerStats.netWorth };
            }
            if(entry.trader === 'You' && !player) { // First time name change
                 return { ...entry, trader: gameState.playerStats.name, netWorth: gameState.playerStats.netWorth };
            }
            return entry;
        }).sort((a, b) => b.netWorth - a.netWorth).map((entry, index) => ({ ...entry, rank: index + 1 }));
        
        const stateToSave = { ...gameState, leaderboard: leaderboardWithPlayer };
        localStorage.setItem('heggieGameState', JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Failed to save game state to local storage:", error);
      }
    }
  }, [gameState, isClient]);

  const handleTrade = (itemName: string, type: 'buy' | 'sell', amount: number) => {
    setGameState(prev => {
      if (!prev) return null;
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
    if (!gameState) return;
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
          if (!prev) return null;
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
    if (!gameState || !gameState.pirateEncounter) return;

    if (action === 'scan') {
        startScanTransition(async () => {
            const input = {
                pirateName: gameState.pirateEncounter!.name,
                pirateShipType: gameState.pirateEncounter!.shipType,
                pirateThreatLevel: gameState.pirateEncounter!.threatLevel,
            };
            try {
                const result = await runPirateScan(input);
                setGameState(prev => {
                    if (!prev || !prev.pirateEncounter) return prev;
                    const newPirateEncounter = { ...prev.pirateEncounter, scanResult: result.scanReport };
                    return { ...prev, pirateEncounter: newPirateEncounter };
                });
                toast({ title: "Scan Complete", description: "Tactical data available." });
            } catch (error) {
                console.error(error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({ variant: "destructive", title: "Scan Failed", description: errorMessage });
            }
        });
        return;
    }
    
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
                if (!prev) return null;
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
        setGameState(prev => {
          if (!prev) return null;
          return {
            ...prev,
            playerStats: {
              ...prev.playerStats,
              avatarUrl: result.avatarDataUri,
            }
        }});
        toast({ title: "Avatar Generated", description: "Your new captain's portrait is ready." });
      } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Avatar Generation Failed", description: errorMessage });
      }
    });
  };

  const handleGenerateBio = (name?: string) => {
    if (!gameState) return;
    const captainName = name || gameState.playerStats.name;
    startBioGenerationTransition(async () => {
        try {
            const result = await runBioGeneration({ name: captainName });
            setGameState(prev => {
              if (!prev) return null;
              return {
                ...prev,
                playerStats: { ...prev.playerStats, bio: result.bio }
              }
            });
            toast({ title: "Bio Generated", description: "Your captain's story has been updated." });
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Bio Generation Failed", description: errorMessage });
        }
    });
  };

  const handleGenerateQuests = useCallback(() => {
    startQuestGenerationTransition(async () => {
      try {
        const result = await runQuestGeneration();
        setGameState(prev => {
            if (!prev) return null;
            toast({ title: "New Bounties Posted", description: "The quest board has been updated with new missions." });
            return { ...prev, quests: result.quests };
        });
      } catch (error) {
          console.error(error);
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
          toast({ variant: "destructive", title: "Quest Generation Failed", description: errorMessage });
      }
    });
  }, [toast]);

  const setPlayerName = (name: string) => {
    setGameState(prev => {
        if (!prev) return null;
        const oldName = prev.playerStats.name;
        const newLeaderboard = prev.leaderboard.map(e => e.trader === oldName ? {...e, trader: name} : e);
        return {
          ...prev,
          playerStats: { ...prev.playerStats, name },
          leaderboard: newLeaderboard
        }
    });
  };

  const handleInitiateTravel = (systemName: string) => {
    if (!gameState || systemName === gameState.currentSystem) return;
    const destination = gameState.systems.find(s => s.name === systemName);
    if (destination) {
        setTravelDestination(destination);
    }
  };

  const handleConfirmTravel = () => {
      if (!gameState || !travelDestination) return;

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
        
        const travelledState: GameState = {
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

  const handleRefuel = () => {
    setGameState(prev => {
      if (!prev) return null;
      
      const fuelNeeded = prev.playerStats.maxFuel - prev.playerStats.fuel;
      if (fuelNeeded <= 0) {
        toast({ title: "Refuel Not Needed", description: "Fuel tank is already full." });
        return prev;
      }

      const fuelPrice = 2; // credits per unit
      const totalCost = fuelNeeded * fuelPrice;

      if (prev.playerStats.netWorth < totalCost) {
        toast({ variant: "destructive", title: "Refuel Failed", description: `Not enough credits. You need ${totalCost}¢.` });
        return prev;
      }

      const newPlayerStats = { 
        ...prev.playerStats,
        netWorth: prev.playerStats.netWorth - totalCost,
        fuel: prev.playerStats.maxFuel,
      };

      toast({ title: "Refuel Complete", description: `You spent ${totalCost}¢ to refuel your ship.` });
      
      return { ...prev, playerStats: newPlayerStats };
    });
  };
  
  const handleUpgradeShip = (upgradeType: 'cargo' | 'weapon' | 'shield') => {
    setGameState(prev => {
        if (!prev) return null;

        let cost = 0;
        let newPlayerStats = { ...prev.playerStats };
        let canUpgrade = false;
        let toastTitle = "Upgrade Failed";
        let toastDescription = "An unknown error occurred.";

        if (upgradeType === 'cargo') {
            const currentTierIndex = cargoUpgrades.findIndex(u => u.capacity >= prev.playerStats.maxCargo);
            if (currentTierIndex !== -1 && currentTierIndex < cargoUpgrades.length - 1) {
                const nextTier = cargoUpgrades[currentTierIndex + 1];
                cost = nextTier.cost;
                if (prev.playerStats.netWorth >= cost) {
                    newPlayerStats.netWorth -= cost;
                    newPlayerStats.maxCargo = nextTier.capacity;
                    canUpgrade = true;
                    toastTitle = "Cargo Hold Upgraded!";
                    toastDescription = `Your maximum cargo capacity is now ${nextTier.capacity}t.`;
                }
            }
        } else if (upgradeType === 'weapon') {
            const currentTierIndex = weaponUpgrades.findIndex(u => u.level === prev.playerStats.weaponLevel);
            if (currentTierIndex !== -1 && currentTierIndex < weaponUpgrades.length - 1) {
                const nextTier = weaponUpgrades[currentTierIndex + 1];
                cost = nextTier.cost;
                 if (prev.playerStats.netWorth >= cost) {
                    newPlayerStats.netWorth -= cost;
                    newPlayerStats.weaponLevel = nextTier.level;
                    canUpgrade = true;
                    toastTitle = "Weapons Upgraded!";
                    toastDescription = `Your ship is now equipped with ${nextTier.name}.`;
                }
            }
        } else if (upgradeType === 'shield') {
            const currentTierIndex = shieldUpgrades.findIndex(u => u.level === prev.playerStats.shieldLevel);
            if (currentTierIndex !== -1 && currentTierIndex < shieldUpgrades.length - 1) {
                const nextTier = shieldUpgrades[currentTierIndex + 1];
                cost = nextTier.cost;
                 if (prev.playerStats.netWorth >= cost) {
                    newPlayerStats.netWorth -= cost;
                    newPlayerStats.shieldLevel = nextTier.level;
                    canUpgrade = true;
                    toastTitle = "Shields Upgraded!";
                    toastDescription = `Your ship is now equipped with a ${nextTier.name}.`;
                }
            }
        }
        
        if (!canUpgrade) {
            toast({ variant: "destructive", title: "Upgrade Failed", description: cost > 0 ? "Not enough credits." : "Already at max level." });
            return prev;
        }

        toast({ title: toastTitle, description: toastDescription });
        return { ...prev, playerStats: newPlayerStats };
    });
  };

  const handleCloseEncounterDialog = () => {
    setEncounterResult(null);
    setGameState(prev => {
        if (!prev) return null;
        return ({...prev, pirateEncounter: null})
    });
  };

  const travelFuelCost = gameState && travelDestination ? Math.round(Math.hypot(travelDestination.x - (gameState.systems.find(s => s.name === gameState.currentSystem)?.x || 0), travelDestination.y - (gameState.systems.find(s => s.name === gameState.currentSystem)?.y || 0)) / 5) : 0;

  const value: GameContextType = {
    gameState,
    isClient,
    isSimulating,
    isResolvingEncounter,
    isGeneratingAvatar,
    isGeneratingBio,
    isScanning,
    isGeneratingQuests,
    chartItem,
    setChartItem,
    handleTrade,
    handleInitiateTrade,
    handleSimulateMarket,
    handlePirateAction,
    handleGenerateAvatar,
    handleGenerateBio,
    handleGenerateQuests,
    setPlayerName,
    handleInitiateTravel,
    handleRefuel,
    handleUpgradeShip,
    cargoUpgrades,
    weaponUpgrades,
    shieldUpgrades,
  };

  return (
    <GameContext.Provider value={value}>
        {children}
        {gameState && <>
            {gameState.pirateEncounter && (
                <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
                    <PirateEncounter pirate={gameState.pirateEncounter} onAction={handlePirateAction} isResolving={isResolvingEncounter || isScanning} />
                </div>
            )}
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
        </>}
        <Toaster />
    </GameContext.Provider>
  );
}
