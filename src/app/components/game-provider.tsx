'use client';

import { createContext, useContext, useState, useEffect, useTransition, ReactNode, useCallback } from 'react';
import type { GameState, MarketItem, PriceHistory, EncounterResult, System, Route, Pirate, PlayerStats, Quest, CargoUpgrade, WeaponUpgrade, ShieldUpgrade, LeaderboardEntry, InventoryItem, SystemEconomy, ItemCategory, CrewMember, ShipForSale } from '@/lib/types';
import { runMarketSimulation, resolveEncounter, runAvatarGeneration, runEventGeneration, runPirateScan, runBioGeneration, runQuestGeneration, runTraderGeneration } from '@/app/actions';
import { STATIC_ITEMS } from '@/lib/items';
import { SHIPS_FOR_SALE } from '@/lib/ships';

import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import TradeDialog from './trade-dialog';
import { Loader2, ShieldCheck, AlertTriangle, Factory, Wheat, Cpu, Hammer, Recycle } from 'lucide-react';
import PirateEncounter from './pirate-encounter';

const systems: System[] = [
    { name: 'Sol', x: 20, y: 30, security: 'High', economy: 'Industrial', volatility: 0.1 },
    { name: 'Kepler-186f', x: 45, y: 65, security: 'Medium', economy: 'Agricultural', volatility: 0.3 },
    { name: 'Sirius', x: 75, y: 25, security: 'High', economy: 'High-Tech', volatility: 0.2 },
    { name: 'Proxima Centauri', x: 80, y: 80, security: 'Low', economy: 'Extraction', volatility: 0.5 },
    { name: 'TRAPPIST-1', x: 5, y: 85, security: 'Anarchy', economy: 'Refinery', volatility: 0.8 },
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
    { capacity: 225, cost: 50000 },
    { capacity: 300, cost: 100000 },
];
const weaponUpgrades: WeaponUpgrade[] = [
    { level: 1, name: 'Mk. I Laser', cost: 0 },
    { level: 2, name: 'Mk. II Pulse Laser', cost: 10000 },
    { level: 3, name: 'Mk. III Plasma Cannon', cost: 30000 },
    { level: 4, name: 'Mk. IV Ion Repeater', cost: 75000 },
    { level: 5, name: 'Mk. V Neutron Blaster', cost: 150000 },
];
const shieldUpgrades: ShieldUpgrade[] = [
    { level: 1, name: 'Class-A Deflector', cost: 0 },
    { level: 2, name: 'Class-B Field', cost: 7500 },
    { level: 3, name: 'Class-C Barrier', cost: 20000 },
    { level: 4, name: 'Class-D Force Field', cost: 50000 },
    { level: 5, name: 'Class-E Aegis Shielding', cost: 120000 },
];

const securityConfig: Record<System['security'], { color: string; icon: React.ReactNode }> = {
    'High': { color: 'text-green-400', icon: <ShieldCheck className="h-4 w-4"/> },
    'Medium': { color: 'text-yellow-400', icon: <ShieldCheck className="h-4 w-4"/> },
    'Low': { color: 'text-orange-400', icon: <AlertTriangle className="h-4 w-4"/> },
    'Anarchy': { color: 'text-destructive', icon: <AlertTriangle className="h-4 w-4"/> },
};

const economyIcons: Record<System['economy'], React.ReactNode> = {
    'Industrial': <Factory className="h-4 w-4"/>,
    'Agricultural': <Wheat className="h-4 w-4"/>,
    'High-Tech': <Cpu className="h-4 w-4"/>,
    'Extraction': <Hammer className="h-4 w-4"/>,
    'Refinery': <Recycle className="h-4 w-4"/>,
};

const ECONOMY_MULTIPLIERS: Record<ItemCategory, Record<SystemEconomy, number>> = {
    'Biological':   { 'Agricultural': 0.7, 'High-Tech': 1.2, 'Industrial': 1.3, 'Extraction': 1.1, 'Refinery': 1.2 },
    'Industrial':   { 'Agricultural': 1.3, 'High-Tech': 1.1, 'Industrial': 0.7, 'Extraction': 1.2, 'Refinery': 0.8 },
    'Pleasure':     { 'Agricultural': 1.1, 'High-Tech': 1.2, 'Industrial': 1.1, 'Extraction': 1.0, 'Refinery': 1.0 },
    'Food':         { 'Agricultural': 0.6, 'High-Tech': 1.2, 'Industrial': 1.3, 'Extraction': 1.4, 'Refinery': 1.2 },
    'Military':     { 'Agricultural': 1.4, 'High-Tech': 1.1, 'Industrial': 1.2, 'Extraction': 1.0, 'Refinery': 1.0 },
    'Technology':   { 'Agricultural': 1.3, 'High-Tech': 0.7, 'Industrial': 1.1, 'Extraction': 1.2, 'Refinery': 1.2 },
    'Minerals':     { 'Agricultural': 1.2, 'High-Tech': 1.1, 'Industrial': 0.9, 'Extraction': 0.7, 'Refinery': 0.8 },
    'Illegal':      { 'Agricultural': 1.1, 'High-Tech': 1.2, 'Industrial': 1.0, 'Extraction': 1.3, 'Refinery': 1.4 },
};

function calculatePrice(basePrice: number, supply: number, demand: number, economyMultiplier: number): number {
    const demandFactor = demand / supply;
    const price = basePrice * economyMultiplier * Math.pow(demandFactor, 0.5);
    return Math.round(price);
}

function calculateCurrentCargo(inventory: InventoryItem[]): number {
    return inventory.reduce((acc, item) => {
        const staticItem = STATIC_ITEMS.find(si => si.name === item.name);
        return acc + (staticItem ? staticItem.cargoSpace * item.owned : 0);
    }, 0);
}


function generateRandomPirate(): Pirate {
    return {
        name: pirateNames[Math.floor(Math.random() * pirateNames.length)],
        shipType: shipTypes[Math.floor(Math.random() * shipTypes.length)],
        threatLevel: threatLevels[Math.floor(Math.random() * threatLevels.length)],
    }
}

const initialCrew: CrewMember[] = [
    { id: 'eng-01', name: 'Zara "Sparks" Kosari', role: 'Engineer', description: 'Reduces travel fuel consumption by 5%.', salary: 500 },
    { id: 'gun-01', name: 'Rook', role: 'Gunner', description: 'Increases weapon effectiveness in combat.', salary: 750 },
];

const initialGameState: Omit<GameState, 'marketItems'> = {
  playerStats: {
    name: 'You',
    bio: 'A mysterious trader with a past yet to be written. The galaxy is full of opportunity, and your story is just beginning.',
    netWorth: 10000,
    fuel: 100,
    maxFuel: 100,
    cargo: 0,
    maxCargo: 50,
    shipHealth: 100,
    maxShipHealth: 100,
    insurance: true,
    avatarUrl: 'https://placehold.co/96x96/1A2942/7DD3FC.png',
    weaponLevel: 1,
    shieldLevel: 1,
    fleetSize: 1,
    pirateRisk: 0,
    reputation: 0,
  },
  inventory: [{ name: 'Quantum Filament Spools', owned: 5 }],
  priceHistory: Object.fromEntries(STATIC_ITEMS.map(item => [item.name, [item.basePrice]])),
  leaderboard: [
    { rank: 1, trader: 'You', netWorth: 10000, fleetSize: 1 },
  ],
  pirateEncounter: null,
  systems: systems,
  routes: routes,
  currentSystem: 'Sol',
  quests: [],
  crew: initialCrew,
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
  handleInitiateTrade: (itemName: string, type: 'buy' | 'sell') => void;
  handlePirateAction: (action: 'fight' | 'evade' | 'bribe' | 'scan') => void;
  handleGenerateAvatar: (description: string) => void;
  handleGenerateBio: (name?: string) => void;
  handleGenerateQuests: () => void;
  setPlayerName: (name: string) => void;
  handleInitiateTravel: (systemName: string) => void;
  handleRefuel: () => void;
  handleRepairShip: () => void;
  handleUpgradeShip: (upgradeType: 'cargo' | 'weapon' | 'shield') => void;
  handleDowngradeShip: (upgradeType: 'cargo' | 'weapon' | 'shield') => void;
  handlePurchaseShip: (ship: ShipForSale) => void;
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
  const [chartItem, setChartItem] = useState<string>(STATIC_ITEMS[0].name);
  const [encounterResult, setEncounterResult] = useState<EncounterResult | null>(null);
  const [tradeDetails, setTradeDetails] = useState<{ item: MarketItem, type: 'buy' | 'sell' } | null>(null);
  const [travelDestination, setTravelDestination] = useState<System | null>(null);
  
  const calculateMarketDataForSystem = (system: System): MarketItem[] => {
        return STATIC_ITEMS.map(staticItem => {
            const economyMultiplier = ECONOMY_MULTIPLIERS[staticItem.category][system.economy];
            const supply = Math.round(100 / economyMultiplier);
            const demand = Math.round(100 * economyMultiplier);
            const currentPrice = calculatePrice(staticItem.basePrice, supply, demand, economyMultiplier);
            return {
                name: staticItem.name,
                currentPrice,
                supply,
                demand,
            };
        });
    };

  useEffect(() => {
    setIsClient(true);
    const loadGame = async () => {
        try {
            const savedStateJSON = localStorage.getItem('heggieGameState');
            if (savedStateJSON) {
                const savedState = JSON.parse(savedStateJSON);
                if (savedState.playerStats && savedState.inventory && savedState.marketItems) {
                     setGameState({
                        ...initialGameState,
                        ...savedState,
                        playerStats: {
                            ...initialGameState.playerStats,
                            ...savedState.playerStats,
                            cargo: calculateCurrentCargo(savedState.inventory),
                        },
                    });
                    setChartItem(savedState.marketItems[0]?.name || STATIC_ITEMS[0].name);
                    return;
                }
            }

            // New game initialization
            const [tradersResult, questsResult] = await Promise.all([
                runTraderGeneration(),
                runQuestGeneration()
            ]);

            const newLeaderboard: Omit<LeaderboardEntry, 'rank'>[] = tradersResult.traders.map(t => ({
                trader: t.name,
                netWorth: t.netWorth,
                fleetSize: t.fleetSize,
            }));

            const playerStats = {
                ...initialGameState.playerStats,
                cargo: calculateCurrentCargo(initialGameState.inventory)
            };
            
            newLeaderboard.push({
                trader: 'You',
                netWorth: playerStats.netWorth,
                fleetSize: playerStats.fleetSize
            });
            
            const sortedLeaderboard = newLeaderboard
                .sort((a, b) => b.netWorth - a.netWorth)
                .map((entry, index) => ({ ...entry, rank: index + 1 }));

            const currentSystem = initialGameState.systems.find(s => s.name === initialGameState.currentSystem)!;
            const marketItems = calculateMarketDataForSystem(currentSystem);

            const newGameState: GameState = {
                ...initialGameState,
                playerStats,
                marketItems,
                leaderboard: sortedLeaderboard,
                quests: questsResult.quests,
            };
            
            setGameState(newGameState);
            setChartItem(marketItems[0]?.name || STATIC_ITEMS[0].name);
            toast({ title: "Welcome, Captain!", description: "Your journey begins. Check the quest board for your first missions." });

        } catch (error) {
            console.error("Failed to load or initialize game state:", error);
            // Fallback to a default state
            const currentSystem = initialGameState.systems.find(s => s.name === initialGameState.currentSystem)!;
            const marketItems = calculateMarketDataForSystem(currentSystem);
            const playerStats = {...initialGameState.playerStats, cargo: calculateCurrentCargo(initialGameState.inventory)};
            setGameState({...initialGameState, playerStats, marketItems });
            toast({ variant: "destructive", title: "Initialization Failed", description: "Could not connect to game services. Using default state." });
        }
    };
    loadGame();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isClient && gameState) {
      try {
        const player = gameState.leaderboard.find(e => e.trader === 'You' || e.trader === gameState.playerStats.name);

        const leaderboardWithPlayer = gameState.leaderboard.map(entry => {
            if (player && entry.rank === player.rank) {
                return { ...entry, trader: gameState.playerStats.name, netWorth: gameState.playerStats.netWorth, fleetSize: gameState.playerStats.fleetSize || 1 };
            }
            if(entry.trader === 'You' && !player) { // First time name change
                 return { ...entry, trader: gameState.playerStats.name, netWorth: gameState.playerStats.netWorth, fleetSize: gameState.playerStats.fleetSize || 1 };
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
      
      const marketItem = prev.marketItems.find(i => i.name === itemName);
      const staticItemData = STATIC_ITEMS.find(i => i.name === itemName);
      if (!marketItem || !staticItemData) return prev;

      const newPlayerStats = { ...prev.playerStats };
      const newInventory = [...prev.inventory];
      const inventoryItemIndex = newInventory.findIndex(i => i.name === itemName);
      let inventoryItem = newInventory[inventoryItemIndex];

      const totalCost = marketItem.currentPrice * amount;
      const totalCargo = staticItemData.cargoSpace * amount;

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

        if (inventoryItem) {
            newInventory[inventoryItemIndex] = { ...inventoryItem, owned: inventoryItem.owned + amount };
        } else {
            newInventory.push({ name: itemName, owned: amount });
        }

        if (staticItemData.rarity === 'Rare' || staticItemData.rarity === 'Ultra Rare') {
            const riskIncrease = staticItemData.rarity === 'Ultra Rare' ? 0.05 : 0.02;
            newPlayerStats.pirateRisk = Math.min(newPlayerStats.pirateRisk + riskIncrease, 0.5);
        }

      } else { // sell
        if (!inventoryItem || inventoryItem.owned < amount) {
          toast({ variant: "destructive", title: "Transaction Failed", description: "Not enough items to sell." });
          return prev;
        }
        newPlayerStats.netWorth += totalCost;
        newInventory[inventoryItemIndex] = { ...inventoryItem, owned: inventoryItem.owned - amount };
      }
      
      const updatedInventory = newInventory.filter(item => item.owned > 0);
      newPlayerStats.cargo = calculateCurrentCargo(updatedInventory);

      const repGain = Math.max(1, Math.round(totalCost / 5000));
      newPlayerStats.reputation = Math.min(100, newPlayerStats.reputation + repGain);

      return { ...prev, playerStats: newPlayerStats, inventory: updatedInventory };
    });
  };

  const handleInitiateTrade = (itemName: string, type: 'buy' | 'sell') => {
    if(!gameState) return;
    const item = gameState.marketItems.find(i => i.name === itemName);
    if (item) {
        setTradeDetails({ item, type });
    }
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
        const currentSystem = gameState.systems.find(s => s.name === gameState.currentSystem)!;
        const input = {
            action,
            playerNetWorth: gameState.playerStats.netWorth,
            playerCargo: gameState.playerStats.cargo,
            pirateName: gameState.pirateEncounter!.name,
            pirateThreatLevel: gameState.pirateEncounter!.threatLevel,
            hasGunner: gameState.crew.some(c => c.role === 'Gunner'),
            shipHealth: gameState.playerStats.shipHealth,
            weaponLevel: gameState.playerStats.weaponLevel,
            shieldLevel: gameState.playerStats.shieldLevel,
        };
        try {
            const result = await resolveEncounter(input);
            setEncounterResult(result);

            setGameState(prev => {
                if (!prev) return null;
                const newPlayerStats = { ...prev.playerStats };
                newPlayerStats.netWorth -= result.creditsLost;
                newPlayerStats.shipHealth = Math.max(0, newPlayerStats.shipHealth - result.damageTaken);

                const securityValue = { 'High': 2, 'Medium': 1, 'Low': -1, 'Anarchy': -2 };
                let repChange = 0;
                if (action === 'fight') {
                    if (result.outcome === 'success') {
                        repChange = 5 + securityValue[currentSystem.security];
                    } else {
                        repChange = -5 + securityValue[currentSystem.security];
                    }
                } else if (action === 'bribe') {
                    repChange = -3;
                }
                newPlayerStats.reputation = Math.max(-100, Math.min(100, newPlayerStats.reputation + repChange));

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

    const currentSystem = gameState.systems.find(s => s.name === gameState.currentSystem)!;

    const distance = Math.hypot(travelDestination.x - currentSystem.x, travelDestination.y - currentSystem.y);
    let fuelCost = Math.round(distance / 5);
    
    const hasEngineer = gameState.crew.some(c => c.role === 'Engineer');
    if (hasEngineer) {
        fuelCost = Math.round(fuelCost * 0.95);
    }

    if (gameState.playerStats.shipHealth < 50) {
      fuelCost = Math.round(fuelCost * 1.25);
    }

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
      try {
        let baseEncounterChance = 0;
        switch (travelDestination.security) {
            case 'Anarchy': baseEncounterChance = 0.4; break;
            case 'Low': baseEncounterChance = 0.2; break;
            case 'Medium': baseEncounterChance = 0.05; break;
            case 'High': baseEncounterChance = 0.0; break;
        }

        const totalEncounterChance = baseEncounterChance + gameState.playerStats.pirateRisk;
        const pirateEncounter = Math.random() < totalEncounterChance ? generateRandomPirate() : null;

        const eventResult = await runEventGeneration();
        const eventDescription = eventResult.eventDescription;

        const baseMarketItems = calculateMarketDataForSystem(travelDestination);
        
        const simulationInput = {
          items: baseMarketItems,
          systemEconomy: travelDestination.economy,
          systemVolatility: travelDestination.volatility,
          eventDescription,
        };

        const simulationResult = await runMarketSimulation(simulationInput);
        
        const newMarketItems: MarketItem[] = [...baseMarketItems];
        simulationResult.forEach(update => {
            const itemIndex = newMarketItems.findIndex(i => i.name === update.name);
            if (itemIndex !== -1) {
              const staticItem = STATIC_ITEMS.find(si => si.name === update.name)!;
              const economyMultiplier = ECONOMY_MULTIPLIERS[staticItem.category][travelDestination.economy];
              
              newMarketItems[itemIndex].supply = update.newSupply;
              newMarketItems[itemIndex].demand = update.newDemand;
              newMarketItems[itemIndex].currentPrice = calculatePrice(staticItem.basePrice, update.newSupply, update.newDemand, economyMultiplier);
            }
        });
        
        const updatedLeaderboard = gameState.leaderboard.map(entry => {
            if (entry.trader !== gameState.playerStats.name && entry.trader !== 'You') {
                const changePercent = (Math.random() - 0.45) * 0.1; // Fluctuation between -4.5% and +5.5%
                const newNetWorth = Math.round(entry.netWorth * (1 + changePercent));
                return { ...entry, netWorth: newNetWorth > 100000 ? newNetWorth : 100000 };
            }
            return entry;
        });

        setGameState(prev => {
          if (!prev) return null;
          
          const newPlayerStats = {
              ...prev.playerStats,
              fuel: prev.playerStats.fuel - fuelCost,
              pirateRisk: pirateEncounter ? 0 : Math.max(0, prev.playerStats.pirateRisk - 0.05)
          };

          const newPriceHistory = { ...prev.priceHistory };
          newMarketItems.forEach(item => {
              if (newPriceHistory[item.name]) {
                  newPriceHistory[item.name] = [...newPriceHistory[item.name], item.currentPrice].slice(-20);
              } else {
                  newPriceHistory[item.name] = [item.currentPrice];
              }
          });

          return {
              ...prev,
              playerStats: newPlayerStats,
              currentSystem: travelDestination.name,
              pirateEncounter,
              marketItems: newMarketItems,
              priceHistory: newPriceHistory,
              leaderboard: updatedLeaderboard,
          }
        });

        toast({
            title: "Arrival: Galactic News Flash!",
            description: `${eventDescription} You arrived safely at ${travelDestination.name}.`
        });
      } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({ variant: "destructive", title: "Warp Drive Malfunction", description: errorMessage });
        setTravelDestination(null);
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

  const handleRepairShip = () => {
    setGameState(prev => {
        if (!prev) return null;
        const currentSystem = systems.find(s => s.name === prev.currentSystem);
        if (!currentSystem) return prev;

        const damageToRepair = prev.playerStats.maxShipHealth - prev.playerStats.shipHealth;
        if (damageToRepair <= 0) {
            toast({ title: "Repairs Not Needed", description: "Ship integrity is at 100%." });
            return prev;
        }

        const baseRepairPricePerPoint = 50;
        const economyModifiers = { 'Industrial': 0.8, 'High-Tech': 0.9, 'Refinery': 1.1, 'Extraction': 1.2, 'Agricultural': 1.3 };
        const securityModifiers = { 'High': 0.9, 'Medium': 1.0, 'Low': 1.2, 'Anarchy': 1.5 };
        
        const economyMod = economyModifiers[currentSystem.economy];
        const securityMod = securityModifiers[currentSystem.security];

        const totalCost = Math.round(damageToRepair * baseRepairPricePerPoint * economyMod * securityMod);

        if (prev.playerStats.netWorth < totalCost) {
            toast({ variant: "destructive", title: "Repairs Failed", description: `Not enough credits. You need ${totalCost}¢.` });
            return prev;
        }

        const newPlayerStats = {
            ...prev.playerStats,
            netWorth: prev.playerStats.netWorth - totalCost,
            shipHealth: prev.playerStats.maxShipHealth,
        };

        toast({ title: "Repairs Complete", description: `You spent ${totalCost}¢ to restore your ship's hull.` });

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
            const currentTierIndex = cargoUpgrades.findIndex(u => u.capacity === prev.playerStats.maxCargo);
            if (currentTierIndex !== -1 && currentTierIndex < cargoUpgrades.length - 1) {
                const currentTier = cargoUpgrades[currentTierIndex];
                const nextTier = cargoUpgrades[currentTierIndex + 1];
                cost = nextTier.cost - currentTier.cost;
                if (prev.playerStats.netWorth >= cost) {
                    newPlayerStats.netWorth -= cost;
                    newPlayerStats.maxCargo = nextTier.capacity;
                    canUpgrade = true;
                    toastTitle = "Cargo Hold Upgraded!";
                    toastDescription = `Your maximum cargo capacity is now ${nextTier.capacity}t.`;
                } else {
                    toastDescription = `Not enough credits. You need ${cost.toLocaleString()}¢.`;
                }
            }
        } else if (upgradeType === 'weapon') {
            const currentTierIndex = weaponUpgrades.findIndex(u => u.level === prev.playerStats.weaponLevel);
            if (currentTierIndex !== -1 && currentTierIndex < weaponUpgrades.length - 1) {
                const currentTier = weaponUpgrades[currentTierIndex];
                const nextTier = weaponUpgrades[currentTierIndex + 1];
                cost = nextTier.cost - currentTier.cost;
                 if (prev.playerStats.netWorth >= cost) {
                    newPlayerStats.netWorth -= cost;
                    newPlayerStats.weaponLevel = nextTier.level;
                    canUpgrade = true;
                    toastTitle = "Weapons Upgraded!";
                    toastDescription = `Your ship is now equipped with ${nextTier.name}.`;
                } else {
                    toastDescription = `Not enough credits. You need ${cost.toLocaleString()}¢.`;
                }
            }
        } else if (upgradeType === 'shield') {
            const currentTierIndex = shieldUpgrades.findIndex(u => u.level === prev.playerStats.shieldLevel);
            if (currentTierIndex !== -1 && currentTierIndex < shieldUpgrades.length - 1) {
                const currentTier = shieldUpgrades[currentTierIndex];
                const nextTier = shieldUpgrades[currentTierIndex + 1];
                cost = nextTier.cost - currentTier.cost;
                 if (prev.playerStats.netWorth >= cost) {
                    newPlayerStats.netWorth -= cost;
                    newPlayerStats.shieldLevel = nextTier.level;
                    canUpgrade = true;
                    toastTitle = "Shields Upgraded!";
                    toastDescription = `Your ship is now equipped with a ${nextTier.name}.`;
                } else {
                    toastDescription = `Not enough credits. You need ${cost.toLocaleString()}¢.`;
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
  
  const handleDowngradeShip = (upgradeType: 'cargo' | 'weapon' | 'shield') => {
    setGameState(prev => {
        if (!prev) return null;

        let refund = 0;
        let newPlayerStats = { ...prev.playerStats };
        let canDowngrade = false;
        let toastTitle = "Downgrade Successful!";
        let toastDescription = "";
        const sellPercentage = 0.75;

        if (upgradeType === 'cargo') {
            const currentTierIndex = cargoUpgrades.findIndex(u => u.capacity === prev.playerStats.maxCargo);
            if (currentTierIndex > 0) {
                const currentTier = cargoUpgrades[currentTierIndex];
                const previousTier = cargoUpgrades[currentTierIndex - 1];
                refund = Math.round((currentTier.cost - previousTier.cost) * sellPercentage);
                newPlayerStats.netWorth += refund;
                newPlayerStats.maxCargo = previousTier.capacity;
                canDowngrade = true;
                toastDescription = `Cargo hold downgraded. You received ${refund.toLocaleString()}¢.`;
            }
        } else if (upgradeType === 'weapon') {
            const currentTierIndex = weaponUpgrades.findIndex(u => u.level === prev.playerStats.weaponLevel);
             if (currentTierIndex > 0) {
                const currentTier = weaponUpgrades[currentTierIndex];
                const previousTier = weaponUpgrades[currentTierIndex - 1];
                refund = Math.round((currentTier.cost - previousTier.cost) * sellPercentage);
                newPlayerStats.netWorth += refund;
                newPlayerStats.weaponLevel = previousTier.level;
                canDowngrade = true;
                toastDescription = `Weapons system downgraded to ${previousTier.name}. You received ${refund.toLocaleString()}¢.`;
            }
        } else if (upgradeType === 'shield') {
            const currentTierIndex = shieldUpgrades.findIndex(u => u.level === prev.playerStats.shieldLevel);
             if (currentTierIndex > 0) {
                const currentTier = shieldUpgrades[currentTierIndex];
                const previousTier = shieldUpgrades[currentTierIndex - 1];
                refund = Math.round((currentTier.cost - previousTier.cost) * sellPercentage);
                newPlayerStats.netWorth += refund;
                newPlayerStats.shieldLevel = previousTier.level;
                canDowngrade = true;
                toastDescription = `Shields downgraded to ${previousTier.name}. You received ${refund.toLocaleString()}¢.`;
            }
        }
        
        if (!canDowngrade) {
            toast({ variant: "destructive", title: "Downgrade Failed", description: "Cannot downgrade further." });
            return prev;
        }

        toast({ title: toastTitle, description: toastDescription });
        return { ...prev, playerStats: newPlayerStats };
    });
  };

  const handlePurchaseShip = (ship: ShipForSale) => {
    setGameState(prev => {
        if (!prev) return null;
        if (prev.playerStats.netWorth < ship.cost) {
            toast({ variant: "destructive", title: "Purchase Failed", description: "Insufficient credits." });
            return prev;
        }

        const newPlayerStats = {
            ...prev.playerStats,
            netWorth: prev.playerStats.netWorth - ship.cost,
            fleetSize: prev.playerStats.fleetSize + 1,
        };

        toast({ title: "Ship Purchased!", description: `The ${ship.name} has been added to your fleet.` });

        const newLeaderboard = prev.leaderboard.map(entry => {
            if (entry.trader === prev.playerStats.name || entry.trader === 'You') {
                return { ...entry, netWorth: newPlayerStats.netWorth, fleetSize: newPlayerStats.fleetSize };
            }
            return entry;
        }).sort((a, b) => b.netWorth - a.netWorth).map((entry, index) => ({ ...entry, rank: index + 1 }));

        return { ...prev, playerStats: newPlayerStats, leaderboard: newLeaderboard };
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
    handlePirateAction,
    handleGenerateAvatar,
    handleGenerateBio,
    handleGenerateQuests,
    setPlayerName,
    handleInitiateTravel,
    handleRefuel,
    handleRepairShip,
    handleUpgradeShip,
    handleDowngradeShip,
    handlePurchaseShip,
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
                        <p><strong>Cargo Lost:</strong> <span className="font-mono text-sky-400">{encounterResult.cargoLost} (value)</span></p>
                        <p><strong>Hull Damage:</strong> <span className="font-mono text-destructive">{encounterResult.damageTaken}%</span></p>
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
                            You are about to travel to the <span className="font-bold text-primary">{travelDestination.name}</span> system. This will consume fuel and may attract unwanted attention.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="text-sm space-y-3 rounded-md border border-border/50 p-4 bg-card/50">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Destination</span>
                                <span className="font-mono text-primary">{travelDestination.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-muted-foreground">Security</span>
                               <span className={`font-mono flex items-center gap-1.5 ${securityConfig[travelDestination.security].color}`}>
                                    {securityConfig[travelDestination.security].icon}
                                    {travelDestination.security}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-muted-foreground">Economy</span>
                               <span className="font-mono flex items-center gap-1.5 text-primary">
                                    {economyIcons[travelDestination.economy]}
                                    {travelDestination.economy}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Estimated Fuel Cost</span>
                                <span className="font-mono text-amber-400">{travelFuelCost} SU</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Remaining Fuel</span>
                                <span className={`font-mono ${gameState.playerStats.fuel - travelFuelCost < 0 ? 'text-destructive' : ''}`}>
                                    {gameState.playerStats.fuel - travelFuelCost} SU
                                </span>
                            </div>
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
                inventory={gameState.inventory}
                onTrade={handleTrade}
            />
        </>}
        <Toaster />
    </GameContext.Provider>
  );
}
