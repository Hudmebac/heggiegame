
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GameState, InventoryItem, PlayerStats, System, MarketItem, PriceHistory, LeaderboardEntry, Quest, ActiveObjective, CrewMember, ItemCategory, SystemEconomy, ShipForSale, StaticItem, PlayerShip } from '@/lib/types';
import { runTraderGeneration, runQuestGeneration, runMarketSimulation, runAvatarGeneration, runEventGeneration, runPirateScan } from '@/app/actions'; // Assuming these actions are still needed for initial generation
import { STATIC_ITEMS } from '@/lib/items';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades } from '@/lib/upgrades';
import { SYSTEMS, ROUTES } from '@/lib/systems';
import { SHIPS_FOR_SALE } from '@/lib/ships';
import { AVAILABLE_CREW } from '@/lib/crew';
import { bios } from '@/lib/bios';
import { useToast } from '@/hooks/use-toast';
// Assuming these are needed for initial market calculation
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

const THEMES = ['cyberpunk', 'steampunk', 'dieselpunk', 'biopunk', 'solarpunk', 'atompunk']; // Example themes, replace with actual theme constants

function getRandomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}


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

// This function syncs active ship stats to player stats
function syncActiveShipStats(playerStats: PlayerStats): PlayerStats {
    if (!playerStats.fleet || playerStats.fleet.length === 0) {
        return playerStats;
    }

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

    // Preserve current values if they are within new limits
    newStats.cargo = Math.min(newStats.cargo || 0, newStats.maxCargo);
    newStats.shipHealth = Math.min(newStats.shipHealth || 0, newStats.maxShipHealth);
    newStats.fuel = Math.min(newStats.fuel || 0, newStats.maxFuel);


    return newStats;
}


const initialShip: PlayerShip = {
    instanceId: Date.now(),
    shipId: 'shuttle-s',
    name: 'My Shuttle',
    cargoLevel: 1,
    weaponLevel: 1,
    shieldLevel: 1,
    hullLevel: 1,
    fuelLevel: 1,
    sensorLevel: 1,
};

const initialCrew: CrewMember[] = [{ id: 'engineer-1', name: 'Kaelen', role: 'Engineer', salary: 1500, bio: 'An experienced engineer, Kaelen can optimize your ship\'s fuel consumption.' }];


const initialGameState: Omit<GameState, 'marketItems' | 'playerStats' | 'routes' | 'systems' | 'crew' > & { playerStats: Partial<PlayerStats>, routes: [], systems: [], crew: [] } = {
  playerStats: {
    name: 'You',
    bio: 'A mysterious trader with a past yet to be written. The galaxy is full of opportunity, and your story is just beginning.',
    netWorth: 10000,
    avatarUrl: 'https://placehold.co/96x96/1A2942/7DD3FC.png',
    pirateRisk: 0,
    reputation: 0,
    fleet: [initialShip],
    barLevel: 1,
    autoClickerBots: 0,
    establishmentLevel: 0, // Generic level for bar/residence etc, maybe remove later?
    residenceLevel: 1,
    residenceAutoClickerBots: 0,
    residenceEstablishmentLevel: 0,
    commerceLevel: 1,
    commerceAutoClickerBots: 0,
    commerceEstablishmentLevel: 0,
    industryLevel: 1,
    industryAutoClickerBots: 0,
    industryEstablishmentLevel: 0,
    constructionLevel: 1,
    constructionAutoClickerBots: 0,
    constructionEstablishmentLevel: 0,
    recreationLevel: 1,
    recreationAutoClickerBots: 0,
    recreationEstablishmentLevel: 0,
  },
  insurance: true,
  inventory: [{ name: 'Silicon Nuggets (Standard)', owned: 5 }],
  priceHistory: Object.fromEntries(STATIC_ITEMS.map(item => [item.name, [item.basePrice]])),
  leaderboard: [],
  pirateEncounter: null,
  // Initial state should reference static data, not copy large arrays
  // Systems and Routes will be populated from constants on load
  systems: [], // Populated from SYSTEMS constant
  routes: [], // Routes are static for now
  currentSystem: 'Sol',
  currentPlanet: 'Earth',
  // Initial quests and crew will be populated on new game generation
  quests: [],
  activeObjectives: [],
  crew: initialCrew,
};

export function useGameState() {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    // Helper function to calculate market data for a system (used in initial load)
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

    const generateNewGameState = useCallback(async () => {
        let newGameState: GameState | null = null;
        toast({
            title: "Generating New Game...",
            description: "Preparing the galaxy for your adventure.",
            duration: 999999, // Indefinite toast
        });

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

            const basePlayerStats = syncActiveShipStats(initialGameState.playerStats as PlayerStats);
            basePlayerStats.inventory = initialGameState.inventory;
            basePlayerStats.cargo = calculateCurrentCargo(basePlayerStats.inventory);

             const playerEntry = {
                trader: basePlayerStats.name,
                netWorth: basePlayerStats.netWorth,
                fleetSize: basePlayerStats.fleet.length,
                bio: basePlayerStats.bio
            };

            const sortedLeaderboard = [...newLeaderboardWithBios, playerEntry].sort((a, b) => b.netWorth - a.netWorth);

            const currentSystem = SYSTEMS.find(s => s.name === initialGameState.currentSystem) || SYSTEMS[0];
            const marketItems = calculateMarketDataForSystem(currentSystem);

            newGameState = {
                ...initialGameState as GameState,
                playerStats: basePlayerStats,
                marketItems,
                leaderboard: sortedLeaderboard,
                quests: questsResult.quests,
                systems: SYSTEMS, // Populate with static data
                routes: ROUTES, // Populate with static data
                crew: AVAILABLE_CREW, // Populate with static data
            };

            setGameState(newGameState);
            toast({
                title: "New Game Generated",
                description: "Your adventure begins now!",
                duration: 5000,
            });

        } catch(e) {
            console.error("Failed to generate new game state", e);
            toast({
                title: "Error Generating New Game",
                description: "Could not generate game data. Please try again later.",
                variant: "destructive",
            });
        }
    }, [calculateMarketDataForSystem, toast]);

    // Load game state from local storage on mount
    useEffect(() => {
        setIsClient(true);

            if (savedStateJSON) {
                try {
                    const savedProgress = JSON.parse(savedStateJSON);

                    const currentSystemName = savedProgress.currentSystem || baseState.currentSystem;
                    const currentSystem = SYSTEMS.find(s => s.name === currentSystemName) || SYSTEMS[0];

                    let mergedPlayerStats = {
                        ...baseState.playerStats,
                        ...savedProgress.playerStats,
                    };
                     // Ensure inventory exists before calculating cargo
                    mergedPlayerStats.inventory = savedProgress.inventory || baseState.inventory;
                    mergedPlayerStats.cargo = calculateCurrentCargo(mergedPlayerStats.inventory);
                    mergedPlayerStats = syncActiveShipStats(mergedPlayerStats);

                    const currentPlanetName = savedProgress.currentPlanet && currentSystem.planets.find(p => p.name === savedProgress.currentPlanet) ? savedProgress.currentPlanet : currentSystem.planets[0].name;


                    // Merge saved progress with base static data
                    setGameState({
                        ...initialGameState as GameState, // Start with initial state structure
                        systems: SYSTEMS, // Populate with static data
                        routes: ROUTES, // Populate with static data
                        crew: AVAILABLE_CREW, // Populate with static data
                        // Restore dynamic player progress
                        priceHistory: savedProgress.priceHistory || baseState.priceHistory,
                        leaderboard: savedProgress.leaderboard || baseState.leaderboard,
                        currentSystem: currentSystemName,
                        currentPlanet: currentPlanetName,
                        quests: savedProgress.quests || baseState.quests,
                        activeObjectives: savedProgress.activeObjectives || baseState.activeObjectives,
                        crew: savedProgress.crew || baseState.crew,
                        inventory: savedProgress.inventory || initialGameState.inventory,
                        // Recalculate market data for the current location using restored system
                         marketItems: calculateMarketDataForSystem(currentSystem),
                        // Ensure contract history is not excessively long
                         playerStats: {
                            ...mergedPlayerStats,
                             barContract: savedProgress.playerStats?.barContract ? {
                                ...savedProgress.playerStats.barContract,
                                valueHistory: (savedProgress.playerStats.barContract.valueHistory || []).slice(-20)
                            } : undefined,
                            residenceContract: savedProgress.playerStats?.residenceContract ? {
                                ...savedProgress.playerStats.residenceContract,
                                valueHistory: (savedProgress.playerStats.residenceContract.valueHistory || []).slice(-20)
                            } : undefined,
                             commerceContract: savedProgress.playerStats?.commerceContract ? {
                                ...savedProgress.playerStats.commerceContract,
                                valueHistory: (savedProgress.playerStats.commerceContract.valueHistory || []).slice(-20)
                            } : undefined,
                             industryContract: savedProgress.playerStats?.industryContract ? {
                                ...savedProgress.playerStats.industryContract,
                                valueHistory: (savedProgress.playerStats.industryContract.valueHistory || []).slice(-20)
                            } : undefined,
                             constructionContract: savedProgress.playerStats?.constructionContract ? {
                                ...savedProgress.playerStats.constructionContract,
                                valueHistory: (savedProgress.playerStats.constructionContract.valueHistory || []).slice(-20)
                            } : undefined,
                            recreationContract: savedProgress.playerStats?.recreationContract ? {
                                ...savedProgress.playerStats.recreationContract,
                                valueHistory: (savedProgress.playerStats.recreationContract.valueHistory || []).slice(-20)
                            } : undefined,
                         } as PlayerStats // Cast needed because mergedPlayerStats might have extra properties if Partial was used
                    });
                } catch (error) {
                    console.error("Failed to parse saved game state, starting fresh:", error);
                    generateNewGameState();
                }
            } else {
                toast({
                    title: "Welcome!",
                    description: "No saved game found. Starting a new adventure.",
                    duration: 3000,
                });
                generateNewGameState();
            }

        let savedStateJSON;
        try {
            savedStateJSON = localStorage.getItem('heggieGameState');
        } catch (error) {
            console.error("Failed to access local storage, starting fresh:", error);
            toast({
                title: "Local Storage Access Denied",
                description: "Could not access saved game data. Starting a new game.",
                variant: "destructive",
            });
            savedStateJSON = null;
        }

        if (savedStateJSON) {
            try {
                const savedProgress = JSON.parse(savedStateJSON);

                // Basic validation and merging with default state to handle new fields
                const mergedState: GameState = {
                    ...(initialGameState as GameState),
                    systems: SYSTEMS, // Always use static systems data
                    routes: ROUTES, // Always use static routes data
                    crew: AVAILABLE_CREW, // Always use static crew data
                    ...savedProgress, // Override with saved progress
                    playerStats: { // Merge player stats specifically
                        ...(initialGameState.playerStats as PlayerStats),
                        ...savedProgress.playerStats,
                    },
                    // Ensure inventory exists before calculating cargo
                    inventory: savedProgress.inventory || initialGameState.inventory,
                    priceHistory: savedProgress.priceHistory || initialGameState.priceHistory,
                    leaderboard: savedProgress.leaderboard || initialGameState.leaderboard,
                    quests: savedProgress.quests || initialGameState.quests,
                    activeObjectives: savedProgress.activeObjectives || initialGameState.activeObjectives,
                    crew: savedProgress.crew || AVAILABLE_CREW, // Merge crew members, using static as base
                     // Ensure contract history is not excessively long and initialized if missing
                     playerStats: {
                        ...(initialGameState.playerStats as PlayerStats),
                        ...savedProgress.playerStats,
                         barContract: savedProgress.playerStats?.barContract ? {
                            ...savedProgress.playerStats.barContract,
                            valueHistory: (savedProgress.playerStats.barContract.valueHistory || []).slice(-20)
                        } : undefined,
                        residenceContract: savedProgress.playerStats?.residenceContract ? {
                            ...savedProgress.playerStats.residenceContract,
                            valueHistory: (savedProgress.playerStats.residenceContract.valueHistory || []).slice(-20)
                        } : undefined,
                         commerceContract: savedProgress.playerStats?.commerceContract ? {
                            ...savedProgress.playerStats.commerceContract,
                            valueHistory: (savedProgress.playerStats.commerceContract.valueHistory || []).slice(-20)
                        } : undefined,
                         industryContract: savedProgress.playerStats?.industryContract ? {
                            ...savedProgress.playerStats.industryContract,
                            valueHistory: (savedProgress.playerStats.industryContract.valueHistory || []).slice(-20)
                        } : undefined,
                         constructionContract: savedProgress.playerStats?.constructionContract ? {
                            ...savedProgress.playerStats.constructionContract,
                            valueHistory: (savedProgress.playerStats.constructionContract.valueHistory || []).slice(-20)
                        } : undefined,
                        recreationContract: savedProgress.playerStats?.recreationContract ? {
                            ...savedProgress.playerStats.recreationContract,
                            valueHistory: (savedProgress.playerStats.recreationContract.valueHistory || []).slice(-20)
                        } : undefined,
                     } as PlayerStats // Cast needed due to partial initial state
                };

                 // Find the current system after merging
                const currentSystem = mergedState.systems.find(s => s.name === mergedState.currentSystem) || SYSTEMS[0];
                // Recalculate market items based on the loaded system
                 mergedState.marketItems = calculateMarketDataForSystem(currentSystem);
                // Sync active ship stats based on the loaded player stats
                 mergedState.playerStats = syncActiveShipStats(mergedState.playerStats);
                 // Recalculate current cargo based on loaded inventory
                mergedState.playerStats.cargo = calculateCurrentCargo(mergedState.inventory);


                setGameState(mergedState);
                 toast({
                    title: "Game Loaded",
                    description: "Continuing your spacefaring journey.",
                    duration: 3000,
                });

            } catch (error) {
                console.error("Failed to parse saved game state, starting fresh:", error);
                 toast({
                    title: "Saved Game Corrupted",
                    description: "Could not load saved game data. Starting a new game.",
                    variant: "destructive",
                });
                generateNewGameState();
            }
        } else {
            toast({
                title: "Welcome!",
                description: "No saved game found. Starting a new adventure.",
                duration: 3000,
            });
            generateNewGameState();
        }

    }, [calculateMarketDataForSystem, generateNewGameState, toast]); // Add dependencies

    // Save game state to local storage whenever it changes
    useEffect(() => {
        if (isClient && gameState) {
            try {
                // Only save dynamic player progress, not static world data like systems, routes, etc.
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
                // Toast for save failure happens in GameProvider
                 toast({
                    title: "Save Failed",
                    description: "Could not save game progress to local storage.",
                    variant: "destructive",
                });
            }
        }
    }, [gameState, isClient, toast]); // Add toast to dependencies

    return { gameState, setGameState, isClient };
}
    