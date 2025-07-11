
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import type { GameState, InventoryItem, PlayerStats, System, MarketItem, ItemCategory, SystemEconomy, PlayerShip, CasinoState, Difficulty, InsurancePolicies, Loan, CreditCard, Career, TaxiMission, Warehouse, EscortMission, MilitaryMission, DiplomaticMission, FactionId, GameEvent, AssetSnapshot, Stock } from '@/lib/types';
import { runTraderGeneration, runQuestGeneration } from '@/app/actions';
import { STATIC_ITEMS } from '@/lib/items';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades, droneUpgrades, powerCoreUpgrades, advancedUpgrades } from '@/lib/upgrades';
import { SYSTEMS, ROUTES } from '@/lib/systems';
import { SHIPS_FOR_SALE, initialShip } from '@/lib/ships';
import { AVAILABLE_CREW } from '@/lib/crew';
import { CAREER_DATA } from '@/lib/careers';
import { bios } from '@/lib/bios';
import { INITIAL_STOCKS } from '@/lib/stocks';
import { useToast } from '@/hooks/use-toast';
import { calculateCurrentCargo, calculateShipValue, calculateCargoValue, calculatePrice, ECONOMY_MULTIPLIERS, syncActiveShipStats } from '@/lib/utils';
import pako from 'pako';

const formatStardate = (date: Date): string => {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `45${year}.${month}.${day}`;
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
    stardate: formatStardate(new Date()),
    avatarUrl: '/images/avatars/avatar_01.png',
    faction: 'Independent',
    factionReputation: {
        'Independent': 100,
        'Federation of Sol': 0,
        'Corporate Hegemony': 0,
        'Veritas Concord': 0,
        'Frontier Alliance': 0,
        'Independent Miners Guild': 0,
    },
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
    events: [],
    assetHistory: [],
    cargoValueHistory: [0],
    cashInHandHistory: [10000],
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
    diplomaticMissions: [],
    usedPromoCodes: [],
    negotiationCooldowns: {},
    lastFacebookShare: 0,
    lastWhatsappShare: 0,
    portfolio: [],
    stocks: INITIAL_STOCKS.map(s => ({ ...s, lastUpdated: 0 })),
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
    const [isSaving, setIsSaving] = useState(false);


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
        return new Promise<void>((resolve, reject) => {
            startNewGameTransition(async () => {
                try {
                    const [tradersResult, questsResult] = await Promise.all([runTraderGeneration(), runQuestGeneration()]);
                    
                    const careerData = CAREER_DATA.find(c => c.id === career);
                    if (!careerData) throw new Error("Invalid career selected");

                    let newPlayerStats = {
                        ...initialGameState.playerStats,
                        career,
                        stardate: formatStardate(new Date()),
                        faction: 'Independent',
                        factionReputation: { ...initialGameState.playerStats.factionReputation },
                        fleet: careerData.startingFleet,
                        netWorth: careerData.startingNetWorth,
                        cashInHandHistory: [careerData.startingNetWorth],
                        inspiration: careerData.id === 'Heggie Contractor' ? 0 : 0,
                        influence: careerData.startingInfluence || 0,
                        tradeContracts: [],
                        taxiMissions: [],
                        warehouses: [],
                        militaryMissions: [],
                        diplomaticMissions: [],
                        usedPromoCodes: [],
                        negotiationCooldowns: {},
                        portfolio: [],
                        stocks: INITIAL_STOCKS.map(s => ({ ...s, lastUpdated: 0 })),
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
                    resolve();
                } catch(e) {
                    console.error("Failed to generate new game state", e);
                    toast({ title: "Error Generating New Game", description: "Could not generate game data. Please try again later.", variant: "destructive" });
                    reject(e);
                }
            });
        });
    }, [calculateMarketDataForSystem, toast]);

    const loadGameStateFromKey = useCallback((key: string): boolean => {
        try {
            const binaryString = atob(key);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const decodedString = pako.inflate(bytes, { to: 'string' });
            const newState = JSON.parse(decodedString);
            
            // Basic validation
            if (newState && newState.playerStats && newState.currentSystem) {
                localStorage.setItem('heggieGameState', decodedString);
                setGameState(newState);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to load state from key", error);
            return false;
        }
    }, [setGameState]);

    const generateShareKey = useCallback((): string | null => {
        if (!gameState) return null;
        try {
            const jsonString = JSON.stringify(gameState);
            const compressed = pako.deflate(jsonString);
            
            let binaryString = '';
            const len = compressed.byteLength;
            for (let i = 0; i < len; i++) {
                binaryString += String.fromCharCode(compressed[i]);
            }
            const key = btoa(binaryString);
            return key;
        } catch (error) {
            console.error("Failed to generate share key", error);
            return null;
        }
    }, [gameState]);


    // Load game state on mount
    useEffect(() => {
        setIsClient(true);
        // Only run loading logic if we are not on the special /load page
        if (window.location.pathname.startsWith('/load/')) {
            return;
        }

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
                    localStorage.removeItem('heggieGameState');
                    setGameState(null);
                    return;
                }
                const currentSystem = SYSTEMS.find(s => s.name === savedProgress.currentSystem) || SYSTEMS[0];
                const currentPlanetName = savedProgress.currentPlanet && currentSystem.planets.find(p => p.name === savedProgress.currentPlanet) ? savedProgress.currentPlanet : currentSystem.planets[0].name;

                let mergedPlayerStats = { 
                    ...initialGameState.playerStats, 
                    ...savedProgress.playerStats, 
                    stardate: savedProgress.playerStats.stardate || formatStardate(new Date()),
                    casino: { ...initialCasinoState, ...(savedProgress.playerStats.casino || {}) }, 
                    insurance: { ...initialInsuranceState, ...(savedProgress.playerStats.insurance || {}) }, 
                    usedPromoCodes: savedProgress.playerStats.usedPromoCodes || [], 
                    negotiationCooldowns: savedProgress.playerStats.negotiationCooldowns || {},
                    lastFacebookShare: savedProgress.playerStats.lastFacebookShare || 0,
                    lastWhatsappShare: savedProgress.playerStats.lastWhatsappShare || 0,
                    faction: savedProgress.playerStats.faction || 'Independent',
                    factionReputation: savedProgress.playerStats.factionReputation || initialGameState.playerStats.factionReputation,
                    pirateEncounter: null, // Don't persist pirate encounters
                    events: savedProgress.playerStats.events || [],
                    assetHistory: savedProgress.playerStats.assetHistory || [],
                    cashInHandHistory: savedProgress.playerStats.cashInHandHistory || [savedProgress.playerStats.netWorth],
                    portfolio: savedProgress.playerStats.portfolio || [],
                    stocks: savedProgress.playerStats.stocks || INITIAL_STOCKS.map(s => ({ ...s, lastUpdated: 0 })),
                };
                
                if (mergedPlayerStats.fleet && Array.isArray(mergedPlayerStats.fleet)) {
                    mergedPlayerStats.fleet = mergedPlayerStats.fleet.map((ship: PlayerShip) => {
                        const hullLevel = ship.hullLevel || 1;
                        const maxHealth = hullUpgrades[hullLevel - 1]?.health || 100;
                        const currentHealth = (ship.health === undefined || ship.health === null) ? maxHealth : ship.health;

                        return {
                            ...ship,
                            hullLevel: hullLevel,
                            health: currentHealth,
                            status: ship.status || 'operational',
                        };
                    });
                }

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

    // Save game state whenever it changes (with a slight delay)
    useEffect(() => {
        if (!gameState || !isClient || isGeneratingNewGame) return;

        setIsSaving(true);
        const handler = setTimeout(() => {
            try {
                // Create a savable version of the state without transient properties
                const stateToSave = {
                    ...gameState,
                    playerStats: {
                        ...gameState.playerStats,
                        pirateEncounter: null, // Ensure pirate encounters are not saved
                    },
                };
                localStorage.setItem('heggieGameState', JSON.stringify(stateToSave));
            } catch (error) {
                console.error("Failed to save game state to local storage:", error);
            } finally {
                setIsSaving(false);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [gameState, isClient, isGeneratingNewGame]);

    useEffect(() => {
        const financialInterval = setInterval(() => {
            setGameState(prev => {
                if (!prev || prev.isGameOver) return prev;

                let newPlayerStats = { ...prev.playerStats };
                let bankruptcyTriggered = false;
                const now = Date.now();
                let newToast: { variant?: "default" | "destructive", title: string, description: string } | null = null;

                if (newPlayerStats.loan && now > newPlayerStats.loan.nextDueDate) {
                    const loan = { ...newPlayerStats.loan };
                    newPlayerStats.debt = (newPlayerStats.debt || 0) + loan.repaymentAmount;
                    newPlayerStats.loan.repaymentsMade += 1;
                    
                    if (newPlayerStats.loan.repaymentsMade >= newPlayerStats.loan.totalRepayments) {
                        newPlayerStats.loan = undefined;
                        newToast = { title: "Loan Cleared", description: "Your loan has been cleared, though the final payment was made from debt." };
                    } else {
                        newPlayerStats.loan.nextDueDate = now + 5 * 60 * 1000;
                        newToast = { variant: "destructive", title: "Loan Payment Missed", description: `Your payment of ${loan.repaymentAmount.toLocaleString()}¢ has been added to your debt.` };
                    }
                }

                if (newPlayerStats.creditCard && newPlayerStats.creditCard.dueDate && now > newPlayerStats.creditCard.dueDate) {
                    const cc = newPlayerStats.creditCard;
                    if (cc.balance > 0) {
                        newPlayerStats.debt = (newPlayerStats.debt || 0) + cc.balance;
                        newToast = { variant: "destructive", title: "Credit Card Payment Overdue", description: `Your outstanding balance of ${cc.balance.toLocaleString()}¢ has been moved to your general debt.` };
                    }
                    newPlayerStats.creditCard = undefined;
                }

                if (newPlayerStats.debt > 0) {
                    newPlayerStats.debt *= 1.001;
                }

                if (newPlayerStats.debt > 100000) {
                    bankruptcyTriggered = true;
                    newToast = { variant: "destructive", title: "Bankruptcy!", description: "Your overwhelming debt has forced you into bankruptcy. Game Over." };
                }
                
                // Stock market updates
                const newStocks: Stock[] = newPlayerStats.stocks.map(stock => {
                    if (now > (stock.lastUpdated || 0) + (5000 + Math.random() * 3595000)) { // 5s to 1hr
                        const microFluctuation = (Math.random() - 0.5) * 0.01; // -0.5% to +0.5%
                        const newPrice = Math.max(1, Math.round(stock.price * (1 + microFluctuation)));
                        const changePercent = ((newPrice - stock.history[0]) / stock.history[0]) * 100;
                        const newHistory = [...stock.history, newPrice].slice(-50);
                        return { ...stock, price: newPrice, history: newHistory, changePercent, lastUpdated: now };
                    }
                    return stock;
                });
                newPlayerStats.stocks = newStocks;
                
                if (newToast) {
                    setTimeout(() => toast(newToast!), 0);
                }

                if (bankruptcyTriggered) {
                    return { ...prev, isGameOver: true };
                }

                return { ...prev, playerStats: newPlayerStats };
            });
        }, 5000); // Check every 5 seconds

        return () => clearInterval(financialInterval);
    }, [setGameState, toast]);
    
    return { gameState, setGameState, isClient, isGeneratingNewGame, startNewGame, loadGameStateFromKey, generateShareKey };
}
