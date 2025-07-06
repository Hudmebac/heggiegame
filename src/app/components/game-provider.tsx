
'use client';

import { createContext, useContext, useState, useEffect, useTransition, ReactNode, useCallback } from 'react';
import type { GameState, MarketItem, PriceHistory, EncounterResult, System, Route, Pirate, PlayerStats, Quest, CargoUpgrade, WeaponUpgrade, ShieldUpgrade, LeaderboardEntry, InventoryItem, SystemEconomy, ItemCategory, CrewMember, ShipForSale, ZoneType, StaticItem, HullUpgrade, FuelUpgrade, SensorUpgrade, Planet } from '@/lib/types';
import { runMarketSimulation, resolveEncounter, runAvatarGeneration, runEventGeneration, runPirateScan, runBioGeneration, runQuestGeneration, runTraderGeneration } from '@/app/actions';
import { STATIC_ITEMS } from '@/lib/items';
import { SHIPS_FOR_SALE } from '@/lib/ships';
import { AVAILABLE_CREW } from '@/lib/crew';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades } from '@/lib/upgrades';
import { SYSTEMS, ROUTES } from '@/lib/systems';

import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import TradeDialog from './trade-dialog';
import { Loader2, ShieldCheck, AlertTriangle, Factory, Wheat, Cpu, Hammer, Recycle, Info, Orbit as PlanetIcon, Send, Globe } from 'lucide-react';
import PirateEncounter from './pirate-encounter';

const pirateNames = ['Dread Captain "Scar" Ironheart', 'Admiral "Voidgazer" Kael', 'Captain "Mad" Mel', 'Commander "Hex" Stryker'];
const shipTypes = ['Marauder-class Corvette', 'Reaper-class Frigate', 'Void-reaver Battleship', 'Shadow-class Interceptor'];
const threatLevels: Pirate['threatLevel'][] = ['Low', 'Medium', 'High', 'Critical'];

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
    'Marketing':    { 'Agricultural': 1.0, 'High-Tech': 1.0, 'Industrial': 1.0, 'Extraction': 1.0, 'Refinery': 1.0 },
    'Scientific':   { 'Agricultural': 1.2, 'High-Tech': 0.8, 'Industrial': 1.1, 'Extraction': 1.1, 'Refinery': 1.0 },
    'Robotic':      { 'Agricultural': 1.3, 'High-Tech': 0.9, 'Industrial': 0.8, 'Extraction': 1.2, 'Refinery': 1.1 },
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


function generateRandomPirate(hasNavigator: boolean): Pirate {
    const weightedThreats: Pirate['threatLevel'][] = hasNavigator
        ? ['Low', 'Low', 'Low', 'Medium', 'Medium', 'Medium', 'High', 'High', 'Critical'] // Skewed probabilities with Navigator
        : ['Low', 'Medium', 'High', 'Critical']; // Even probabilities

    const threat = weightedThreats[Math.floor(Math.random() * weightedThreats.length)];

    return {
        name: pirateNames[Math.floor(Math.random() * pirateNames.length)],
        shipType: shipTypes[Math.floor(Math.random() * shipTypes.length)],
        threatLevel: threat,
    }
}

const initialCrew: CrewMember[] = [AVAILABLE_CREW[0], AVAILABLE_CREW[1]];

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
    hullLevel: 1,
    fuelLevel: 1,
    sensorLevel: 1,
    fleetSize: 1,
    pirateRisk: 0,
    reputation: 0,
  },
  inventory: [{ name: 'Silicon Nuggets (Standard)', owned: 5 }],
  priceHistory: Object.fromEntries(STATIC_ITEMS.map(item => [item.name, [item.basePrice]])),
  leaderboard: [
    { rank: 1, trader: 'You', netWorth: 10000, fleetSize: 1 },
  ],
  pirateEncounter: null,
  systems: SYSTEMS,
  routes: ROUTES,
  currentSystem: 'Sol',
  currentPlanet: 'Earth',
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
  handlePirateAction: (action: 'fight' | 'evade' | 'bribe') => void;
  handleGenerateAvatar: (description: string) => void;
  handleGenerateBio: (name?: string) => void;
  handleGenerateQuests: () => void;
  setPlayerName: (name: string) => void;
  handleInitiateTravel: (systemName: string) => void;
  handlePlanetTravel: (planetName: string) => void;
  handleRefuel: () => void;
  handleRepairShip: () => void;
  handleUpgradeShip: (upgradeType: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor') => void;
  handleDowngradeShip: (upgradeType: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor') => void;
  handlePurchaseShip: (ship: ShipForSale) => void;
  handleHireCrew: (crewId: string) => void;
  handleFireCrew: (crewId: string) => void;
  updateTraderBio: (traderName: string, bio: string) => void;
  cargoUpgrades: CargoUpgrade[];
  weaponUpgrades: WeaponUpgrade[];
  shieldUpgrades: ShieldUpgrade[];
  hullUpgrades: HullUpgrade[];
  fuelUpgrades: FuelUpgrade[];
  sensorUpgrades: SensorUpgrade[];
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
  
  const calculateMarketDataForSystem = useCallback((system: System): MarketItem[] => {
        const availableItems: MarketItem[] = [];
        const zoneType = system.zoneType;

        STATIC_ITEMS.forEach(staticItem => {
            const economyMultiplier = ECONOMY_MULTIPLIERS[staticItem.category]?.[system.economy] ?? 1.0;
            const isProducer = economyMultiplier < 1.0;
            const isConsumer = economyMultiplier > 1.0;
            
            let availabilityChance = 0.6; 
            if (isProducer) availabilityChance = 1.0; 
            else if (isConsumer) availabilityChance = 0.8; 

            if (staticItem.category === 'Illegal') {
                if (system.security === 'Anarchy') availabilityChance = 0.75;
                else if (system.security === 'Low') availabilityChance = 0.25;
                else availabilityChance = 0;
            }
            
            if (zoneType === 'Mining Colony' && staticItem.category === 'Minerals') {
                availabilityChance *= 1.5;
            }
            if (zoneType === 'Frontier Outpost' && staticItem.category === 'Illegal') {
                availabilityChance = system.security === 'Anarchy' ? 0.8 : 0.4;
            }
            if (zoneType === 'Trade Hub') {
                availabilityChance *= 1.2;
            }
            if (zoneType === 'Ancient Ruins' && (staticItem.grade === 'Quantum' || staticItem.grade === 'Singularity')) {
                availabilityChance = 0.05;
            } else if (zoneType !== 'Ancient Ruins' && (staticItem.grade === 'Quantum' || staticItem.grade === 'Singularity')) {
                availabilityChance = 0;
            }
            
            if (staticItem.grade === 'Salvaged') {
                if(zoneType === 'Frontier Outpost' || system.security === 'Anarchy') {
                    availabilityChance *= 1.5;
                } else {
                    availabilityChance *= 0.5;
                }
            }


            if (Math.random() < availabilityChance) {
                const supply = isProducer ? Math.round(150 + Math.random() * 50) : Math.round(20 + Math.random() * 30);
                const demand = isProducer ? Math.round(20 + Math.random() * 30) : Math.round(150 + Math.random() * 50);

                const currentPrice = calculatePrice(staticItem.basePrice, supply, demand, economyMultiplier);
                
                availableItems.push({
                    name: staticItem.name,
                    currentPrice,
                    supply,
                    demand,
                });
            }
        });

        return availableItems;
    }, []);

  useEffect(() => {
    setIsClient(true);
    const loadGame = async () => {
        try {
            const savedStateJSON = localStorage.getItem('heggieGameState');
            if (savedStateJSON) {
                const savedState = JSON.parse(savedStateJSON);
                
                if (savedState.playerStats && savedState.inventory && savedState.marketItems) {
                    const currentSystemFromSave = SYSTEMS.find(s => s.name === savedState.currentSystem)!;
                    
                    const firstMarketItemName = savedState.marketItems[0]?.name;
                    const isMarketDataStale = !firstMarketItemName || !STATIC_ITEMS.some(si => si.name === firstMarketItemName);
                    
                    const marketItems = isMarketDataStale
                        ? calculateMarketDataForSystem(currentSystemFromSave)
                        : savedState.marketItems;

                    const validInventory = savedState.inventory.filter((item: InventoryItem) => 
                        STATIC_ITEMS.some(si => si.name === item.name)
                    );

                    setGameState({
                        ...initialGameState,
                        ...savedState,
                        marketItems,
                        inventory: validInventory,
                        playerStats: {
                            ...initialGameState.playerStats,
                            ...savedState.playerStats,
                            cargo: calculateCurrentCargo(validInventory),
                        },
                    });
                    setChartItem(marketItems[0]?.name || STATIC_ITEMS[0].name);
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
                bio: t.bio,
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
  }, [calculateMarketDataForSystem, toast]); 

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
        
        const { systems, routes, ...dynamicState } = gameState;
        const stateToSave = { ...dynamicState, leaderboard: leaderboardWithPlayer };
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

  const handlePirateAction = (action: 'fight' | 'evade' | 'bribe') => {
    if (!gameState || !gameState.pirateEncounter) return;
    
    startEncounterTransition(async () => {
        const currentSystem = gameState.systems.find(s => s.name === gameState.currentSystem)!;
        const input = {
            action,
            playerNetWorth: gameState.playerStats.netWorth,
            playerCargo: gameState.playerStats.cargo,
            pirateName: gameState.pirateEncounter!.name,
            pirateThreatLevel: gameState.pirateEncounter!.threatLevel,
            hasGunner: gameState.crew.some(c => c.role === 'Gunner'),
            hasNegotiator: gameState.crew.some(c => c.role === 'Negotiator'),
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

  const handlePlanetTravel = (planetName: string) => {
    setGameState(prev => {
      if (!prev || prev.currentPlanet === planetName) return prev;
      
      const planetFuelCost = 1;
      if (prev.playerStats.fuel < planetFuelCost) {
        toast({
            variant: "destructive",
            title: "Intra-system Travel Failed",
            description: `Not enough fuel for orbital realignment. You need ${planetFuelCost} SU.`
        });
        return prev;
      }
      
      const newPlayerStats = {
          ...prev.playerStats,
          fuel: prev.playerStats.fuel - planetFuelCost,
      };

      toast({
          title: `Arrived at ${planetName}`,
          description: `Orbital realignment complete. Fuel consumed: ${planetFuelCost} SU.`
      });

      return {
          ...prev,
          playerStats: newPlayerStats,
          currentPlanet: planetName,
      }
    });
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
    
    const totalSalary = gameState.crew.reduce((acc, member) => acc + member.salary, 0);
    if (gameState.playerStats.netWorth < totalSalary) {
        toast({
            variant: "destructive",
            title: "Travel Failed",
            description: `Insufficient funds for travel and crew salary. You need ${totalSalary.toLocaleString()}¢ for salaries.`
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
        const hasNavigator = gameState.crew.some(c => c.role === 'Navigator');
        const pirateEncounterObject = Math.random() < totalEncounterChance ? generateRandomPirate(hasNavigator) : null;

        let scannedPirateEncounter: Pirate | null = null;
        if (pirateEncounterObject) {
            try {
                const scanResult = await runPirateScan({
                    pirateName: pirateEncounterObject.name,
                    pirateShipType: pirateEncounterObject.shipType,
                    pirateThreatLevel: pirateEncounterObject.threatLevel,
                    sensorLevel: gameState.playerStats.sensorLevel,
                });
                scannedPirateEncounter = {
                    ...pirateEncounterObject,
                    scanResult: scanResult.scanReport,
                };
            } catch (e) {
                console.error("Failed to scan pirate vessel on encounter", e);
                scannedPirateEncounter = pirateEncounterObject; // Proceed without scan result on error
            }
        }

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
              netWorth: prev.playerStats.netWorth - totalSalary,
              fuel: prev.playerStats.fuel - fuelCost,
              pirateRisk: scannedPirateEncounter ? 0 : Math.max(0, prev.playerStats.pirateRisk - 0.05)
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
              currentPlanet: travelDestination.planets[0].name,
              pirateEncounter: scannedPirateEncounter,
              marketItems: newMarketItems,
              priceHistory: newPriceHistory,
              leaderboard: updatedLeaderboard,
          }
        });

        toast({
            title: `Arrival: ${travelDestination.name}`,
            description: `${eventDescription} Now in orbit of ${travelDestination.planets[0].name}. Your crew has been paid ${totalSalary.toLocaleString()}¢.`
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
        const currentSystem = SYSTEMS.find(s => s.name === prev.currentSystem);
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
  
  const handleUpgradeShip = (upgradeType: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor') => {
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
        } else if (upgradeType === 'hull') {
            const currentTierIndex = hullUpgrades.findIndex(u => u.level === prev.playerStats.hullLevel);
            if (currentTierIndex !== -1 && currentTierIndex < hullUpgrades.length - 1) {
                const currentTier = hullUpgrades[currentTierIndex];
                const nextTier = hullUpgrades[currentTierIndex + 1];
                cost = nextTier.cost - currentTier.cost;
                if (prev.playerStats.netWorth >= cost) {
                    newPlayerStats.netWorth -= cost;
                    newPlayerStats.hullLevel = nextTier.level;
                    newPlayerStats.maxShipHealth = nextTier.health;
                    newPlayerStats.shipHealth += (nextTier.health - currentTier.health);
                    canUpgrade = true;
                    toastTitle = "Hull Upgraded!";
                    toastDescription = `Your maximum hull integrity is now ${nextTier.health}.`;
                } else {
                    toastDescription = `Not enough credits. You need ${cost.toLocaleString()}¢.`;
                }
            }
        } else if (upgradeType === 'fuel') {
            const currentTierIndex = fuelUpgrades.findIndex(u => u.level === prev.playerStats.fuelLevel);
            if (currentTierIndex !== -1 && currentTierIndex < fuelUpgrades.length - 1) {
                const currentTier = fuelUpgrades[currentTierIndex];
                const nextTier = fuelUpgrades[currentTierIndex + 1];
                cost = nextTier.cost - currentTier.cost;
                if (prev.playerStats.netWorth >= cost) {
                    newPlayerStats.netWorth -= cost;
                    newPlayerStats.fuelLevel = nextTier.level;
                    newPlayerStats.maxFuel = nextTier.capacity;
                    newPlayerStats.fuel += (nextTier.capacity - currentTier.capacity);
                    canUpgrade = true;
                    toastTitle = "Fuel Tank Upgraded!";
                    toastDescription = `Your maximum fuel capacity is now ${nextTier.capacity} SU.`;
                } else {
                    toastDescription = `Not enough credits. You need ${cost.toLocaleString()}¢.`;
                }
            }
        } else if (upgradeType === 'sensor') {
            const currentTierIndex = sensorUpgrades.findIndex(u => u.level === prev.playerStats.sensorLevel);
            if (currentTierIndex !== -1 && currentTierIndex < sensorUpgrades.length - 1) {
                const currentTier = sensorUpgrades[currentTierIndex];
                const nextTier = sensorUpgrades[currentTierIndex + 1];
                cost = nextTier.cost - currentTier.cost;
                if (prev.playerStats.netWorth >= cost) {
                    newPlayerStats.netWorth -= cost;
                    newPlayerStats.sensorLevel = nextTier.level;
                    canUpgrade = true;
                    toastTitle = "Sensors Upgraded!";
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
  
  const handleDowngradeShip = (upgradeType: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor') => {
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
        } else if (upgradeType === 'hull') {
            const currentTierIndex = hullUpgrades.findIndex(u => u.level === prev.playerStats.hullLevel);
            if (currentTierIndex > 0) {
                const currentTier = hullUpgrades[currentTierIndex];
                const previousTier = hullUpgrades[currentTierIndex - 1];
                refund = Math.round((currentTier.cost - previousTier.cost) * sellPercentage);
                newPlayerStats.netWorth += refund;
                newPlayerStats.hullLevel = previousTier.level;
                newPlayerStats.maxShipHealth = previousTier.health;
                newPlayerStats.shipHealth = Math.min(newPlayerStats.shipHealth, newPlayerStats.maxShipHealth);
                canDowngrade = true;
                toastDescription = `Hull integrity downgraded to ${previousTier.name}. You received ${refund.toLocaleString()}¢.`;
            }
        } else if (upgradeType === 'fuel') {
            const currentTierIndex = fuelUpgrades.findIndex(u => u.level === prev.playerStats.fuelLevel);
            if (currentTierIndex > 0) {
                const currentTier = fuelUpgrades[currentTierIndex];
                const previousTier = fuelUpgrades[currentTierIndex - 1];
                refund = Math.round((currentTier.cost - previousTier.cost) * sellPercentage);
                newPlayerStats.netWorth += refund;
                newPlayerStats.fuelLevel = previousTier.level;
                newPlayerStats.maxFuel = previousTier.capacity;
                newPlayerStats.fuel = Math.min(newPlayerStats.fuel, newPlayerStats.maxFuel);
                canDowngrade = true;
                toastDescription = `Fuel tank downgraded to ${previousTier.name}. You received ${refund.toLocaleString()}¢.`;
            }
        } else if (upgradeType === 'sensor') {
            const currentTierIndex = sensorUpgrades.findIndex(u => u.level === prev.playerStats.sensorLevel);
            if (currentTierIndex > 0) {
                const currentTier = sensorUpgrades[currentTierIndex];
                const previousTier = sensorUpgrades[currentTierIndex - 1];
                refund = Math.round((currentTier.cost - previousTier.cost) * sellPercentage);
                newPlayerStats.netWorth += refund;
                newPlayerStats.sensorLevel = previousTier.level;
                canDowngrade = true;
                toastDescription = `Sensors downgraded to ${previousTier.name}. You received ${refund.toLocaleString()}¢.`;
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

  const handleHireCrew = (crewId: string) => {
    setGameState(prev => {
        if (!prev) return null;
        const crewToHire = AVAILABLE_CREW.find(c => c.id === crewId);
        if (!crewToHire) {
            toast({ variant: "destructive", title: "Recruitment Error", description: "Crew member not found." });
            return prev;
        }
        if (prev.playerStats.netWorth < crewToHire.hiringFee) {
            toast({ variant: "destructive", title: "Hiring Failed", description: `Insufficient credits. You need ${crewToHire.hiringFee.toLocaleString()}¢.` });
            return prev;
        }

        const newPlayerStats = {
            ...prev.playerStats,
            netWorth: prev.playerStats.netWorth - crewToHire.hiringFee,
        };
        
        const newCrew = [...prev.crew, crewToHire];

        toast({ title: "Crew Member Hired!", description: `${crewToHire.name} has joined your crew.` });
        
        return { ...prev, playerStats: newPlayerStats, crew: newCrew };
    });
  };

  const handleFireCrew = (crewId: string) => {
    setGameState(prev => {
        if (!prev) return null;
        
        const crewToFire = prev.crew.find(c => c.id === crewId);
        if (!crewToFire) {
            toast({ variant: "destructive", title: "Error", description: "Crew member not on your roster." });
            return prev;
        }

        const newCrew = prev.crew.filter(c => c.id !== crewId);

        toast({ title: "Crew Member Fired", description: `${crewToFire.name} has left your crew.` });

        return { ...prev, crew: newCrew };
    });
  };

  const handleUpdateTraderBio = (traderName: string, bio: string) => {
    setGameState(prev => {
      if (!prev) return null;
      const newLeaderboard = prev.leaderboard.map(entry =>
        entry.trader === traderName ? { ...entry, bio: bio } : entry
      );
      return { ...prev, leaderboard: newLeaderboard };
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
    handlePlanetTravel,
    handleRefuel,
    handleRepairShip,
    handleUpgradeShip,
    handleDowngradeShip,
    handlePurchaseShip,
    handleHireCrew,
    handleFireCrew,
    updateTraderBio: handleUpdateTraderBio,
    cargoUpgrades,
    weaponUpgrades,
    shieldUpgrades,
    hullUpgrades,
    fuelUpgrades,
    sensorUpgrades,
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
