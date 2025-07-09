

'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import type { GameState, InventoryItem, PlayerStats, System, MarketItem, ItemCategory, SystemEconomy, PlayerShip, CasinoState, Difficulty, InsurancePolicies, Loan, CreditCard, Career, TaxiMission, Warehouse, EscortMission, MilitaryMission } from '@/lib/types';
import { runTraderGeneration, runQuestGeneration } from '@/app/actions';
import { STATIC_ITEMS } from '@/lib/items';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades, droneUpgrades, powerCoreUpgrades } from '@/lib/upgrades';
import { SYSTEMS, ROUTES } from '@/lib/systems';
import { SHIPS_FOR_SALE } from '@/lib/ships';
import { AVAILABLE_CREW } from '@/lib/crew';
import { CAREER_DATA } from '@/lib/careers';
import { bios } from '@/lib/bios';
import { useToast } from '@/hooks/use-toast';
import { calculateCurrentCargo } from '@/lib/utils';


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
    
    const droneTier = droneUpgrades[activeShip.droneLevel - 1];
    newStats.droneLevel = droneTier ? droneTier.level : 1;

    newStats.powerCoreLevel = activeShip.powerCoreLevel;
    newStats.overdriveEngine = activeShip.overdriveEngine;
    newStats.warpStabilizer = activeShip.warpStabilizer;
    newStats.stealthPlating = activeShip.stealthPlating;
    newStats.targetingMatrix = activeShip.targetingMatrix;
    newStats.anomalyAnalyzer = activeShip.anomalyAnalyzer;
    newStats.fabricatorBay = activeShip.fabricatorBay;
    newStats.gravAnchor = activeShip.gravAnchor;
    newStats.aiCoreInterface = activeShip.aiCoreInterface;
    newStats.bioDomeModule = activeShip.bioDomeModule;
    newStats.flakDispensers = activeShip.flakDispensers;
    newStats.boardingTubeSystem = activeShip.boardingTubeSystem;
    newStats.terraformToolkit = activeShip.terraformToolkit;
    newStats.thermalRegulator = activeShip.thermalRegulator;
    newStats.diplomaticUplink = activeShip.diplomaticUplink;
    
    newStats.shipHealth = activeShip.health;
    newStats.fuel = Math.min(newStats.fuel || 0, newStats.maxFuel);

    return newStats;
}

const initialShip: PlayerShip = {
    instanceId: Date.now(),
    shipId: 'shuttle-s',
    name: 'My Shuttle',
    cargoLevel: 1, weaponLevel: 1, shieldLevel: 1, hullLevel: 1, fuelLevel: 1, sensorLevel: 1, droneLevel: 1,
    powerCoreLevel: 1, overdriveEngine: false, warpStabilizer: false, stealthPlating: false, targetingMatrix: false, anomalyAnalyzer: false, fabricatorBay: false,
    gravAnchor: false, aiCoreInterface: false, bioDomeModule: false, flakDispensers: false, boardingTubeSystem: false, terraformToolkit: false, thermalRegulator: false, diplomaticUplink: false,
    health: hullUpgrades[0].health,
    status: 'operational',
};

const initialCasinoState: CasinoState = {
    lastPlayed: {},
    dailyLotteryTicketPurchased: false,
};

const initialInsuranceState: InsurancePolicies = {
    health: false,
    cargo: false,
    ship: false,
}

const initialGameState: Omit<GameState, 'marketItems' | 'playerStats' | 'routes' | 'systems' > & { playerStats: Partial<PlayerStats>, routes: [], systems: [] } = {
  playerStats: {
    name: 'You',
    bio: 'A mysterious trader with a past yet to be written. The galaxy is full of opportunity, and your story is just beginning.',
    netWorth: 10000,
    avatarUrl: '/images/avatars/avatar_01.png',
    pirateRisk: 0, reputation: 0, inspiration: 0,
    fleet: [initialShip],
    barLevel: 1, autoClickerBots: 0, establishmentLevel: 0,
    residenceLevel: 1, residenceAutoClickerBots: 0, residenceEstablishmentLevel: 0,
    commerceLevel: 1, commerceAutoClickerBots: 0, commerceEstablishmentLevel: 0,
    industryLevel: 1, industryAutoClickerBots: 0, industryEstablishmentLevel: 0,
    constructionLevel: 1, constructionAutoClickerBots: 0, constructionEstablishmentLevel: 0,
    recreationLevel: 1, recreationAutoClickerBots: 0, recreationEstablishmentLevel: 0,
    casino: initialCasinoState,
    insurance: initialInsuranceState,
    warehouses: [],
    cargoValueHistory: [0],
    bankAccount: undefined,
    bankShares: 0,
    bankLevel: 1,
    bankAutoClickerBots: 0,
    bankEstablishmentLevel: 0,
    bankContract: undefined,
    loan: undefined,
    creditCard: undefined,
    debt: 0,
    powerCoreLevel: 1, overdriveEngine: false, warpStabilizer: false, stealthPlating: false, targetingMatrix: false, anomalyAnalyzer: false, fabricatorBay: false,
    gravAnchor: false, aiCoreInterface: false, bioDomeModule: false, flakDispensers: false, boardingTubeSystem: false, terraformToolkit: false, thermalRegulator: false, diplomaticUplink: false,
    tradeContracts: [],
    taxiMissions: [],
    escortMissions: [],
    militaryMissions: [],
    usedPromoCodes: [],
  },
  inventory: [{ name: 'Silicon Nuggets (Standard)', owned: 5 }],
  priceHistory: Object.fromEntries(STATIC_ITEMS.map(item => [item.name, [item.basePrice]])),
  leaderboard: [],
  pirateEncounter: null,
  systems: [], routes: [],
  currentSystem: 'Sol', currentPlanet: 'Earth',
  quests: [], activeObjectives: [],
  crew: [],
  difficulty: 'Medium',
  isGameOver: false,
};


export function useGameState() {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [isGeneratingNewGame, startNewGameTransition] = useTransition();


    const calculateMarketDataForSystem = useCallback((system: System): MarketItem[] => {
        const availableItems: MarketItem[] = [];
        STATIC_ITEMS.forEach(staticItem => {
            const economyMultiplier = ECONOMY_MULTIPLIERS[staticItem.category]?.[system.economy] ?? 1.0;
            let availabilityChance = 0.6;
            if (economyMultiplier < 1.0) availabilityChance = 1.0;
            else if (economyMultiplier > 1.0) availabilityChance = 0.8;
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

    const startNewGame = useCallback(async (difficulty: Difficulty, career: Career) => {
        startNewGameTransition(async () => {
            try {
                const [tradersResult, questsResult] = await Promise.all([runTraderGeneration(), runQuestGeneration()]);
                
                const careerData = CAREER_DATA.find(c => c.id === career);
                if (!careerData) throw new Error("Invalid career selected");

                let newPlayerStats = {
                    ...initialGameState.playerStats,
                    career,
                    fleet: careerData.startingFleet,
                    netWorth: careerData.startingNetWorth,
                    inspiration: 0,
                    influence: careerData.startingInfluence || 0,
                    tradeContracts: [],
                    taxiMissions: [],
                    warehouses: [],
                    militaryMissions: [],
                    usedPromoCodes: [],
                }

                let basePlayerStats = syncActiveShipStats(newPlayerStats as PlayerStats);
                basePlayerStats.cargo = calculateCurrentCargo(initialGameState.inventory);
                basePlayerStats.fuel = basePlayerStats.maxFuel;
                basePlayerStats.shipHealth = basePlayerStats.maxShipHealth;
    
                const playerEntry = { trader: basePlayerStats.name, netWorth: basePlayerStats.netWorth, fleetSize: basePlayerStats.fleet.length, bio: basePlayerStats.bio, rank: 0 };
                const newLeaderboardWithBios = tradersResult.traders.map(trader => ({ ...trader, rank: 0 }));
                const sortedLeaderboard = [...newLeaderboardWithBios, playerEntry].sort((a, b) => b.netWorth - a.netWorth).map((e, i) => ({ ...e, rank: i + 1 }));
    
                const currentSystem = SYSTEMS.find(s => s.name === initialGameState.currentSystem)!;
                const marketItems = calculateMarketDataForSystem(currentSystem);
    
                const newGameState: GameState = {
                    ...(initialGameState as GameState),
                    playerStats: basePlayerStats,
                    marketItems,
                    leaderboard: sortedLeaderboard,
                    quests: questsResult.quests,
                    systems: SYSTEMS, routes: ROUTES, crew: [],
                    difficulty: difficulty,
                    isGameOver: false,
                };
    
                setGameState(newGameState);
                toast({ title: "New Game Started", description: `Your career as a ${career} begins on ${difficulty} difficulty!`, duration: 5000 });
            } catch(e) {
                console.error("Failed to generate new game state", e);
                toast({ title: "Error Generating New Game", description: "Could not generate game data. Please try again later.", variant: "destructive" });
            }
        });
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
                if (savedProgress.isGameOver) {
                    // If the saved state is a game over, force a new game setup
                    localStorage.removeItem('heggieGameState');
                    setGameState(null);
                    return;
                }
                const currentSystem = SYSTEMS.find(s => s.name === savedProgress.currentSystem) || SYSTEMS[0];
                const currentPlanetName = savedProgress.currentPlanet && currentSystem.planets.find(p => p.name === savedProgress.currentPlanet) ? savedProgress.currentPlanet : currentSystem.planets[0].name;

                let mergedPlayerStats = { ...initialGameState.playerStats, ...savedProgress.playerStats, casino: { ...initialCasinoState, ...(savedProgress.playerStats.casino || {}) }, insurance: { ...initialInsuranceState, ...(savedProgress.playerStats.insurance || {}) }, usedPromoCodes: savedProgress.playerStats.usedPromoCodes || [] };
                
                // --- MIGRATION LOGIC ---
                if (mergedPlayerStats.fleet && Array.isArray(mergedPlayerStats.fleet)) {
                    mergedPlayerStats.fleet = mergedPlayerStats.fleet.map((ship: PlayerShip) => {
                        const hullLevel = ship.hullLevel || 1;
                        const maxHealth = hullUpgrades[hullLevel - 1]?.health || 100;
                        // If health is missing or null, set it to max health. Otherwise, keep existing health.
                        const currentHealth = (ship.health === undefined || ship.health === null) ? maxHealth : ship.health;

                        return {
                            ...ship,
                            hullLevel: hullLevel,
                            health: currentHealth,
                            status: ship.status || 'operational',
                        };
                    });
                }
                // --- END MIGRATION ---

                mergedPlayerStats.inventory = savedProgress.inventory || initialGameState.inventory;
                mergedPlayerStats = syncActiveShipStats(mergedPlayerStats as PlayerStats);
                mergedPlayerStats.cargo = calculateCurrentCargo(mergedPlayerStats.inventory);

                setGameState({
                    ...(initialGameState as GameState), systems: SYSTEMS, routes: ROUTES, ...savedProgress,
                    playerStats: mergedPlayerStats,
                    currentPlanet: currentPlanetName,
                    marketItems: calculateMarketDataForSystem(currentSystem),
                    crew: savedProgress.crew || [],
                    difficulty: savedProgress.difficulty || 'Medium',
                });
                setTimeout(() => toast({ title: "Game Loaded", description: "Continuing your spacefaring journey." }), 0);
            } catch (error) {
                console.error("Failed to parse saved game state, starting fresh:", error);
                 setGameState(null);
            }
        } else {
             setGameState(null);
        }
    }, [calculateMarketDataForSystem, toast]);

     useEffect(() => {
        const financialInterval = setInterval(() => {
            setGameState(prev => {
                if (!prev || prev.isGameOver) return prev;

                let newPlayerStats = { ...prev.playerStats };
                let bankruptcyTriggered = false;
                const now = Date.now();
                let newToast: { variant?: "default" | "destructive", title: string, description: string } | null = null;

                // Loan repayment check (every 5 minutes)
                if (newPlayerStats.loan && now > newPlayerStats.loan.nextDueDate) {
                    const loan = { ...newPlayerStats.loan };
                    newPlayerStats.debt = (newPlayerStats.debt || 0) + loan.repaymentAmount;
                    newPlayerStats.loan.repaymentsMade += 1;
                    
                    if (newPlayerStats.loan.repaymentsMade >= newPlayerStats.loan.totalRepayments) {
                        newPlayerStats.loan = undefined;
                        newToast = { title: "Loan Cleared", description: "Your loan has been cleared, though the final payment was made from debt." };
                    } else {
                        newPlayerStats.loan.nextDueDate = now + 5 * 60 * 1000; // Due in 5 minutes
                        newToast = { variant: "destructive", title: "Loan Payment Missed", description: `Your payment of ${loan.repaymentAmount.toLocaleString()}¢ has been added to your debt.` };
                    }
                }

                // Credit card check (every 10 minutes)
                if (newPlayerStats.creditCard && newPlayerStats.creditCard.dueDate && now > newPlayerStats.creditCard.dueDate) {
                    const cc = newPlayerStats.creditCard;
                    if (cc.balance > 0) {
                        newPlayerStats.debt = (newPlayerStats.debt || 0) + cc.balance;
                        newToast = { variant: "destructive", title: "Credit Card Payment Overdue", description: `Your outstanding balance of ${cc.balance.toLocaleString()}¢ has been moved to your general debt.` };
                    }
                    newPlayerStats.creditCard = undefined; // Card is cancelled
                }

                // Accrue interest on debt
                if (newPlayerStats.debt > 0) {
                    newPlayerStats.debt *= 1.001; // small interest tick every 30s
                }

                // Bankruptcy check
                if (newPlayerStats.debt > 100000) {
                    bankruptcyTriggered = true;
                    newToast = { variant: "destructive", title: "Bankruptcy!", description: "Your overwhelming debt has forced you into bankruptcy. Game Over." };
                }
                
                if (newToast) {
                    setTimeout(() => toast(newToast!), 0);
                }

                if (bankruptcyTriggered) {
                    return { ...prev, isGameOver: true };
                }

                return { ...prev, playerStats: newPlayerStats };
            });
        }, 30000); // Check every 30 seconds

        return () => clearInterval(financialInterval);
    }, [setGameState, toast]);
    
    return { gameState, setGameState, isClient, isGeneratingNewGame, startNewGame };
}
