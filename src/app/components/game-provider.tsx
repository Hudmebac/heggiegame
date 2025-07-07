
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useTransition } from 'react';
import type { GameState, MarketItem, System, Quest, PartnershipOffer, PlayerShip, ShipForSale, CrewMember, PlayerStats, ActiveObjective, QuestTask, EncounterResult, Pirate, SystemEconomy, ItemCategory, InventoryItem, BarContract, ResidenceContract, CommerceContract, IndustryContract, ConstructionContract, RecreationContract, BarPartner } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { runTraderGeneration, runQuestGeneration, runMarketSimulation, runEventGeneration, runPirateScan, resolveEncounter } from '@/app/actions';
import { STATIC_ITEMS } from '@/lib/items';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades } from '@/lib/upgrades';
import { SYSTEMS, ROUTES } from '@/lib/systems';
import { SHIPS_FOR_SALE } from '@/lib/ships';
import { AVAILABLE_CREW } from '@/lib/crew';
import { bios } from '@/lib/bios';
import { barThemes } from '@/lib/bar-themes';
import { residenceThemes } from '@/lib/residence-themes';
import { commerceThemes } from '@/lib/commerce-themes';
import { industryThemes } from '@/lib/industry-themes';
import { constructionThemes } from '@/lib/construction-themes';
import { recreationThemes } from '@/lib/recreation-themes';
import { ShieldCheck, AlertTriangle, Factory, Wheat, Cpu, Hammer, Recycle } from 'lucide-react';

export type EstablishmentType = 'bar' | 'residence' | 'commerce' | 'industry' | 'construction' | 'recreation';

interface GameContextType {
    gameState: GameState | null;
    isClient: boolean;
    isSimulating: boolean;
    isGeneratingQuests: boolean;
    isResolvingEncounter: boolean;
    isGeneratingBio: boolean;
    chartItem: string;
    setChartItem: (item: string) => void;
    tradeDetails: { item: MarketItem, type: 'buy' | 'sell' } | null;
    setTradeDetails: (details: { item: MarketItem, type: 'buy' | 'sell' } | null) => void;
    handleTrade: (itemName: string, type: 'buy' | 'sell', amount: number) => void;
    handleInitiateTrade: (itemName: string, type: 'buy' | 'sell') => void;
    travelDestination: System | null;
    setTravelDestination: (destination: System | null) => void;
    handleInitiateTravel: (systemName: string) => void;
    handlePlanetTravel: (planetName: string) => void;
    handleConfirmTravel: () => void;
    travelFuelCost: number;
    securityConfig: Record<System['security'], { color: string; icon: React.ReactNode }>;
    economyIcons: Record<System['economy'], React.ReactNode>;
    handleGenerateQuests: () => void;
    handleAcceptObjective: (quest: Quest) => void;
    handlePirateAction: (action: 'fight' | 'evade' | 'bribe') => void;
    handleCloseEncounterDialog: () => void;
    encounterResult: EncounterResult | null;
    handleSetAvatar: (url: string) => void;
    handleGenerateBio: () => void;
    setPlayerName: (name: string) => void;
    handleRefuel: () => void;
    handleRepairShip: () => void;
    handleHireCrew: (crewId: string) => void;
    handleFireCrew: (crewId: string) => void;
    handlePurchaseShip: (ship: ShipForSale) => void;
    handleSellShip: (shipInstanceId: number) => void;
    handleUpgradeShip: (shipInstanceId: number, upgradeType: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor') => void;
    handleDowngradeShip: (shipInstanceId: number, upgradeType: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor') => void;
    handleSetActiveShip: (shipInstanceId: number) => void;
    updateTraderBio: (traderName: string, bio: string) => void;
    handleResetGame: () => void;
    
    handleBarClick: (income: number) => void;
    handleUpgradeBar: () => void;
    handleUpgradeBarAutoClicker: () => void;
    handlePurchaseBar: () => void;
    handleExpandBar: () => void;
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
    
    handleConstructionClick: (income: number) => void;
    handleUpgradeConstruction: () => void;
    handleUpgradeConstructionAutoClicker: () => void;
    handlePurchaseConstruction: () => void;
    handleExpandConstruction: () => void;
    handleSellConstruction: () => void;
    handleAcceptConstructionPartnerOffer: (offer: PartnershipOffer) => void;
    
    handleRecreationClick: (income: number) => void;
    handleUpgradeRecreation: () => void;
    handleUpgradeRecreationAutoClicker: () => void;
    handlePurchaseRecreation: () => void;
    handleExpandRecreation: () => void;
    handleSellRecreation: () => void;
    handleAcceptRecreationPartnerOffer: (offer: PartnershipOffer) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

// --- Helper Functions ---
const ECONOMY_MULTIPLIERS: Record<ItemCategory, Record<SystemEconomy, number>> = {
    'Biological': { 'Agricultural': 0.7, 'High-Tech': 1.2, 'Industrial': 1.3, 'Extraction': 1.1, 'Refinery': 1.2 },
    'Industrial': { 'Agricultural': 1.3, 'High-Tech': 1.1, 'Industrial': 0.7, 'Extraction': 1.2, 'Refinery': 0.8 },
    'Pleasure': { 'Agricultural': 1.1, 'High-Tech': 1.2, 'Industrial': 1.1, 'Extraction': 1.0, 'Refinery': 1.0 },
    'Food': { 'Agricultural': 0.6, 'High-Tech': 1.2, 'Industrial': 1.3, 'Extraction': 1.4, 'Refinery': 1.2 },
    'Military': { 'Agricultural': 1.4, 'High-Tech': 1.1, 'Industrial': 1.2, 'Extraction': 1.0, 'Refinery': 1.0 },
    'Technology': { 'Agricultural': 1.3, 'High-Tech': 0.7, 'Industrial': 1.1, 'Extraction': 1.2, 'Refinery': 1.2 },
    'Minerals': { 'Agricultural': 1.2, 'High-Tech': 1.1, 'Industrial': 0.9, 'Extraction': 0.7, 'Refinery': 0.8 },
    'Illegal': { 'Agricultural': 1.1, 'High-Tech': 1.2, 'Industrial': 1.0, 'Extraction': 1.3, 'Refinery': 1.4 },
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

function syncActiveShipStats(playerStats: PlayerStats): PlayerStats {
    if (!playerStats.fleet || playerStats.fleet.length === 0) return playerStats;

    const activeShip = playerStats.fleet[0];
    const newStats = { ...playerStats };

    const cargoTier = cargoUpgrades[activeShip.cargoLevel - 1];
    newStats.maxCargo = cargoTier ? cargoTier.capacity : 0;
    newStats.cargoLevel = activeShip.cargoLevel;

    const weaponTier = weaponUpgrades[activeShip.weaponLevel - 1];
    newStats.weaponLevel = weaponTier ? weaponTier.level : 1;

    const shieldTier = shieldUpgrades[activeShip.shieldLevel - 1];
    newStats.shieldLevel = shieldTier ? shieldTier.level : 1;

    const hullTier = hullUpgrades[activeShip.hullLevel - 1];
    newStats.maxShipHealth = hullTier ? hullTier.health : 100;
    newStats.hullLevel = activeShip.hullLevel;

    const fuelTier = fuelUpgrades[activeShip.fuelLevel - 1];
    newStats.maxFuel = fuelTier ? fuelTier.capacity : 100;
    newStats.fuelLevel = activeShip.fuelLevel;

    const sensorTier = sensorUpgrades[activeShip.sensorLevel - 1];
    newStats.sensorLevel = sensorTier ? sensorTier.level : 1;

    newStats.cargo = Math.min(newStats.cargo || 0, newStats.maxCargo);
    newStats.shipHealth = Math.min(newStats.shipHealth || 0, newStats.maxShipHealth);
    newStats.fuel = Math.min(newStats.fuel || 0, newStats.maxFuel);

    return newStats;
}

const initialShip: PlayerShip = {
    instanceId: Date.now(),
    shipId: 'shuttle-s',
    name: 'My Shuttle',
    cargoLevel: 1, weaponLevel: 1, shieldLevel: 1, hullLevel: 1, fuelLevel: 1, sensorLevel: 1,
};

const initialGameState: Omit<GameState, 'marketItems' | 'playerStats' | 'routes' | 'systems' > & { playerStats: Partial<PlayerStats>, routes: [], systems: [] } = {
  playerStats: {
    name: 'You',
    bio: 'A mysterious trader with a past yet to be written. The galaxy is full of opportunity, and your story is just beginning.',
    netWorth: 10000,
    avatarUrl: '/images/avatars/avatar_01.png',
    pirateRisk: 0, reputation: 0,
    fleet: [initialShip],
    barLevel: 1, autoClickerBots: 0, establishmentLevel: 0,
    residenceLevel: 1, residenceAutoClickerBots: 0, residenceEstablishmentLevel: 0,
    commerceLevel: 1, commerceAutoClickerBots: 0, commerceEstablishmentLevel: 0,
    industryLevel: 1, industryAutoClickerBots: 0, industryEstablishmentLevel: 0,
    constructionLevel: 1, constructionAutoClickerBots: 0, constructionEstablishmentLevel: 0,
    recreationLevel: 1, recreationAutoClickerBots: 0, recreationEstablishmentLevel: 0,
  },
  inventory: [{ name: 'Silicon Nuggets (Standard)', owned: 5 }],
  priceHistory: Object.fromEntries(STATIC_ITEMS.map(item => [item.name, [item.basePrice]])),
  leaderboard: [],
  pirateEncounter: null,
  systems: [], routes: [],
  currentSystem: 'Sol', currentPlanet: 'Earth',
  quests: [], activeObjectives: [],
  crew: [],
};


function useEstablishmentManager({ gameState, setGameState }: { gameState: GameState | null, setGameState: React.Dispatch<React.SetStateAction<GameState | null>> }) {
    const { toast } = useToast();
    const economyCostModifiers: Record<SystemEconomy, number> = { 'High-Tech': 1.15, 'Industrial': 0.90, 'Extraction': 1.00, 'Refinery': 0.95, 'Agricultural': 1.10 };

    const handleUpgradeEstablishmentLevel = useCallback((type: EstablishmentType) => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;
            const levelKey = `${type}Level` as keyof PlayerStats;
            const currentLevel = prev.playerStats[levelKey] as number;

            if (currentLevel >= 25) {
                toastMessage = { variant: "destructive", title: "Upgrade Failed", description: `${type.charAt(0).toUpperCase() + type.slice(1)} level is already at maximum.` };
                return prev;
            }
            const baseCostMultipliers = { bar: 300, residence: 125 * 1.5, commerce: 375 * 1.5, industry: 1200 * 3, construction: 1000 * 4, recreation: 281 * 1.25 };
            const upgradeCost = Math.round(baseCostMultipliers[type] * Math.pow(currentLevel, 2.5) * costModifier);

            if (prev.playerStats.netWorth < upgradeCost) {
                toastMessage = { variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${upgradeCost.toLocaleString()}¢.` };
                return prev;
            }

            const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - upgradeCost };
            (newPlayerStats as any)[levelKey] = currentLevel + 1;
            toastMessage = { title: `${type.charAt(0).toUpperCase() + type.slice(1)} Upgraded!`, description: `Your ${type} is now Level ${newPlayerStats[levelKey] as number}.` };
            return { ...prev, playerStats: newPlayerStats };
        });
        if (toastMessage) setTimeout(() => toast(toastMessage!), 0);
    }, [setGameState, toast]);

    const handleUpgradeEstablishmentAutoClicker = useCallback((type: EstablishmentType) => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;
            const autoClickerKey = type === 'bar' ? 'autoClickerBots' : `${type}AutoClickerBots`;
            const currentBots = (prev.playerStats as any)[autoClickerKey] || 0;

            if (currentBots >= 25) {
                toastMessage = { variant: "destructive", title: "Limit Reached", description: `You cannot purchase more than 25 bots for this ${type}.` };
                return prev;
            }
            const botCostMultipliers = { bar: 9000 * 8, residence: 4250 * 7.5, commerce: 12750 * 7.5, industry: 40500 * 12.5, construction: 29000 * 13.5, recreation: 5625 * 3.5 };
            const cost = Math.round(botCostMultipliers[type] * Math.pow(1.15, currentBots) * costModifier);

            if (prev.playerStats.netWorth < cost) {
                toastMessage = { variant: "destructive", title: "Purchase Failed", description: `Not enough credits to buy a bot. You need ${cost.toLocaleString()}¢.` };
                return prev;
            }

            const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - cost };
            (newPlayerStats as any)[autoClickerKey] = currentBots + 1;
            toastMessage = { title: "Bot Purchased!", description: `A new bot has been added to your ${type} staff.` };
            return { ...prev, playerStats: newPlayerStats };
        });
        if (toastMessage) setTimeout(() => toast(toastMessage!), 0);
    }, [setGameState, toast]);

    const handlePurchaseEstablishment = useCallback((type: EstablishmentType) => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            const establishmentLevelKey = `${type}EstablishmentLevel` as keyof PlayerStats;
            const contractKey = `${type}Contract` as keyof PlayerStats;
            if ((prev.playerStats[establishmentLevelKey] as number) > 0) {
                 toastMessage = { variant: "destructive", title: "Already Owned", description: `You already own a ${type} establishment.` };
                 return prev;
            }

            const costMultipliers = { bar: 3000 * 2, residence: 5000 * 4, commerce: 3000 * 2, industry: 4000 * 3, construction: 5000 * 4, recreation: 3000 * 2 };
            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;
            const cost = costMultipliers[type] * costModifier;

            if (prev.playerStats.netWorth < cost) {
                toastMessage = { variant: "destructive", title: "Purchase Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` };
                return prev;
            }

            const initialValue = cost * (Math.random() * 0.4 + 0.8);
            const newPlayerStats: PlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - cost };
            (newPlayerStats as any)[establishmentLevelKey] = 1;
            (newPlayerStats as any)[contractKey] = { currentMarketValue: initialValue, valueHistory: [initialValue], partners: [], };
            toastMessage = { title: `${type.charAt(0).toUpperCase() + type.slice(1)} Purchased!`, description: `You are now the proud owner of this ${type} establishment.` };
            return { ...prev, playerStats: newPlayerStats };
        });
        if (toastMessage) setTimeout(() => toast(toastMessage!), 0);
    }, [setGameState, toast]);

    const handleExpandEstablishment = useCallback((type: EstablishmentType) => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;
            const establishmentLevelKey = `${type}EstablishmentLevel` as keyof PlayerStats;
            const contractKey = `${type}Contract` as keyof PlayerStats;
            const currentLevel = (prev.playerStats[establishmentLevelKey] as number || 0);
            const contract = prev.playerStats[contractKey] as BarContract;

            if (!contract || currentLevel < 1 || currentLevel > 4) {
                 toastMessage = { variant: "destructive", title: "Expansion Failed", description: `Cannot expand ${type} further or establishment not owned.` };
                 return prev;
            }

            const expansionTiers = {
                bar: [30000 * 2, 300000 * 2, 3000000 * 2, 30000000 * 2],
                residence: [50000 * 4, 500000 * 4, 5000000 * 4, 50000000 * 4],
                commerce: [30000 * 2, 300000 * 2, 3000000 * 2, 30000000 * 2],
                industry: [40000 * 3, 400000 * 3, 4000000 * 3, 40000000 * 3],
                construction: [50000 * 4, 500000 * 4, 5000000 * 4, 50000000 * 4],
                recreation: [30000 * 2, 300000 * 2, 3000000 * 2, 30000000 * 2],
            };
            const cost = Math.round(expansionTiers[type][currentLevel - 1] * costModifier);

            if (prev.playerStats.netWorth < cost) {
                toastMessage = { variant: "destructive", title: "Expansion Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` };
                return prev;
            }

            const investmentValue = cost * (Math.random() * 0.2 + 0.7);
            const newMarketValue = Math.round(contract.currentMarketValue + investmentValue);
            const newPlayerStats: PlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - cost };
            (newPlayerStats as any)[establishmentLevelKey] = currentLevel + 1;
            (newPlayerStats as any)[contractKey] = { ...contract, currentMarketValue: newMarketValue, valueHistory: [...contract.valueHistory, newMarketValue].slice(-20) };
            toastMessage = { title: `${type.charAt(0).toUpperCase() + type.slice(1)} Expanded!`, description: `Your ${type} has grown to Expansion Level ${newPlayerStats[establishmentLevelKey] as number - 1}.` };
            return { ...prev, playerStats: newPlayerStats };
        });
        if (toastMessage) setTimeout(() => toast(toastMessage!), 0);
    }, [setGameState, toast]);

    const handleSellEstablishment = useCallback((type: EstablishmentType) => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            const contractKey = `${type}Contract` as keyof PlayerStats;
            const contract = (prev.playerStats as any)[contractKey];
            if (!contract) {
                toastMessage = { variant: "destructive", title: "Sale Failed", description: `You do not own a ${type} establishment to sell.` };
                return prev;
            }

            const salePrice = contract.currentMarketValue;
            const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth + salePrice };
            const autoClickerKey = type === 'bar' ? 'autoClickerBots' : `${type}AutoClickerBots`;
            
            (newPlayerStats as any)[`${type}Level`] = 1;
            (newPlayerStats as any)[autoClickerKey] = 0;
            (newPlayerStats as any)[`${type}EstablishmentLevel`] = 0;
            (newPlayerStats as any)[contractKey] = undefined;
            toastMessage = { title: `${type.charAt(0).toUpperCase() + type.slice(1)} Sold!`, description: `You sold the ${type} establishment for ${salePrice.toLocaleString()}¢.` };
            return { ...prev, playerStats: newPlayerStats };
        });
        if (toastMessage) setTimeout(() => toast(toastMessage!), 0);
    }, [setGameState, toast]);

     const handleAcceptEstablishmentPartnerOffer = useCallback((type: EstablishmentType, offer: PartnershipOffer) => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            const contractKey = `${type}Contract` as keyof PlayerStats;
            const contract = prev.playerStats[contractKey] as BarContract;
            if (!contract) return prev;

            const newPartner: BarPartner = { name: offer.partnerName, percentage: offer.stakePercentage, investment: offer.cashOffer };
            const updatedPartners = [...(contract.partners || []), newPartner];
            const totalPartnerShare = updatedPartners.reduce((acc, p) => acc + p.percentage, 0);

            if (totalPartnerShare > 1) {
                 toastMessage = { variant: "destructive", title: "Ownership Limit Reached", description: "You cannot sell more than 100% of your establishment." };
                 return prev;
            }

            const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth + offer.cashOffer };
            (newPlayerStats as any)[contractKey] = { ...contract, partners: updatedPartners };
            toastMessage = { title: "Deal Struck!", description: `You sold a ${(offer.stakePercentage * 100).toFixed(0)}% stake to ${offer.partnerName} for ${offer.cashOffer.toLocaleString()}¢.` };
            return { ...prev, playerStats: newPlayerStats };
        });
        if (toastMessage) setTimeout(() => toast(toastMessage!), 0);
    }, [setGameState, toast]);

    return { handleUpgradeEstablishmentLevel, handleUpgradeEstablishmentAutoClicker, handlePurchaseEstablishment, handleExpandEstablishment, handleSellEstablishment, handleAcceptEstablishmentPartnerOffer };
}


export function GameProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [chartItem, setChartItem] = useState<string>(STATIC_ITEMS[0].name);
    const [tradeDetails, setTradeDetails] = useState<{ item: MarketItem, type: 'buy' | 'sell' } | null>(null);
    const [travelDestination, setTravelDestination] = useState<System | null>(null);
    const [isSimulating, startSimulationTransition] = useTransition();
    const [isGeneratingQuests, startQuestGenerationTransition] = useTransition();
    const [isResolvingEncounter, startEncounterResolution] = useTransition();
    const [encounterResult, setEncounterResult] = useState<EncounterResult | null>(null);
    const [isGeneratingBio, startBioGenerationTransition] = useTransition();
    
    // --- Quest Management ---
    const updateObjectiveProgress = useCallback((objectiveType: QuestTask['type'], state: GameState): [GameState, ActiveObjective[]] => {
        let newPlayerStats = { ...state.playerStats };
        const completedObjectives: ActiveObjective[] = [];

        const newActiveObjectives = (state.activeObjectives || []).map(obj => {
            if ((Date.now() - obj.startTime) / 1000 > (obj.timeLimit || Infinity)) {
                return null; // Objective expired
            }

            let updatedObj = { ...obj };
            let progressMade = false;

            if (updatedObj.tasks?.some(t => t.type === objectiveType)) {
                const newProgress = { ...updatedObj.progress };
                newProgress[objectiveType] = (newProgress[objectiveType] || 0) + 1;
                updatedObj = { ...updatedObj, progress: newProgress };
                progressMade = true;
            }

            if (progressMade) {
                const isComplete = updatedObj.tasks?.every(task => (updatedObj.progress[task.type] || 0) >= task.target);
                if (isComplete) {
                    completedObjectives.push(updatedObj);
                    return null;
                }
            }
            return updatedObj;
        }).filter(Boolean) as ActiveObjective[];

        if (completedObjectives.length > 0) {
            completedObjectives.forEach(obj => {
                const rewardAmount = parseInt(obj.reward.replace(/[^0-9]/g, '', 10));
                if (!isNaN(rewardAmount)) {
                    newPlayerStats.netWorth += rewardAmount;
                }
            });
        }

        return [{ ...state, playerStats: newPlayerStats, activeObjectives: newActiveObjectives }, completedObjectives];
    }, []);

    const handleGenerateQuests = useCallback(() => {
        startQuestGenerationTransition(async () => {
            let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
            try {
                const result = await runQuestGeneration();
                setGameState(prev => {
                    if (!prev) return null;
                    return { ...prev, quests: result.quests };
                });
                toastMessage = { title: "New Bounties Posted", description: "The quest board has been updated with new missions." };
            } catch (error) {
                console.error(error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toastMessage = { variant: "destructive", title: "Quest Generation Failed", description: errorMessage };
            }
            if (toastMessage) setTimeout(() => toast(toastMessage!), 0);
        });
    }, [setGameState, toast]);

    const handleAcceptObjective = useCallback((quest: Quest) => {
        let toastMessage: { title: string, description: string } | null = null;
        setGameState(prev => {
            if (!prev || quest.type !== 'Objective' || !quest.timeLimit) return prev;
            const newObjective: ActiveObjective = { ...quest, progress: {}, startTime: Date.now() };
            toastMessage = { title: "Objective Started!", description: `You have ${quest.timeLimit} seconds to complete "${quest.title}".` };
            return {
                ...prev,
                quests: prev.quests.filter(q => q.title !== quest.title),
                activeObjectives: [...(prev.activeObjectives || []), newObjective],
            };
        });
        if (toastMessage) setTimeout(() => toast(toastMessage!), 0);
    }, [setGameState, toast]);

    // --- Business Click/Autoclick Logic ---
    const createBusinessClickHandler = useCallback((type: EstablishmentType, themeSet: any) => (income: number) => {
        let completedToastMessages: { title: string; description: string }[] = [];
        setGameState(prev => {
            if (!prev) return null;
            const baseState = { ...prev, playerStats: { ...prev.playerStats, netWorth: prev.playerStats.netWorth + income } };
            const [newState, completedObjectives] = updateObjectiveProgress(type, baseState);
            completedObjectives.forEach(obj => {
                completedToastMessages.push({ title: 'Objective Complete!', description: `You earned ${obj.reward} for completing "${obj.title}".` });
            });
            return newState;
        });
        if (completedToastMessages.length > 0) {
            setTimeout(() => { completedToastMessages.forEach(msg => toast(msg)); }, 0);
        }
    }, [setGameState, updateObjectiveProgress, toast]);
    
    const handleBarClick = createBusinessClickHandler('bar', barThemes);
    const handleResidenceClick = createBusinessClickHandler('residence', residenceThemes);
    const handleCommerceClick = createBusinessClickHandler('commerce', commerceThemes);
    const handleIndustryClick = createBusinessClickHandler('industry', industryThemes);
    const handleConstructionClick = createBusinessClickHandler('construction', constructionThemes);
    const handleRecreationClick = createBusinessClickHandler('recreation', recreationThemes);

    useEffect(() => {
        const businessTypes: EstablishmentType[] = ['bar', 'residence', 'commerce', 'industry', 'construction', 'recreation'];
        const themeSets = [barThemes, residenceThemes, commerceThemes, industryThemes, constructionThemes, recreationThemes];
        
        const intervalId = setInterval(() => {
            let allCompletedToasts: { title: string; description: string }[] = [];
            setGameState(prev => {
                if (!prev) return prev;

                let nextState = { ...prev };
                let anyBotsActive = false;

                businessTypes.forEach((type, index) => {
                    const autoClickerKey = type === 'bar' ? 'autoClickerBots' : `${type}AutoClickerBots`;
                    const bots = (nextState.playerStats as any)[autoClickerKey] || 0;

                    if (bots > 0) {
                        anyBotsActive = true;
                        const themeSet = themeSets[index];
                        const currentSystem = nextState.systems.find(s => s.name === nextState.currentSystem);
                        const zoneType = currentSystem?.zoneType;
                        const theme = (zoneType && themeSet[zoneType]) ? themeSet[zoneType] : themeSet['Default'];

                        const totalPartnerShare = ((nextState.playerStats as any)[`${type}Contract`]?.partners || []).reduce((acc: number, p: BarPartner) => acc + p.percentage, 0);
                        const incomePerClick = theme.baseIncome * ((nextState.playerStats as any)[`${type}Level`] || 1);
                        const incomePerSecond = bots * incomePerClick * (1 - totalPartnerShare);

                        const playerStatsWithIncome = {
                            ...nextState.playerStats,
                            netWorth: nextState.playerStats.netWorth + incomePerSecond,
                        };

                        const [stateAfterObjective, completedObjectives] = updateObjectiveProgress(type, { ...nextState, playerStats: playerStatsWithIncome });
                        
                        nextState = stateAfterObjective;
                        completedObjectives.forEach(obj => {
                            allCompletedToasts.push({ title: 'Objective Complete!', description: `You earned ${obj.reward} for completing "${obj.title}".` });
                        });
                    }
                });

                if (!anyBotsActive) {
                    clearInterval(intervalId);
                }
                return nextState;
            });

            if (allCompletedToasts.length > 0) {
                setTimeout(() => { allCompletedToasts.forEach(msg => toast(msg)); }, 0);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [gameState?.playerStats.autoClickerBots, gameState?.playerStats.residenceAutoClickerBots, gameState?.playerStats.commerceAutoClickerBots, gameState?.playerStats.industryAutoClickerBots, gameState?.playerStats.constructionAutoClickerBots, gameState?.playerStats.recreationAutoClickerBots, setGameState, updateObjectiveProgress, toast]);


    // --- Core Game State Management (Load/Save/Init) ---
    const calculateMarketDataForSystem = useCallback((system: System): MarketItem[] => {
        const availableItems: MarketItem[] = [];
        const zoneType = system.zoneType;
        STATIC_ITEMS.forEach(staticItem => {
            const economyMultiplier = ECONOMY_MULTIPLIERS[staticItem.category]?.[system.economy] ?? 1.0;
            let availabilityChance = 0.6;
            if(economyMultiplier < 1.0) availabilityChance = 1.0;
            else if(economyMultiplier > 1.0) availabilityChance = 0.8;
            if (Math.random() < availabilityChance) {
                const supply = Math.round(50 + Math.random() * 100 / economyMultiplier);
                const demand = Math.round(50 + Math.random() * 100 * economyMultiplier);
                availableItems.push({
                    name: staticItem.name,
                    currentPrice: calculatePrice(staticItem.basePrice, supply, demand, economyMultiplier),
                    supply, demand,
                });
            }
        });
        return availableItems;
    }, []);

    const generateNewGameState = useCallback(async () => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        const toastId = toast({ title: "Generating New Game...", description: "Preparing the galaxy for your adventure.", duration: Infinity });

        try {
            const [tradersResult, questsResult] = await Promise.all([runTraderGeneration(), runQuestGeneration()]);
            const newLeaderboardWithBios = tradersResult.traders.map(trader => ({ ...trader, rank: 0 }));

            let basePlayerStats = syncActiveShipStats(initialGameState.playerStats as PlayerStats);
            basePlayerStats.cargo = calculateCurrentCargo(initialGameState.inventory);

            const playerEntry = { trader: basePlayerStats.name, netWorth: basePlayerStats.netWorth, fleetSize: basePlayerStats.fleet.length, bio: basePlayerStats.bio, rank: 0 };
            const sortedLeaderboard = [...newLeaderboardWithBios, playerEntry].sort((a, b) => b.netWorth - a.netWorth).map((e, i) => ({ ...e, rank: i + 1 }));

            const currentSystem = SYSTEMS.find(s => s.name === initialGameState.currentSystem)!;
            const marketItems = calculateMarketDataForSystem(currentSystem);

            const newGameState: GameState = {
                ...(initialGameState as GameState),
                playerStats: basePlayerStats,
                marketItems,
                leaderboard: sortedLeaderboard,
                quests: questsResult.quests,
                systems: SYSTEMS, routes: ROUTES, crew: AVAILABLE_CREW,
            };

            setGameState(newGameState);
            toast.update(toastId, { title: "New Game Generated", description: "Your adventure begins now!", duration: 5000 });
        } catch(e) {
            console.error("Failed to generate new game state", e);
            toastMessage = { title: "Error Generating New Game", description: "Could not generate game data. Please try again later.", variant: "destructive" };
        }
        if(toastMessage) toast(toastMessage);
    }, [calculateMarketDataForSystem, toast]);

    useEffect(() => {
        setIsClient(true);
        let savedStateJSON;
        try {
            savedStateJSON = localStorage.getItem('heggieGameState');
        } catch (error) {
            console.error("Failed to access local storage, starting fresh:", error);
            savedStateJSON = null;
        }

        if (savedStateJSON) {
            try {
                const savedProgress = JSON.parse(savedStateJSON);
                const currentSystem = SYSTEMS.find(s => s.name === savedProgress.currentSystem) || SYSTEMS[0];
                const currentPlanetName = savedProgress.currentPlanet && currentSystem.planets.find(p => p.name === savedProgress.currentPlanet) ? savedProgress.currentPlanet : currentSystem.planets[0].name;

                let mergedPlayerStats = { ...initialGameState.playerStats, ...savedProgress.playerStats };
                mergedPlayerStats.inventory = savedProgress.inventory || initialGameState.inventory;
                mergedPlayerStats = syncActiveShipStats(mergedPlayerStats as PlayerStats);
                mergedPlayerStats.cargo = calculateCurrentCargo(mergedPlayerStats.inventory);

                setGameState({
                    ...(initialGameState as GameState), systems: SYSTEMS, routes: ROUTES, ...savedProgress,
                    playerStats: mergedPlayerStats,
                    currentPlanet: currentPlanetName,
                    marketItems: calculateMarketDataForSystem(currentSystem),
                    crew: savedProgress.crew || AVAILABLE_CREW,
                });
                setTimeout(() => toast({ title: "Game Loaded", description: "Continuing your spacefaring journey." }), 0);
            } catch (error) {
                console.error("Failed to parse saved game state, starting fresh:", error);
                generateNewGameState();
            }
        } else {
            generateNewGameState();
        }
    }, [calculateMarketDataForSystem, generateNewGameState, toast]);

    useEffect(() => {
        if (isClient && gameState) {
            try {
                const stateToSave = {
                    playerStats: gameState.playerStats,
                    inventory: gameState.inventory,
                    priceHistory: gameState.priceHistory,
                    leaderboard: gameState.leaderboard,
                    currentSystem: gameState.currentSystem,
                    currentPlanet: gameState.currentPlanet,
                    quests: gameState.quests,
                    activeObjectives: gameState.activeObjectives,
                    crew: gameState.crew,
                };
                localStorage.setItem('heggieGameState', JSON.stringify(stateToSave));
            } catch (error) {
                console.error("Failed to save game state to local storage:", error);
            }
        }
    }, [gameState, isClient]);
    
    // --- All other game logic hooks consolidated here ---
    // ... Market Logic ...
    const handleTrade = (itemName: string, type: 'buy' | 'sell', amount: number) => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            const marketItem = prev.marketItems.find(i => i.name === itemName);
            const staticItemData = STATIC_ITEMS.find(i => i.name === itemName);
            if (!marketItem || !staticItemData) return prev;
            
            const newPlayerStats = { ...prev.playerStats };
            let newInventory = [...prev.inventory];
            const inventoryItemIndex = newInventory.findIndex(i => i.name === itemName);
            let inventoryItem = newInventory[inventoryItemIndex];
            
            const totalCost = marketItem.currentPrice * amount;
            const totalCargo = staticItemData.cargoSpace * amount;

            if (type === 'buy') {
                if (newPlayerStats.netWorth < totalCost) { toastMessage = { variant: "destructive", title: "Transaction Failed", description: "Not enough credits." }; return prev; }
                if (calculateCurrentCargo(prev.inventory) + totalCargo > newPlayerStats.maxCargo) { toastMessage = { variant: "destructive", title: "Transaction Failed", description: "Not enough cargo space." }; return prev; }
                newPlayerStats.netWorth -= totalCost;
                if (inventoryItem) newInventory[inventoryItemIndex] = { ...inventoryItem, owned: inventoryItem.owned + amount };
                else newInventory.push({ name: itemName, owned: amount });
            } else { // sell
                if (!inventoryItem || inventoryItem.owned < amount) { toastMessage = { variant: "destructive", title: "Transaction Failed", description: "Not enough items to sell." }; return prev; }
                newPlayerStats.netWorth += totalCost;
                newInventory[inventoryItemIndex] = { ...inventoryItem, owned: inventoryItem.owned - amount };
            }
            
            const updatedInventory = newInventory.filter(item => item.owned > 0);
            newPlayerStats.cargo = calculateCurrentCargo(updatedInventory);
            
            return { ...prev, playerStats: newPlayerStats, inventory: updatedInventory };
        });
        if(toastMessage) setTimeout(() => toast(toastMessage!), 0);
    };

    const handleInitiateTrade = (itemName: string, type: 'buy' | 'sell') => {
        if (!gameState) return;
        const item = gameState.marketItems.find(i => i.name === itemName);
        if (item) setTradeDetails({ item, type });
    };

    // ... Travel Logic ...
    const handleInitiateTravel = (systemName: string) => {
        if (!gameState || systemName === gameState.currentSystem) return;
        const destination = gameState.systems.find(s => s.name === systemName);
        if (destination) setTravelDestination(destination);
    };

    const handlePlanetTravel = (planetName: string) => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev || prev.currentPlanet === planetName) return prev;
            const planetFuelCost = 1;
            if (prev.playerStats.fuel < planetFuelCost) {
                toastMessage = { variant: "destructive", title: "Travel Failed", description: `Not enough fuel. You need ${planetFuelCost} SU.` };
                return prev;
            }
            const newPlayerStats = { ...prev.playerStats, fuel: prev.playerStats.fuel - planetFuelCost };
            toastMessage = { title: `Arrived at ${planetName}`, description: `Orbital realignment complete. Fuel consumed: ${planetFuelCost} SU.` };
            return { ...prev, playerStats: newPlayerStats, currentPlanet: planetName };
        });
        if (toastMessage) setTimeout(() => toast(toastMessage!), 0);
    };

    const handleConfirmTravel = () => {
        if (!gameState || !travelDestination) return;
        const currentSystem = gameState.systems.find(s => s.name === gameState.currentSystem)!;
        const distance = Math.hypot(travelDestination.x - currentSystem.x, travelDestination.y - currentSystem.y);
        let fuelCost = Math.round(distance / 5);
        if (gameState.playerStats.fuel < fuelCost) {
            toast({ variant: "destructive", title: "Travel Failed", description: `Not enough fuel. You need ${fuelCost} SU.` });
            setTravelDestination(null);
            return;
        }

        startSimulationTransition(async () => {
            let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
            try {
                // ... logic for encounters, market simulation, etc. ...
                const [eventResult, simResult] = await Promise.all([
                    runEventGeneration(),
                    runMarketSimulation({
                        items: calculateMarketDataForSystem(travelDestination),
                        systemEconomy: travelDestination.economy,
                        systemVolatility: travelDestination.volatility,
                    })
                ]);
                
                const newMarketItems: MarketItem[] = simResult.map(update => {
                    const staticItem = STATIC_ITEMS.find(si => si.name === update.name)!;
                    const economyMultiplier = ECONOMY_MULTIPLIERS[staticItem.category][travelDestination.economy];
                    return {
                        name: update.name,
                        supply: update.newSupply,
                        demand: update.newDemand,
                        currentPrice: calculatePrice(staticItem.basePrice, update.newSupply, update.newDemand, economyMultiplier),
                    };
                });

                setGameState(prev => {
                    if (!prev) return null;
                    const newPriceHistory = { ...prev.priceHistory };
                    newMarketItems.forEach(item => {
                        newPriceHistory[item.name] = [...(newPriceHistory[item.name] || []), item.currentPrice].slice(-20);
                    });
                    const newPlayerStats = { ...prev.playerStats, fuel: prev.playerStats.fuel - fuelCost };
                    return {
                        ...prev, playerStats: newPlayerStats, currentSystem: travelDestination.name, currentPlanet: travelDestination.planets[0].name, marketItems: newMarketItems, priceHistory: newPriceHistory,
                    };
                });
                toastMessage = { title: `Arrival: ${travelDestination.name}`, description: eventResult.eventDescription };
            } catch(e) {
                toastMessage = { variant: "destructive", title: "Warp Malfunction", description: "Something went wrong during travel." };
            }
            setTravelDestination(null);
            if(toastMessage) setTimeout(() => toast(toastMessage!), 0);
        });
    };

    const travelFuelCost = gameState && travelDestination ? Math.round(Math.hypot(travelDestination.x - (gameState.systems.find(s => s.name === gameState.currentSystem)?.x || 0), travelDestination.y - (gameState.systems.find(s => s.name === gameState.currentSystem)?.y || 0)) / 5) : 0;
    
    // ... Player Actions ...
    const handleSetAvatar = (url: string) => {
        setGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    avatarUrl: url,
                },
            };
        });
    };

    const handleGenerateBio = () => {
        startBioGenerationTransition(() => {
            setGameState(prev => {
                if (!prev) return null;
                const newBio = bios[Math.floor(Math.random() * bios.length)].replace(/{Captain}/g, prev.playerStats.name);
                toast({ title: "Bio Generated", description: "Your captain's story has been updated." });
                return { ...prev, playerStats: { ...prev.playerStats, bio: newBio } };
            });
        });
    };
    
    const setPlayerName = (name: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const oldName = prev.playerStats.name;
            const newLeaderboard = prev.leaderboard.map(e => e.trader === oldName ? { ...e, trader: name } : e);
            return {
                ...prev,
                playerStats: { ...prev.playerStats, name },
                leaderboard: newLeaderboard
            }
        });
    };

    const updateTraderBio = (traderName: string, bio: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const newLeaderboard = prev.leaderboard.map(e => e.trader === traderName ? { ...e, bio: bio } : e);
            return { ...prev, leaderboard: newLeaderboard };
        });
    };

    const handleResetGame = useCallback(() => {
        toast({
            title: "Game Resetting...",
            description: "Wiping all progress. A new adventure awaits!",
        });
        localStorage.removeItem('heggieGameState');
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }, [toast]);

    const handleRefuel = () => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            const fuelNeeded = prev.playerStats.maxFuel - prev.playerStats.fuel;
            if (fuelNeeded <= 0) {
                toastMessage = { title: "Refuel Not Needed", description: "Fuel tank is already full." };
                return prev;
            }
            const fuelPrice = 2; // credits per unit
            const totalCost = fuelNeeded * fuelPrice;
            if (prev.playerStats.netWorth < totalCost) {
                toastMessage = { variant: "destructive", title: "Refuel Failed", description: `Not enough credits. You need ${totalCost}¢.` };
                return prev;
            }
            const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - totalCost, fuel: prev.playerStats.maxFuel, };
            toastMessage = { title: "Refuel Complete", description: `You spent ${totalCost}¢ to refuel your ship.` };
            return { ...prev, playerStats: newPlayerStats };
        });
        if(toastMessage) setTimeout(() => toast(toastMessage!), 0);
    };

    const handleRepairShip = () => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            const damageToRepair = prev.playerStats.maxShipHealth - prev.playerStats.shipHealth;
            if (damageToRepair <= 0) {
                toastMessage = { title: "Repairs Not Needed", description: "Ship integrity is at 100%." };
                return prev;
            }
            const baseRepairPricePerPoint = 50;
            const totalCost = Math.round(damageToRepair * baseRepairPricePerPoint);
            if (prev.playerStats.netWorth < totalCost) {
                toastMessage = { variant: "destructive", title: "Repairs Failed", description: `Not enough credits. You need ${totalCost}¢.` };
                return prev;
            }
            const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - totalCost, shipHealth: prev.playerStats.maxShipHealth, };
            toastMessage = { title: "Repairs Complete", description: `You spent ${totalCost}¢ to restore your ship\'s hull.` };
            return { ...prev, playerStats: newPlayerStats };
        });
        if(toastMessage) setTimeout(() => toast(toastMessage!), 0);
    };

    const handleHireCrew = (crewId: string) => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            const crewToHire = AVAILABLE_CREW.find(c => c.id === crewId);
            if (!crewToHire) return prev;
            if (prev.playerStats.netWorth < crewToHire.hiringFee) {
                toastMessage = { variant: "destructive", title: "Hiring Failed", description: "Not enough credits." };
                return prev;
            }
            const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - crewToHire.hiringFee };
            const newCrew = [...prev.crew, crewToHire];
            toastMessage = { title: "Crew Member Hired", description: `${crewToHire.name} has joined your crew.` };
            return { ...prev, playerStats: newPlayerStats, crew: newCrew };
        });
        if(toastMessage) setTimeout(() => toast(toastMessage!), 0);
    };

    const handleFireCrew = (crewId: string) => {
        let toastMessage: { title: string, description: string } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            const crewToFire = prev.crew.find(c => c.id === crewId);
            if (!crewToFire) return prev;
            const newCrew = prev.crew.filter(c => c.id !== crewId);
            toastMessage = { title: "Crew Member Fired", description: `${crewToFire.name} has left your crew.` };
            return { ...prev, crew: newCrew };
        });
        if(toastMessage) setTimeout(() => toast(toastMessage!), 0);
    };

    const handlePurchaseShip = (ship: ShipForSale) => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            if (prev.playerStats.netWorth < ship.cost) {
                toastMessage = { variant: "destructive", title: "Purchase Failed", description: "Not enough credits." };
                return prev;
            }
            const newShip: PlayerShip = {
                instanceId: Date.now(),
                shipId: ship.id,
                name: ship.name,
                cargoLevel: 1, weaponLevel: 1, shieldLevel: 1, hullLevel: 1, fuelLevel: 1, sensorLevel: 1,
            };
            const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - ship.cost, fleet: [...prev.playerStats.fleet, newShip] };
            toastMessage = { title: "Ship Purchased!", description: `The ${ship.name} has been added to your fleet.` };
            return { ...prev, playerStats: newPlayerStats };
        });
        if(toastMessage) setTimeout(() => toast(toastMessage!), 0);
    };

    const handleSellShip = (shipInstanceId: number) => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev || prev.playerStats.fleet.length <= 1) {
                toastMessage = { variant: "destructive", title: "Sale Failed", description: "You cannot sell your last ship." };
                return prev;
            }
            const shipIndex = prev.playerStats.fleet.findIndex(s => s.instanceId === shipInstanceId);
            if (shipIndex === -1) return prev;

            const shipToSell = prev.playerStats.fleet[shipIndex];
            const baseData = SHIPS_FOR_SALE.find(s => s.id === shipToSell.shipId)!;
            let totalValue = baseData.cost;
            totalValue += cargoUpgrades[shipToSell.cargoLevel - 1].cost;
            totalValue += weaponUpgrades[shipToSell.weaponLevel - 1].cost;
            totalValue += shieldUpgrades[shipToSell.shieldLevel - 1].cost;
            totalValue += hullUpgrades[shipToSell.hullLevel - 1].cost;
            totalValue += fuelUpgrades[shipToSell.fuelLevel - 1].cost;
            totalValue += sensorUpgrades[shipToSell.sensorLevel - 1].cost;

            const salePrice = Math.round(totalValue * 0.7);
            const newFleet = prev.playerStats.fleet.filter(s => s.instanceId !== shipInstanceId);
            let newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth + salePrice, fleet: newFleet };
            
            if (shipIndex === 0) { // If active ship was sold, sync stats to the new active ship
                newPlayerStats = syncActiveShipStats(newPlayerStats);
            }
            
            toastMessage = { title: "Ship Sold", description: `You sold the ${shipToSell.name} for ${salePrice.toLocaleString()}¢.` };
            return { ...prev, playerStats: newPlayerStats };
        });
        if(toastMessage) setTimeout(() => toast(toastMessage!), 0);
    };

    const handleUpgradeShip = (shipInstanceId: number, upgradeType: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor') => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            const fleet = [...prev.playerStats.fleet];
            const shipIndex = fleet.findIndex(s => s.instanceId === shipInstanceId);
            if (shipIndex === -1) return prev;

            const shipToUpgrade = { ...fleet[shipIndex] };
            const upgradeMap = {
                cargo: { levels: cargoUpgrades, current: shipToUpgrade.cargoLevel },
                weapon: { levels: weaponUpgrades, current: shipToUpgrade.weaponLevel },
                shield: { levels: shieldUpgrades, current: shipToUpgrade.shieldLevel },
                hull: { levels: hullUpgrades, current: shipToUpgrade.hullLevel },
                fuel: { levels: fuelUpgrades, current: shipToUpgrade.fuelLevel },
                sensor: { levels: sensorUpgrades, current: shipToUpgrade.sensorLevel },
            };

            const upgradeInfo = upgradeMap[upgradeType];
            if (upgradeInfo.current >= upgradeInfo.levels.length) {
                toastMessage = { variant: "destructive", title: "Upgrade Failed", description: "Already at max level." };
                return prev;
            }
            const currentTierCost = upgradeInfo.levels[upgradeInfo.current - 1]?.cost || 0;
            const nextTierCost = upgradeInfo.levels[upgradeInfo.current].cost;
            const cost = nextTierCost - currentTierCost;

            if (prev.playerStats.netWorth < cost) {
                toastMessage = { variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` };
                return prev;
            }

            (shipToUpgrade as any)[`${upgradeType}Level`] += 1;
            fleet[shipIndex] = shipToUpgrade;
            let newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - cost, fleet };

            if (shipIndex === 0) newPlayerStats = syncActiveShipStats(newPlayerStats);
            
            toastMessage = { title: `${upgradeType.charAt(0).toUpperCase() + upgradeType.slice(1)} Upgraded!`, description: `Your ${shipToUpgrade.name}'s ${upgradeType} is now Mk. ${shipToUpgrade[`${upgradeType}Level` as keyof PlayerShip]}.` };
            return { ...prev, playerStats: newPlayerStats };
        });
        if(toastMessage) setTimeout(() => toast(toastMessage!), 0);
    };

    const handleDowngradeShip = (shipInstanceId: number, upgradeType: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor') => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            const fleet = [...prev.playerStats.fleet];
            const shipIndex = fleet.findIndex(s => s.instanceId === shipInstanceId);
            if (shipIndex === -1) return prev;

            const shipToDowngrade = { ...fleet[shipIndex] };
            const upgradeMap = {
                cargo: { levels: cargoUpgrades, current: shipToDowngrade.cargoLevel },
                weapon: { levels: weaponUpgrades, current: shipToDowngrade.weaponLevel },
                shield: { levels: shieldUpgrades, current: shipToDowngrade.shieldLevel },
                hull: { levels: hullUpgrades, current: shipToDowngrade.hullLevel },
                fuel: { levels: fuelUpgrades, current: shipToDowngrade.fuelLevel },
                sensor: { levels: sensorUpgrades, current: shipToDowngrade.sensorLevel },
            };
            const upgradeInfo = upgradeMap[upgradeType];
            if (upgradeInfo.current <= 1) {
                toastMessage = { variant: "destructive", title: "Downgrade Failed", description: "Cannot downgrade further." };
                return prev;
            }
            const currentTierCost = upgradeInfo.levels[upgradeInfo.current - 1].cost;
            const prevTierCost = upgradeInfo.levels[upgradeInfo.current - 2].cost;
            const refund = Math.round((currentTierCost - prevTierCost) * 0.7);

            (shipToDowngrade as any)[`${upgradeType}Level`] -= 1;
            fleet[shipIndex] = shipToDowngrade;
            let newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth + refund, fleet };
            if (shipIndex === 0) newPlayerStats = syncActiveShipStats(newPlayerStats);
            
            toastMessage = { title: "Downgrade Successful!", description: `You received ${refund.toLocaleString()}¢ for selling the old component.` };
            return { ...prev, playerStats: newPlayerStats };
        });
        if(toastMessage) setTimeout(() => toast(toastMessage!), 0);
    };

    const handleSetActiveShip = (shipInstanceId: number) => {
        let toastMessage: { title: string, description: string } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            const shipIndex = prev.playerStats.fleet.findIndex(s => s.instanceId === shipInstanceId);
            if (shipIndex <= 0) return prev; // Already active or not found

            const newFleet = [...prev.playerStats.fleet];
            const activeShip = newFleet.splice(shipIndex, 1)[0];
            newFleet.unshift(activeShip);
            
            let newPlayerStats = { ...prev.playerStats, fleet: newFleet };
            newPlayerStats = syncActiveShipStats(newPlayerStats);
            toastMessage = { title: "Active Ship Changed", description: `The ${activeShip.name} is now your active vessel.` };
            return { ...prev, playerStats: newPlayerStats };
        });
        if(toastMessage) setTimeout(() => toast(toastMessage!), 0);
    };
    
    const handlePirateAction = (action: 'fight' | 'evade' | 'bribe') => {
        if (!gameState?.pirateEncounter) return;
        const pirate = gameState.pirateEncounter;
        startEncounterResolution(async () => {
            let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
            try {
                const result = await resolveEncounter({
                    action,
                    playerNetWorth: gameState.playerStats.netWorth,
                    playerCargo: gameState.playerStats.cargo,
                    pirateName: pirate.name,
                    pirateThreatLevel: pirate.threatLevel,
                    hasGunner: gameState.crew.some(c => c.role === 'Gunner'),
                    hasNegotiator: gameState.crew.some(c => c.role === 'Negotiator'),
                    shipHealth: gameState.playerStats.shipHealth,
                    weaponLevel: gameState.playerStats.weaponLevel,
                    shieldLevel: gameState.playerStats.shieldLevel,
                });
                setEncounterResult(result);
                setGameState(prev => {
                    if (!prev) return null;
                    const newPlayerStats = { ...prev.playerStats };
                    newPlayerStats.netWorth -= result.creditsLost;
                    newPlayerStats.shipHealth = Math.max(0, newPlayerStats.shipHealth - result.damageTaken);
                    // Handle cargo loss if implemented fully
                    return { ...prev, playerStats: newPlayerStats, pirateEncounter: null };
                });
            } catch (error) {
                console.error(error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toastMessage = { variant: "destructive", title: "Encounter Resolution Failed", description: errorMessage };
            }
             if (toastMessage) setTimeout(() => toast(toastMessage!), 0);
        });
    };
    const handleCloseEncounterDialog = () => setEncounterResult(null);

    // ... Establishment Manager Wrappers ...
    const { handleUpgradeEstablishmentLevel, handleUpgradeEstablishmentAutoClicker, handlePurchaseEstablishment, handleExpandEstablishment, handleSellEstablishment, handleAcceptEstablishmentPartnerOffer } = useEstablishmentManager({ gameState, setGameState });

    const handleUpgradeBar = () => handleUpgradeEstablishmentLevel('bar');
    const handleUpgradeBarAutoClicker = () => handleUpgradeEstablishmentAutoClicker('bar');
    const handlePurchaseBar = () => handlePurchaseEstablishment('bar');
    const handleExpandBar = () => handleExpandEstablishment('bar');
    const handleSellBar = () => handleSellEstablishment('bar');
    const handleAcceptPartnerOffer = (offer: PartnershipOffer) => handleAcceptEstablishmentPartnerOffer('bar', offer);
    
    const handleUpgradeResidence = () => handleUpgradeEstablishmentLevel('residence');
    const handleUpgradeResidenceAutoClicker = () => handleUpgradeEstablishmentAutoClicker('residence');
    const handlePurchaseResidence = () => handlePurchaseEstablishment('residence');
    const handleExpandResidence = () => handleExpandEstablishment('residence');
    const handleSellResidence = () => handleSellEstablishment('residence');
    const handleAcceptResidencePartnerOffer = (offer: PartnershipOffer) => handleAcceptEstablishmentPartnerOffer('residence', offer);

    const handleUpgradeCommerce = () => handleUpgradeEstablishmentLevel('commerce');
    const handleUpgradeCommerceAutoClicker = () => handleUpgradeEstablishmentAutoClicker('commerce');
    const handlePurchaseCommerce = () => handlePurchaseEstablishment('commerce');
    const handleExpandCommerce = () => handleExpandEstablishment('commerce');
    const handleSellCommerce = () => handleSellEstablishment('commerce');
    const handleAcceptCommercePartnerOffer = (offer: PartnershipOffer) => handleAcceptEstablishmentPartnerOffer('commerce', offer);

    const handleUpgradeIndustry = () => handleUpgradeEstablishmentLevel('industry');
    const handleUpgradeIndustryAutoClicker = () => handleUpgradeEstablishmentAutoClicker('industry');
    const handlePurchaseIndustry = () => handlePurchaseEstablishment('industry');
    const handleExpandIndustry = () => handleExpandEstablishment('industry');
    const handleSellIndustry = () => handleSellEstablishment('industry');
    const handleAcceptIndustryPartnerOffer = (offer: PartnershipOffer) => handleAcceptEstablishmentPartnerOffer('industry', offer);

    const handleUpgradeConstruction = () => handleUpgradeEstablishmentLevel('construction');
    const handleUpgradeConstructionAutoClicker = () => handleUpgradeEstablishmentAutoClicker('construction');
    const handlePurchaseConstruction = () => handlePurchaseEstablishment('construction');
    const handleExpandConstruction = () => handleExpandEstablishment('construction');
    const handleSellConstruction = () => handleSellEstablishment('construction');
    const handleAcceptConstructionPartnerOffer = (offer: PartnershipOffer) => handleAcceptEstablishmentPartnerOffer('construction', offer);

    const handleUpgradeRecreation = () => handleUpgradeEstablishmentLevel('recreation');
    const handleUpgradeRecreationAutoClicker = () => handleUpgradeEstablishmentAutoClicker('recreation');
    const handlePurchaseRecreation = () => handlePurchaseEstablishment('recreation');
    const handleExpandRecreation = () => handleExpandEstablishment('recreation');
    const handleSellRecreation = () => handleSellEstablishment('recreation');
    const handleAcceptRecreationPartnerOffer = (offer: PartnershipOffer) => handleAcceptEstablishmentPartnerOffer('recreation', offer);

    const contextValue: GameContextType = {
        gameState, isClient,
        isSimulating, isGeneratingQuests, isResolvingEncounter, isGeneratingBio,
        chartItem, setChartItem, tradeDetails, setTradeDetails, handleTrade, handleInitiateTrade,
        travelDestination, setTravelDestination, handleInitiateTravel, handlePlanetTravel, handleConfirmTravel, travelFuelCost,
        securityConfig: { 'High': { color: 'text-green-400', icon: <ShieldCheck className="h-4 w-4" /> }, 'Medium': { color: 'text-yellow-400', icon: <ShieldCheck className="h-4 w-4" /> }, 'Low': { color: 'text-orange-400', icon: <AlertTriangle className="h-4 w-4" /> }, 'Anarchy': { color: 'text-destructive', icon: <AlertTriangle className="h-4 w-4" /> }, },
        economyIcons: { 'Industrial': <Factory className="h-4 w-4" />, 'Agricultural': <Wheat className="h-4 w-4" />, 'High-Tech': <Cpu className="h-4 w-4" />, 'Extraction': <Hammer className="h-4 w-4" />, 'Refinery': <Recycle className="h-4 w-4" />, },
        handleGenerateQuests, handleAcceptObjective,
        handlePirateAction, handleCloseEncounterDialog, encounterResult,
        handleSetAvatar, handleGenerateBio, setPlayerName, updateTraderBio, handleResetGame,
        handleRefuel, handleRepairShip,
        handleHireCrew, handleFireCrew,
        handlePurchaseShip, handleSellShip, handleUpgradeShip, handleDowngradeShip, handleSetActiveShip,
        
        handleBarClick, handleUpgradeBar, handleUpgradeBarAutoClicker, handlePurchaseBar, handleExpandBar, handleSellBar, handleAcceptPartnerOffer,
        
        handleResidenceClick, handleUpgradeResidence, handleUpgradeResidenceAutoClicker, handlePurchaseResidence, handleExpandResidence, handleSellResidence, handleAcceptResidencePartnerOffer,
        
        handleCommerceClick, handleUpgradeCommerce, handleUpgradeCommerceAutoClicker, handlePurchaseCommerce, handleExpandCommerce, handleSellCommerce, handleAcceptCommercePartnerOffer,
        
        handleIndustryClick, handleUpgradeIndustry, handleUpgradeIndustryAutoClicker, handlePurchaseIndustry, handleExpandIndustry, handleSellIndustry, handleAcceptIndustryPartnerOffer,
        
        handleConstructionClick, handleUpgradeConstruction, handleUpgradeConstructionAutoClicker, handlePurchaseConstruction, handleExpandConstruction, handleSellConstruction, handleAcceptConstructionPartnerOffer,
        
        handleRecreationClick, handleUpgradeRecreation, handleUpgradeRecreationAutoClicker, handlePurchaseRecreation, handleExpandRecreation, handleSellRecreation, handleAcceptRecreationPartnerOffer,
    };

    return (
        <GameContext.Provider value={contextValue}>
            {children}
            <Toaster />
        </GameContext.Provider>
    );
}
