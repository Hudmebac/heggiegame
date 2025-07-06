
'use client';

import { createContext, useContext, useState, useEffect, useTransition, ReactNode, useCallback } from 'react';
import type { GameState, MarketItem, PriceHistory, EncounterResult, System, Route, Pirate, PlayerStats, Quest, CargoUpgrade, WeaponUpgrade, ShieldUpgrade, LeaderboardEntry, InventoryItem, SystemEconomy, ItemCategory, CrewMember, ShipForSale, ZoneType, StaticItem, HullUpgrade, FuelUpgrade, SensorUpgrade, Planet, BarContract, BarPartner, PartnershipOffer } from '@/lib/types';
import { runMarketSimulation, resolveEncounter, runAvatarGeneration, runEventGeneration, runPirateScan, runBioGeneration, runQuestGeneration, runTraderGeneration, runPartnershipOfferGeneration, runResidencePartnershipOfferGeneration, runCommercePartnershipOfferGeneration, runIndustryPartnershipOfferGeneration } from '@/app/actions';
import { STATIC_ITEMS } from '@/lib/items';
import { SHIPS_FOR_SALE } from '@/lib/ships';
import { AVAILABLE_CREW } from '@/lib/crew';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades } from '@/lib/upgrades';
import { SYSTEMS, ROUTES } from '@/lib/systems';
import { barThemes } from '@/lib/bar-themes';
import { residenceThemes } from '@/lib/residence-themes';
import { commerceThemes } from '@/lib/commerce-themes';
import { industryThemes } from '@/lib/industry-themes';

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
    barLevel: 1,
    autoClickerBots: 0,
    establishmentLevel: 0,
    residenceLevel: 1,
    residenceAutoClickerBots: 0,
    residenceEstablishmentLevel: 0,
    commerceLevel: 1,
    commerceAutoClickerBots: 0,
    commerceEstablishmentLevel: 0,
    industryLevel: 1,
    industryAutoClickerBots: 0,
    industryEstablishmentLevel: 0,
  },
  inventory: [{ name: 'Silicon Nuggets (Standard)', owned: 5 }],
  priceHistory: Object.fromEntries(STATIC_ITEMS.map(item => [item.name, [item.basePrice]])),
  leaderboard: [],
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
  handleBarClick: (income: number) => void;
  handleUpgradeBar: () => void;
  handleUpgradeAutoClicker: () => void;
  handlePurchaseEstablishment: () => void;
  handleExpandEstablishment: () => void;
  handleSellBar: () => void;
  handleAcceptPartnerOffer: (offer: PartnershipOffer) => void;
  handleResidenceClick: (income: number) => void;
  handleUpgradeResidence: () => void;
  handleUpgradeResidenceAutoClicker: () => void;
  handlePurchaseResidence: () => void;
  handleExpandResidence: () => void;
  handleSellResidence: () => void;
  handleAcceptResidencePartnerOffer: (offer: PartnershipOffer) => void;
  handleCommerceClick: (income: number) => void;
  handleUpgradeCommerce: () => void;
  handleUpgradeCommerceAutoClicker: () => void;
  handlePurchaseCommerce: () => void;
  handleExpandCommerce: () => void;
  handleSellCommerce: () => void;
  handleAcceptCommercePartnerOffer: (offer: PartnershipOffer) => void;
  handleIndustryClick: (income: number) => void;
  handleUpgradeIndustry: () => void;
  handleUpgradeIndustryAutoClicker: () => void;
  handlePurchaseIndustry: () => void;
  handleExpandIndustry: () => void;
  handleSellIndustry: () => void;
  handleAcceptIndustryPartnerOffer: (offer: PartnershipOffer) => void;
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
        let savedStateJSON;
        try {
            savedStateJSON = localStorage.getItem('heggieGameState');
        } catch (error) {
            console.error("Failed to access local storage, starting fresh:", error);
            savedStateJSON = null;
        }

        const baseState: GameState = {
            ...initialGameState,
            marketItems: calculateMarketDataForSystem(SYSTEMS.find(s => s.name === initialGameState.currentSystem) || SYSTEMS[0]),
        };

        if (savedStateJSON) {
            try {
                const savedProgress = JSON.parse(savedStateJSON);
                
                const currentSystemName = savedProgress.currentSystem || baseState.currentSystem;
                const currentSystem = SYSTEMS.find(s => s.name === currentSystemName) || SYSTEMS[0];
                
                const mergedPlayerStats = {
                    ...baseState.playerStats,
                    ...savedProgress.playerStats,
                };
                mergedPlayerStats.cargo = calculateCurrentCargo(savedProgress.inventory || baseState.inventory);
                
                const currentPlanetName = savedProgress.currentPlanet && currentSystem.planets.find(p => p.name === savedProgress.currentPlanet) ? savedProgress.currentPlanet : currentSystem.planets[0].name;

                setGameState({
                    ...baseState, // Use fresh static data
                    // Restore dynamic player progress
                    playerStats: mergedPlayerStats,
                    inventory: savedProgress.inventory || baseState.inventory,
                    priceHistory: savedProgress.priceHistory || baseState.priceHistory,
                    leaderboard: savedProgress.leaderboard || baseState.leaderboard,
                    currentSystem: currentSystemName,
                    currentPlanet: currentPlanetName,
                    quests: savedProgress.quests || baseState.quests,
                    crew: savedProgress.crew || baseState.crew,
                    // Recalculate market data for the current location
                    marketItems: calculateMarketDataForSystem(currentSystem),
                });
            } catch (error) {
                console.error("Failed to parse saved game state, starting fresh:", error);
                generateNewGameState();
            }
        } else {
            generateNewGameState();
        }
    };
    
    const generateNewGameState = async () => {
        try {
            const [tradersResult, questsResult] = await Promise.all([
                runTraderGeneration(),
                runQuestGeneration()
            ]);
            
            const newLeaderboardWithBios = tradersResult.traders.map(trader => ({
                trader: trader.name,
                netWorth: trader.netWorth,
                fleetSize: trader.fleetSize,
                bio: trader.bio,
            }));

            const playerEntry = {
                trader: initialGameState.playerStats.name,
                netWorth: initialGameState.playerStats.netWorth,
                fleetSize: initialGameState.playerStats.fleetSize,
                bio: initialGameState.playerStats.bio
            };

            const sortedLeaderboard = [...newLeaderboardWithBios, playerEntry]
                .sort((a, b) => b.netWorth - a.netWorth)
                .map((entry, index) => ({ ...entry, rank: index + 1 }));

            const playerStats = {
                ...initialGameState.playerStats,
                cargo: calculateCurrentCargo(initialGameState.inventory)
            };
            
            const currentSystem = SYSTEMS.find(s => s.name === initialGameState.currentSystem) || SYSTEMS[0];
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
        } catch(e) {
            console.error("Failed to generate new game state", e);
            toast({ variant: "destructive", title: "Initialization Failed", description: "Could not contact game services. Please refresh."});
        }
    };

    loadGame();
  }, [calculateMarketDataForSystem, toast]); 

  useEffect(() => {
    if (isClient && gameState) {
      try {
        // Only save dynamic player progress, not static world data
        const stateToSave = {
            playerStats: gameState.playerStats,
            inventory: gameState.inventory,
            priceHistory: gameState.priceHistory,
            leaderboard: gameState.leaderboard,
            currentSystem: gameState.currentSystem,
            currentPlanet: gameState.currentPlanet,
            quests: gameState.quests,
            crew: gameState.crew,
        };
        localStorage.setItem('heggieGameState', JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Failed to save game state to local storage:", error);
      }
    }
  }, [gameState, isClient]);

  useEffect(() => {
    if (!gameState || (gameState.playerStats.autoClickerBots || 0) === 0) {
        return;
    }

    const intervalId = setInterval(() => {
        setGameState(prev => {
            if (!prev || (prev.playerStats.autoClickerBots || 0) === 0) {
                clearInterval(intervalId);
                return prev;
            }

            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const zoneType = currentSystem?.zoneType;
            const theme = (zoneType && barThemes[zoneType]) ? barThemes[zoneType] : barThemes['Default'];
            
            const totalPartnerShare = (prev.playerStats.barContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
            const incomePerClick = theme.baseIncome * prev.playerStats.barLevel;
            const incomePerSecond = (prev.playerStats.autoClickerBots || 0) * incomePerClick * (1 - totalPartnerShare);

            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + incomePerSecond,
            };

            return { ...prev, playerStats: newPlayerStats };
        });
    }, 1000); // every second

    return () => clearInterval(intervalId);
  }, [gameState?.playerStats.autoClickerBots, gameState?.currentSystem, gameState?.playerStats.barLevel, gameState?.playerStats.barContract]);

  useEffect(() => {
    if (!gameState || (gameState.playerStats.residenceAutoClickerBots || 0) === 0) {
        return;
    }

    const intervalId = setInterval(() => {
        setGameState(prev => {
            if (!prev || (prev.playerStats.residenceAutoClickerBots || 0) === 0) {
                clearInterval(intervalId);
                return prev;
            }

            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const zoneType = currentSystem?.zoneType;
            const theme = (zoneType && residenceThemes[zoneType]) ? residenceThemes[zoneType] : residenceThemes['Default'];
            
            const totalPartnerShare = (prev.playerStats.residenceContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
            const incomePerClick = theme.baseIncome * prev.playerStats.residenceLevel;
            const incomePerSecond = (prev.playerStats.residenceAutoClickerBots || 0) * incomePerClick * (1 - totalPartnerShare);

            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + incomePerSecond,
            };

            return { ...prev, playerStats: newPlayerStats };
        });
    }, 1000); // every second

    return () => clearInterval(intervalId);
  }, [gameState?.playerStats.residenceAutoClickerBots, gameState?.currentSystem, gameState?.playerStats.residenceLevel, gameState?.playerStats.residenceContract]);
  
  useEffect(() => {
    if (!gameState || (gameState.playerStats.commerceAutoClickerBots || 0) === 0) {
        return;
    }

    const intervalId = setInterval(() => {
        setGameState(prev => {
            if (!prev || (prev.playerStats.commerceAutoClickerBots || 0) === 0) {
                clearInterval(intervalId);
                return prev;
            }

            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const zoneType = currentSystem?.zoneType;
            const theme = (zoneType && commerceThemes[zoneType]) ? commerceThemes[zoneType] : commerceThemes['Default'];
            
            const totalPartnerShare = (prev.playerStats.commerceContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
            const incomePerClick = theme.baseIncome * prev.playerStats.commerceLevel;
            const incomePerSecond = (prev.playerStats.commerceAutoClickerBots || 0) * incomePerClick * (1 - totalPartnerShare);

            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + incomePerSecond,
            };

            return { ...prev, playerStats: newPlayerStats };
        });
    }, 1000); // every second

    return () => clearInterval(intervalId);
  }, [gameState?.playerStats.commerceAutoClickerBots, gameState?.currentSystem, gameState?.playerStats.commerceLevel, gameState?.playerStats.commerceContract]);

  useEffect(() => {
    if (!gameState || (gameState.playerStats.industryAutoClickerBots || 0) === 0) {
        return;
    }

    const intervalId = setInterval(() => {
        setGameState(prev => {
            if (!prev || (prev.playerStats.industryAutoClickerBots || 0) === 0) {
                clearInterval(intervalId);
                return prev;
            }

            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const zoneType = currentSystem?.zoneType;
            const theme = (zoneType && industryThemes[zoneType]) ? industryThemes[zoneType] : industryThemes['Default'];
            
            const totalPartnerShare = (prev.playerStats.industryContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
            const incomePerClick = theme.baseIncome * prev.playerStats.industryLevel;
            const incomePerSecond = (prev.playerStats.industryAutoClickerBots || 0) * incomePerClick * (1 - totalPartnerShare);

            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + incomePerSecond,
            };

            return { ...prev, playerStats: newPlayerStats };
        });
    }, 1000); // every second

    return () => clearInterval(intervalId);
  }, [gameState?.playerStats.industryAutoClickerBots, gameState?.currentSystem, gameState?.playerStats.industryLevel, gameState?.playerStats.industryContract]);


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
          
          if (newPlayerStats.barContract) {
            const oldValue = newPlayerStats.barContract.currentMarketValue;
            const changePercent = (Math.random() - 0.5) * 0.1; // -5% to +5% change
            const newValue = Math.round(oldValue * (1 + changePercent));
            newPlayerStats.barContract.currentMarketValue = newValue;
            newPlayerStats.barContract.valueHistory = [...newPlayerStats.barContract.valueHistory, newValue].slice(-20);
          }
          if (newPlayerStats.residenceContract) {
            const oldValue = newPlayerStats.residenceContract.currentMarketValue;
            const changePercent = (Math.random() - 0.5) * 0.1; // -5% to +5% change
            const newValue = Math.round(oldValue * (1 + changePercent));
            newPlayerStats.residenceContract.currentMarketValue = newValue;
            newPlayerStats.residenceContract.valueHistory = [...newPlayerStats.residenceContract.valueHistory, newValue].slice(-20);
          }
          if (newPlayerStats.commerceContract) {
            const oldValue = newPlayerStats.commerceContract.currentMarketValue;
            const changePercent = (Math.random() - 0.5) * 0.1; // -5% to +5% change
            const newValue = Math.round(oldValue * (1 + changePercent));
            newPlayerStats.commerceContract.currentMarketValue = newValue;
            newPlayerStats.commerceContract.valueHistory = [...newPlayerStats.commerceContract.valueHistory, newValue].slice(-20);
          }
           if (newPlayerStats.industryContract) {
            const oldValue = newPlayerStats.industryContract.currentMarketValue;
            const changePercent = (Math.random() - 0.5) * 0.1; // -5% to +5% change
            const newValue = Math.round(oldValue * (1 + changePercent));
            newPlayerStats.industryContract.currentMarketValue = newValue;
            newPlayerStats.industryContract.valueHistory = [...newPlayerStats.industryContract.valueHistory, newValue].slice(-20);
          }


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

  const handleBarClick = (income: number) => {
    setGameState(prev => {
        if (!prev) return null;
        const newPlayerStats = {
            ...prev.playerStats,
            netWorth: prev.playerStats.netWorth + income,
        };
        return { ...prev, playerStats: newPlayerStats };
    });
  };

  const handleUpgradeBar = () => {
    setGameState(prev => {
      if (!prev) return null;

      if (prev.playerStats.barLevel >= 25) {
        toast({ variant: "destructive", title: "Upgrade Failed", description: "Bar level is already at maximum." });
        return prev;
      }
      
      const upgradeCost = Math.round(100 * Math.pow(prev.playerStats.barLevel, 2.5));
      if (prev.playerStats.netWorth < upgradeCost) {
        toast({ variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${upgradeCost.toLocaleString()}¢.` });
        return prev;
      }
      const newPlayerStats = {
        ...prev.playerStats,
        netWorth: prev.playerStats.netWorth - upgradeCost,
        barLevel: prev.playerStats.barLevel + 1,
      };
      toast({ title: "Bar Upgraded!", description: `Your establishment is now Level ${newPlayerStats.barLevel}.` });
      return { ...prev, playerStats: newPlayerStats };
    });
  };

  const handleUpgradeAutoClicker = () => {
    setGameState(prev => {
        if (!prev) return null;
        if ((prev.playerStats.autoClickerBots || 0) >= 25) {
            toast({ variant: "destructive", title: "Limit Reached", description: `You cannot purchase more than 25 bots.` });
            return prev;
        }
        const cost = Math.round(1000 * Math.pow(1.15, prev.playerStats.autoClickerBots || 0));
        if (prev.playerStats.netWorth < cost) {
            toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits to buy a bot. You need ${cost.toLocaleString()}¢.` });
            return prev;
        }
        const newPlayerStats = {
            ...prev.playerStats,
            netWorth: prev.playerStats.netWorth - cost,
            autoClickerBots: (prev.playerStats.autoClickerBots || 0) + 1,
        };
        toast({ title: "Auto-Clicker Bot Purchased!", description: "A new bot has been added to your staff." });
        return { ...prev, playerStats: newPlayerStats };
    });
  };

  const handlePurchaseEstablishment = () => {
    setGameState(prev => {
        if (!prev) return null;
        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const zoneType = currentSystem?.zoneType;
        const theme = (zoneType && barThemes[zoneType]) ? barThemes[zoneType] : barThemes['Default'];
        const incomePerClick = theme.baseIncome * prev.playerStats.barLevel;
        const incomePerSecond = (prev.playerStats.autoClickerBots || 0) * incomePerClick;
        
        const cost = incomePerSecond * 1000;

        if (prev.playerStats.netWorth < cost) {
            toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` });
            return prev;
        }

        const initialValue = cost * (Math.random() * 0.4 + 0.8);

        const newPlayerStats: PlayerStats = {
            ...prev.playerStats,
            netWorth: prev.playerStats.netWorth - cost,
            establishmentLevel: 1,
            barContract: {
                currentMarketValue: initialValue,
                valueHistory: [initialValue],
                partners: [],
            }
        };

        toast({ title: "Establishment Purchased!", description: `You are now the proud owner of this fine establishment.` });
        return { ...prev, playerStats: newPlayerStats };
    });
  };
  
  const handleExpandEstablishment = () => {
    setGameState(prev => {
        if (!prev || !prev.playerStats.barContract) return prev;
        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const zoneType = currentSystem?.zoneType;
        const theme = (zoneType && barThemes[zoneType]) ? barThemes[zoneType] : barThemes['Default'];
        const incomePerClick = theme.baseIncome * prev.playerStats.barLevel;
        const incomePerSecond = (prev.playerStats.autoClickerBots || 0) * incomePerClick;

        const expansionTiers = [
            10000, // Level 1 -> 2
            100000, // Level 2 -> 3
            1000000, // Level 3 -> 4
            10000000, // Level 4 -> 5
        ];

        const currentLevel = prev.playerStats.establishmentLevel;
        if (currentLevel < 1 || currentLevel > 4) {
            return prev;
        }

        const cost = incomePerSecond * expansionTiers[currentLevel - 1];

        if (prev.playerStats.netWorth < cost) {
            toast({ variant: "destructive", title: "Expansion Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` });
            return prev;
        }
        
        const investmentValue = cost * (Math.random() * 0.2 + 0.7); // 70-90% of cost adds to market value
        const newMarketValue = Math.round(prev.playerStats.barContract.currentMarketValue + investmentValue);

        const newPlayerStats: PlayerStats = {
            ...prev.playerStats,
            netWorth: prev.playerStats.netWorth - cost,
            establishmentLevel: currentLevel + 1,
            barContract: {
                ...prev.playerStats.barContract,
                currentMarketValue: newMarketValue,
                valueHistory: [...prev.playerStats.barContract.valueHistory, newMarketValue].slice(-20),
            }
        };

        toast({ title: "Establishment Expanded!", description: `Your operation has grown to Expansion Level ${newPlayerStats.establishmentLevel - 1}. Market value increased.` });
        return { ...prev, playerStats: newPlayerStats };
    });
  };
  
  const handleSellBar = () => {
    setGameState(prev => {
        if (!prev || !prev.playerStats.barContract) return prev;

        const salePrice = prev.playerStats.barContract.currentMarketValue;
        
        const newPlayerStats: PlayerStats = {
            ...prev.playerStats,
            netWorth: prev.playerStats.netWorth + salePrice,
            barLevel: 1,
            autoClickerBots: 0,
            establishmentLevel: 0,
        };
        delete newPlayerStats.barContract;

        toast({ title: "Establishment Sold!", description: `You sold the bar for ${salePrice.toLocaleString()}¢.` });
        return { ...prev, playerStats: newPlayerStats };
    });
  };

    const handleAcceptPartnerOffer = (offer: PartnershipOffer) => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.barContract) return prev;

            const newPartner: BarPartner = {
                name: offer.partnerName,
                percentage: offer.stakePercentage,
                investment: offer.cashOffer,
            };

            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + offer.cashOffer,
                barContract: {
                    ...prev.playerStats.barContract,
                    partners: [...prev.playerStats.barContract.partners, newPartner],
                }
            };
            
            const totalPartnerShare = newPlayerStats.barContract.partners.reduce((acc, p) => acc + p.percentage, 0);

            if (totalPartnerShare > 1) {
                toast({ variant: "destructive", title: "Ownership Limit Reached", description: "You cannot sell more than 100% of your establishment." });
                return prev;
            }

            toast({ title: "Deal Struck!", description: `You sold a ${(offer.stakePercentage * 100).toFixed(0)}% stake to ${offer.partnerName} for ${offer.cashOffer.toLocaleString()}¢.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handleResidenceClick = (income: number) => {
        setGameState(prev => {
            if (!prev) return null;
            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + income,
            };
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handleUpgradeResidence = () => {
        setGameState(prev => {
            if (!prev) return null;
            if (prev.playerStats.residenceLevel >= 25) {
                toast({ variant: "destructive", title: "Upgrade Failed", description: "Residence level is already at maximum." });
                return prev;
            }
            const upgradeCost = Math.round(50 * Math.pow(prev.playerStats.residenceLevel, 2.5));
            if (prev.playerStats.netWorth < upgradeCost) {
                toast({ variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${upgradeCost.toLocaleString()}¢.` });
                return prev;
            }
            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - upgradeCost,
                residenceLevel: prev.playerStats.residenceLevel + 1,
            };
            toast({ title: "Residence Upgraded!", description: `Your property is now Level ${newPlayerStats.residenceLevel}.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handleUpgradeResidenceAutoClicker = () => {
        setGameState(prev => {
            if (!prev) return null;
            if ((prev.playerStats.residenceAutoClickerBots || 0) >= 25) {
                toast({ variant: "destructive", title: "Limit Reached", description: "You cannot hire more than 25 service bots." });
                return prev;
            }
            const cost = Math.round(500 * Math.pow(1.15, prev.playerStats.residenceAutoClickerBots || 0));
            if (prev.playerStats.netWorth < cost) {
                toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits to hire a bot. You need ${cost.toLocaleString()}¢.` });
                return prev;
            }
            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
                residenceAutoClickerBots: (prev.playerStats.residenceAutoClickerBots || 0) + 1,
            };
            toast({ title: "Service Bot Hired!", description: "A new bot has been added to your property staff." });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handlePurchaseResidence = () => {
        setGameState(prev => {
            if (!prev) return null;
            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const zoneType = currentSystem?.zoneType;
            const theme = (zoneType && residenceThemes[zoneType]) ? residenceThemes[zoneType] : residenceThemes['Default'];
            const incomePerClick = theme.baseIncome * prev.playerStats.residenceLevel;
            const incomePerSecond = (prev.playerStats.residenceAutoClickerBots || 0) * incomePerClick;
            
            const cost = incomePerSecond * 1000;
            if (prev.playerStats.netWorth < cost) {
                toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` });
                return prev;
            }
            const initialValue = cost * (Math.random() * 0.4 + 0.8);
            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
                residenceEstablishmentLevel: 1,
                residenceContract: {
                    currentMarketValue: initialValue,
                    valueHistory: [initialValue],
                    partners: [],
                }
            };
            toast({ title: "Property Purchased!", description: "You are now the owner of this residence." });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handleExpandResidence = () => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.residenceContract) return prev;
            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const zoneType = currentSystem?.zoneType;
            const theme = (zoneType && residenceThemes[zoneType]) ? residenceThemes[zoneType] : residenceThemes['Default'];
            const incomePerClick = theme.baseIncome * prev.playerStats.residenceLevel;
            const incomePerSecond = (prev.playerStats.residenceAutoClickerBots || 0) * incomePerClick;

            const expansionTiers = [10000, 100000, 1000000, 10000000];
            const currentLevel = prev.playerStats.residenceEstablishmentLevel;
            if (currentLevel < 1 || currentLevel > 4) return prev;

            const cost = incomePerSecond * expansionTiers[currentLevel - 1];
            if (prev.playerStats.netWorth < cost) {
                toast({ variant: "destructive", title: "Expansion Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` });
                return prev;
            }
            
            const investmentValue = cost * (Math.random() * 0.2 + 0.7);
            const newMarketValue = Math.round(prev.playerStats.residenceContract.currentMarketValue + investmentValue);
            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
                residenceEstablishmentLevel: currentLevel + 1,
                residenceContract: {
                    ...prev.playerStats.residenceContract,
                    currentMarketValue: newMarketValue,
                    valueHistory: [...prev.playerStats.residenceContract.valueHistory, newMarketValue].slice(-20),
                }
            };
            toast({ title: "Property Expanded!", description: `Your residence has grown to Expansion Level ${newPlayerStats.residenceEstablishmentLevel - 1}.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handleSellResidence = () => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.residenceContract) return prev;
            const salePrice = prev.playerStats.residenceContract.currentMarketValue;
            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + salePrice,
                residenceLevel: 1,
                residenceAutoClickerBots: 0,
                residenceEstablishmentLevel: 0,
            };
            delete newPlayerStats.residenceContract;
            toast({ title: "Property Sold!", description: `You sold the residence for ${salePrice.toLocaleString()}¢.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handleAcceptResidencePartnerOffer = (offer: PartnershipOffer) => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.residenceContract) return prev;
            const newPartner: BarPartner = { name: offer.partnerName, percentage: offer.stakePercentage, investment: offer.cashOffer };
            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + offer.cashOffer,
                residenceContract: {
                    ...prev.playerStats.residenceContract,
                    partners: [...prev.playerStats.residenceContract.partners, newPartner],
                }
            };
            const totalPartnerShare = newPlayerStats.residenceContract.partners.reduce((acc, p) => acc + p.percentage, 0);
            if (totalPartnerShare > 1) {
                toast({ variant: "destructive", title: "Ownership Limit Reached", description: "You cannot sell more than 100% of your property." });
                return prev;
            }
            toast({ title: "Deal Struck!", description: `You sold a ${(offer.stakePercentage * 100).toFixed(0)}% stake to ${offer.partnerName} for ${offer.cashOffer.toLocaleString()}¢.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };
    
    const handleCommerceClick = (income: number) => {
        setGameState(prev => {
            if (!prev) return null;
            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + income,
            };
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handleUpgradeCommerce = () => {
        setGameState(prev => {
            if (!prev) return null;
            if (prev.playerStats.commerceLevel >= 25) {
                toast({ variant: "destructive", title: "Upgrade Failed", description: "Commerce Hub level is already at maximum." });
                return prev;
            }
            const upgradeCost = Math.round(150 * Math.pow(prev.playerStats.commerceLevel, 2.5));
            if (prev.playerStats.netWorth < upgradeCost) {
                toast({ variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${upgradeCost.toLocaleString()}¢.` });
                return prev;
            }
            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - upgradeCost,
                commerceLevel: prev.playerStats.commerceLevel + 1,
            };
            toast({ title: "Commerce Hub Upgraded!", description: `Your hub is now Level ${newPlayerStats.commerceLevel}.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handleUpgradeCommerceAutoClicker = () => {
        setGameState(prev => {
            if (!prev) return null;
            if ((prev.playerStats.commerceAutoClickerBots || 0) >= 25) {
                toast({ variant: "destructive", title: "Limit Reached", description: "You cannot deploy more than 25 trading bots." });
                return prev;
            }
            const cost = Math.round(1500 * Math.pow(1.15, prev.playerStats.commerceAutoClickerBots || 0));
            if (prev.playerStats.netWorth < cost) {
                toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits to deploy a bot. You need ${cost.toLocaleString()}¢.` });
                return prev;
            }
            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
                commerceAutoClickerBots: (prev.playerStats.commerceAutoClickerBots || 0) + 1,
            };
            toast({ title: "Trading Bot Deployed!", description: "A new bot has been added to your trading floor." });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handlePurchaseCommerce = () => {
        setGameState(prev => {
            if (!prev) return null;
            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const zoneType = currentSystem?.zoneType;
            const theme = (zoneType && commerceThemes[zoneType]) ? commerceThemes[zoneType] : commerceThemes['Default'];
            const incomePerClick = theme.baseIncome * prev.playerStats.commerceLevel;
            const incomePerSecond = (prev.playerStats.commerceAutoClickerBots || 0) * incomePerClick;
            
            const cost = incomePerSecond * 1000;
            if (prev.playerStats.netWorth < cost) {
                toast({ variant: "destructive", title: "Acquisition Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` });
                return prev;
            }
            const initialValue = cost * (Math.random() * 0.4 + 0.8);
            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
                commerceEstablishmentLevel: 1,
                commerceContract: {
                    currentMarketValue: initialValue,
                    valueHistory: [initialValue],
                    partners: [],
                }
            };
            toast({ title: "Commerce Hub Acquired!", description: "You now hold the trading license for this hub." });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handleExpandCommerce = () => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.commerceContract) return prev;
            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const zoneType = currentSystem?.zoneType;
            const theme = (zoneType && commerceThemes[zoneType]) ? commerceThemes[zoneType] : commerceThemes['Default'];
            const incomePerClick = theme.baseIncome * prev.playerStats.commerceLevel;
            const incomePerSecond = (prev.playerStats.commerceAutoClickerBots || 0) * incomePerClick;

            const expansionTiers = [10000, 100000, 1000000, 10000000];
            const currentLevel = prev.playerStats.commerceEstablishmentLevel;
            if (currentLevel < 1 || currentLevel > 4) return prev;

            const cost = incomePerSecond * expansionTiers[currentLevel - 1];
            if (prev.playerStats.netWorth < cost) {
                toast({ variant: "destructive", title: "Expansion Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` });
                return prev;
            }
            
            const investmentValue = cost * (Math.random() * 0.2 + 0.7);
            const newMarketValue = Math.round(prev.playerStats.commerceContract.currentMarketValue + investmentValue);
            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
                commerceEstablishmentLevel: currentLevel + 1,
                commerceContract: {
                    ...prev.playerStats.commerceContract,
                    currentMarketValue: newMarketValue,
                    valueHistory: [...prev.playerStats.commerceContract.valueHistory, newMarketValue].slice(-20),
                }
            };
            toast({ title: "Commerce Hub Expanded!", description: `Your operation has grown to Expansion Tier ${newPlayerStats.commerceEstablishmentLevel - 1}.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handleSellCommerce = () => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.commerceContract) return prev;
            const salePrice = prev.playerStats.commerceContract.currentMarketValue;
            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + salePrice,
                commerceLevel: 1,
                commerceAutoClickerBots: 0,
                commerceEstablishmentLevel: 0,
            };
            delete newPlayerStats.commerceContract;
            toast({ title: "Assets Liquidated!", description: `You sold the commerce hub for ${salePrice.toLocaleString()}¢.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handleAcceptCommercePartnerOffer = (offer: PartnershipOffer) => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.commerceContract) return prev;
            const newPartner: BarPartner = { name: offer.partnerName, percentage: offer.stakePercentage, investment: offer.cashOffer };
            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + offer.cashOffer,
                commerceContract: {
                    ...prev.playerStats.commerceContract,
                    partners: [...prev.playerStats.commerceContract.partners, newPartner],
                }
            };
            const totalPartnerShare = newPlayerStats.commerceContract.partners.reduce((acc, p) => acc + p.percentage, 0);
            if (totalPartnerShare > 1) {
                toast({ variant: "destructive", title: "Ownership Limit Reached", description: "You cannot sell more than 100% of your commerce hub." });
                return prev;
            }
            toast({ title: "Deal Struck!", description: `You sold a ${(offer.stakePercentage * 100).toFixed(0)}% stake to ${offer.partnerName} for ${offer.cashOffer.toLocaleString()}¢.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

  const handleIndustryClick = (income: number) => {
    setGameState(prev => {
        if (!prev) return null;
        return { ...prev, playerStats: { ...prev.playerStats, netWorth: prev.playerStats.netWorth + income } };
    });
  };

  const handleUpgradeIndustry = () => {
    setGameState(prev => {
        if (!prev) return null;
        if (prev.playerStats.industryLevel >= 25) {
            toast({ variant: "destructive", title: "Upgrade Failed", description: "Factory level is already at maximum." });
            return prev;
        }
        const cost = Math.round(300 * Math.pow(prev.playerStats.industryLevel, 2.5));
        if (prev.playerStats.netWorth < cost) {
            toast({ variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` });
            return prev;
        }
        const newPlayerStats = {
            ...prev.playerStats,
            netWorth: prev.playerStats.netWorth - cost,
            industryLevel: prev.playerStats.industryLevel + 1,
        };
        toast({ title: "Factory Upgraded!", description: `Your facility is now Level ${newPlayerStats.industryLevel}.` });
        return { ...prev, playerStats: newPlayerStats };
    });
  };

  const handleUpgradeIndustryAutoClicker = () => {
    setGameState(prev => {
        if (!prev) return null;
        if (prev.playerStats.industryAutoClickerBots >= 25) {
            toast({ variant: "destructive", title: "Limit Reached", description: "You cannot deploy more than 25 assembly bots." });
            return prev;
        }
        const cost = Math.round(3000 * Math.pow(1.15, prev.playerStats.industryAutoClickerBots));
        if (prev.playerStats.netWorth < cost) {
            toast({ variant: "destructive", title: "Deployment Failed", description: `Not enough credits to deploy a bot. You need ${cost.toLocaleString()}¢.` });
            return prev;
        }
        const newPlayerStats = {
            ...prev.playerStats,
            netWorth: prev.playerStats.netWorth - cost,
            industryAutoClickerBots: prev.playerStats.industryAutoClickerBots + 1,
        };
        toast({ title: "Assembly Bot Deployed!", description: "A new bot has been added to your production line." });
        return { ...prev, playerStats: newPlayerStats };
    });
  };

  const handlePurchaseIndustry = () => {
    setGameState(prev => {
        if (!prev) return null;
        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const zoneType = currentSystem?.zoneType;
        const theme = (zoneType && industryThemes[zoneType]) ? industryThemes[zoneType] : industryThemes['Default'];
        const incomePerClick = theme.baseIncome * prev.playerStats.industryLevel;
        const incomePerSecond = prev.playerStats.industryAutoClickerBots * incomePerClick;
        const cost = incomePerSecond * 1000;
        if (prev.playerStats.netWorth < cost) {
            toast({ variant: "destructive", title: "Acquisition Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` });
            return prev;
        }
        const initialValue = cost * (Math.random() * 0.4 + 0.8);
        const newPlayerStats: PlayerStats = {
            ...prev.playerStats,
            netWorth: prev.playerStats.netWorth - cost,
            industryEstablishmentLevel: 1,
            industryContract: { currentMarketValue: initialValue, valueHistory: [initialValue], partners: [] }
        };
        toast({ title: "Industrial Permit Acquired!", description: "You now own this industrial facility." });
        return { ...prev, playerStats: newPlayerStats };
    });
  };

  const handleExpandIndustry = () => {
    setGameState(prev => {
        if (!prev || !prev.playerStats.industryContract) return prev;
        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const zoneType = currentSystem?.zoneType;
        const theme = (zoneType && industryThemes[zoneType]) ? industryThemes[zoneType] : industryThemes['Default'];
        const incomePerClick = theme.baseIncome * prev.playerStats.industryLevel;
        const incomePerSecond = prev.playerStats.industryAutoClickerBots * incomePerClick;
        const expansionTiers = [10000, 100000, 1000000, 10000000];
        const currentLevel = prev.playerStats.industryEstablishmentLevel;
        if (currentLevel < 1 || currentLevel > 4) return prev;
        const cost = incomePerSecond * expansionTiers[currentLevel - 1];
        if (prev.playerStats.netWorth < cost) {
            toast({ variant: "destructive", title: "Expansion Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` });
            return prev;
        }
        const investmentValue = cost * (Math.random() * 0.2 + 0.7);
        const newMarketValue = Math.round(prev.playerStats.industryContract.currentMarketValue + investmentValue);
        const newPlayerStats: PlayerStats = {
            ...prev.playerStats,
            netWorth: prev.playerStats.netWorth - cost,
            industryEstablishmentLevel: currentLevel + 1,
            industryContract: {
                ...prev.playerStats.industryContract,
                currentMarketValue: newMarketValue,
                valueHistory: [...prev.playerStats.industryContract.valueHistory, newMarketValue].slice(-20),
            }
        };
        toast({ title: "Facility Expanded!", description: `Your industrial operation has grown to Expansion Tier ${newPlayerStats.industryEstablishmentLevel - 1}.` });
        return { ...prev, playerStats: newPlayerStats };
    });
  };

  const handleSellIndustry = () => {
    setGameState(prev => {
        if (!prev || !prev.playerStats.industryContract) return prev;
        const salePrice = prev.playerStats.industryContract.currentMarketValue;
        const newPlayerStats: PlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth + salePrice, industryLevel: 1, industryAutoClickerBots: 0, industryEstablishmentLevel: 0 };
        delete newPlayerStats.industryContract;
        toast({ title: "Assets Liquidated!", description: `You sold the industrial facility for ${salePrice.toLocaleString()}¢.` });
        return { ...prev, playerStats: newPlayerStats };
    });
  };

  const handleAcceptIndustryPartnerOffer = (offer: PartnershipOffer) => {
    setGameState(prev => {
        if (!prev || !prev.playerStats.industryContract) return prev;
        const newPartner: BarPartner = { name: offer.partnerName, percentage: offer.stakePercentage, investment: offer.cashOffer };
        const newPlayerStats: PlayerStats = {
            ...prev.playerStats,
            netWorth: prev.playerStats.netWorth + offer.cashOffer,
            industryContract: {
                ...prev.playerStats.industryContract,
                partners: [...prev.playerStats.industryContract.partners, newPartner],
            }
        };
        const totalPartnerShare = newPlayerStats.industryContract.partners.reduce((acc, p) => acc + p.percentage, 0);
        if (totalPartnerShare > 1) {
            toast({ variant: "destructive", title: "Ownership Limit Reached", description: "You cannot sell more than 100% of your industrial facility." });
            return prev;
        }
        toast({ title: "Deal Struck!", description: `You sold a ${(offer.stakePercentage * 100).toFixed(0)}% stake to ${offer.partnerName} for ${offer.cashOffer.toLocaleString()}¢.` });
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
    handleBarClick,
    handleUpgradeBar,
    handleUpgradeAutoClicker,
    handlePurchaseEstablishment,
    handleExpandEstablishment,
    handleSellBar,
    handleAcceptPartnerOffer,
    handleResidenceClick,
    handleUpgradeResidence,
    handleUpgradeResidenceAutoClicker,
    handlePurchaseResidence,
    handleExpandResidence,
    handleSellResidence,
    handleAcceptResidencePartnerOffer,
    handleCommerceClick,
    handleUpgradeCommerce,
    handleUpgradeCommerceAutoClicker,
    handlePurchaseCommerce,
    handleExpandCommerce,
    handleSellCommerce,
    handleAcceptCommercePartnerOffer,
    handleIndustryClick,
    handleUpgradeIndustry,
    handleUpgradeIndustryAutoClicker,
    handlePurchaseIndustry,
    handleExpandIndustry,
    handleSellIndustry,
    handleAcceptIndustryPartnerOffer,
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
