

'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import type { GameState, InventoryItem, PlayerStats, System, MarketItem, ItemCategory, SystemEconomy, PlayerShip, CasinoState, Difficulty, InsurancePolicies, Loan, CreditCard, Career, TaxiMission, Warehouse, EscortMission, MilitaryMission, DiplomaticMission, FactionId, GameEvent, AssetSnapshot, Stock, Property, PropertyType, Lease, PropertySaleOffer, NpcPropertySale } from '@/lib/types';
import { runTraderGeneration, runQuestGeneration } from '@/app/actions';
import { STATIC_ITEMS } from '@/lib/items';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades, droneUpgrades, powerCoreUpgrades, advancedUpgrades, warehouseUpgrades, passengerComfortUpgrades, passengerSecurityUpgrades, passengerPacksUpgrades } from '@/lib/upgrades';
import { propertyUpgrades } from '@/lib/property-upgrades';
import { SYSTEMS, ROUTES } from '@/lib/systems';
import { SHIPS_FOR_SALE, initialShip } from '@/lib/ships';
import { AVAILABLE_CREW } from '@/lib/crew';
import { CAREER_DATA } from '@/lib/careers';
import { bios } from '@/lib/bios';
import { INITIAL_STOCKS } from '@/lib/stocks';
import { useToast } from '@/hooks/use-toast';
import { calculateCurrentCargo, calculateShipValue, calculateCargoValue, calculatePrice, ECONOMY_MULTIPLIERS, RARITY_SUPPLY_RANGES } from '@/lib/utils';
import pako from 'pako';
import { FACTIONS_DATA } from '@/lib/factions';

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
    properties: [],
    leases: [],
    availableLeases: [],
    activeLeases: [],
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


const logAssetSnapshot = (playerStats: PlayerStats): PlayerStats => {
    const fleetValue = playerStats.fleet.reduce((acc, ship) => acc + calculateShipValue(ship), 0);
    const cargoValue = calculateCargoValue(playerStats.inventory, []); // Pass empty array as market items are not available here
    const businessValue = 
        (playerStats.barContract?.currentMarketValue || 0) +
        (playerStats.residenceContract?.currentMarketValue || 0) +
        (playerStats.commerceContract?.currentMarketValue || 0) +
        (playerStats.industryContract?.currentMarketValue || 0) +
        (playerStats.constructionContract?.currentMarketValue || 0) +
        (playerStats.recreationContract?.currentMarketValue || 0) +
        (playerStats.bankContract?.currentMarketValue || 0);

    const propertyValue = playerStats.properties.reduce((acc, prop) => {
        let value = 0;
        const upgradeKey = `${prop.type.toLowerCase()}Level` as keyof Property;
        const currentLevel = (prop[upgradeKey] as number) || 0;
        const upgradeData = propertyUpgrades[prop.type.toLowerCase() as keyof typeof propertyUpgrades];
        
        if (upgradeData && currentLevel > 0) {
            value += upgradeData.upgrades[currentLevel-1].cost;
        }

        const costMap: Record<PropertyType, number> = {
            'Residential': 250000, 'Commercial': 1000000, 'Industrial': 1750000, 'Recreational': 2250000, 'Military': 5000000,
        };
        value += costMap[prop.type];
        
        return acc + value;
    }, 0);
    
    const realEstateValue = businessValue + propertyValue;

    const sharePortfolioValue = playerStats.portfolio.reduce((acc, holding) => {
        const currentStock = playerStats.stocks.find(s => s.id === holding.id);
        return acc + (currentStock ? currentStock.price * holding.shares : 0);
    }, 0);

    const snapshot: AssetSnapshot = {
        timestamp: Date.now(),
        totalNetWorth: playerStats.netWorth + (playerStats.bankAccount?.balance || 0) + fleetValue + cargoValue + realEstateValue + sharePortfolioValue,
        cash: playerStats.netWorth,
        bankBalance: playerStats.bankAccount?.balance || 0,
        fleetValue,
        cargoValue,
        realEstateValue,
        sharePortfolioValue,
    };

    const newAssetHistory = [...(playerStats.assetHistory || [])];
    const lastSnapshot = newAssetHistory[newAssetHistory.length - 1];
    
    // To prevent rapid-fire snapshots with identical data
    if (!lastSnapshot || snapshot.totalNetWorth !== lastSnapshot.totalNetWorth) {
        newAssetHistory.push(snapshot);
    }
    
    return {
        ...playerStats,
        assetHistory: newAssetHistory.slice(-100), // Keep last 100 snapshots
    };
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
                const rarityRange = RARITY_SUPPLY_RANGES[staticItem.rarity];
                const supply = Math.round((rarityRange.base + Math.random() * rarityRange.range) / economyMultiplier);
                const demand = Math.round((rarityRange.base + Math.random() * rarityRange.range) * economyMultiplier * (Math.random() * 0.4 + 0.8));

                availableItems.push({
                    name: staticItem.name,
                    currentPrice: calculatePrice(staticItem.basePrice, supply, demand, economyMultiplier),
                    supply: Math.max(1, supply),
                    demand: Math.max(1, demand),
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
                        fleet: careerData.startingFleet.map(ship => ({
                            ...ship,
                            passengerComfortLevel: 1,
                            passengerSecurityLevel: 1,
                            passengerPacksLevel: 1,
                        })),
                        netWorth: careerData.startingNetWorth,
                        cashInHandHistory: [careerData.startingNetWorth],
                        inspiration: careerData.id === 'Heggie Contractor' ? 0 : 0,
                        influence: careerData.startingInfluence || 0,
                        tradeContracts: [],
                        taxiMissions: [],
                        warehouses: [],
                        properties: [],
                        activeLeases: [],
                        availableLeases: [],
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

                const currentStardate = formatStardate(new Date());
                const savedStardate = savedProgress.playerStats.stardate;
                const isNewDay = currentStardate !== savedStardate;

                if (isNewDay) {
                    // Reset daily-limited features
                    if(savedProgress.playerStats.casino) {
                        savedProgress.playerStats.casino.dailyLotteryTicketPurchased = false;
                    }
                    savedProgress.playerStats.stardate = currentStardate;
                    toast({ title: "New Stardate", description: `Welcome to Stardate ${currentStardate}. Daily activities have been reset.` });
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
                    properties: savedProgress.playerStats.properties || [],
                    activeLeases: savedProgress.playerStats.activeLeases || [],
                    availableLeases: savedProgress.playerStats.availableLeases || [],
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
                            // Sanitize NaN passenger levels
                            passengerComfortLevel: ship.passengerComfortLevel || 1,
                            passengerSecurityLevel: ship.passengerSecurityLevel || 1,
                            passengerPacksLevel: ship.passengerPacksLevel || 1,
                        };
                    });
                }

                mergedPlayerStats.inventory = savedProgress.inventory || initialGameState.inventory;
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
                let stateChanged = false;
                let bankruptcyTriggered = false;
                const now = Date.now();
                let toastsToFire: { variant?: "default" | "destructive", title: string, description: string }[] = [];
                let eventsToAdd: GameEvent[] = [];
    
                if (newPlayerStats.loan && now > newPlayerStats.loan.nextDueDate) {
                    stateChanged = true;
                    const loan = { ...newPlayerStats.loan };
                    newPlayerStats.debt = (newPlayerStats.debt || 0) + loan.repaymentAmount;
                    newPlayerStats.loan.repaymentsMade += 1;
                    
                    if (newPlayerStats.loan.repaymentsMade >= newPlayerStats.loan.totalRepayments) {
                        newPlayerStats.loan = undefined;
                        toastsToFire.push({ title: "Loan Cleared", description: "Your loan has been cleared, though the final payment was made from debt." });
                    } else {
                        newPlayerStats.loan.nextDueDate = now + 5 * 60 * 1000;
                        toastsToFire.push({ variant: "destructive", title: "Loan Payment Missed", description: `Your payment of ${loan.repaymentAmount.toLocaleString()}¢ has been added to your debt.` });
                    }
                }
    
                if (newPlayerStats.creditCard && newPlayerStats.creditCard.dueDate && now > newPlayerStats.creditCard.dueDate) {
                    stateChanged = true;
                    const cc = newPlayerStats.creditCard;
                    if (cc.balance > 0) {
                        newPlayerStats.debt = (newPlayerStats.debt || 0) + cc.balance;
                        toastsToFire.push({ variant: "destructive", title: "Credit Card Payment Overdue", description: `Your outstanding balance of ${cc.balance.toLocaleString()}¢ has been moved to your general debt.` });
                    }
                    newPlayerStats.creditCard = undefined;
                }
    
                if (newPlayerStats.debt > 100000) {
                    stateChanged = true;
                    bankruptcyTriggered = true;
                    toastsToFire.push({ variant: "destructive", title: "Bankruptcy!", description: "Your overwhelming debt has forced you into bankruptcy. Game Over." });
                }
                
                const newStocks: Stock[] = newPlayerStats.stocks.map(stock => {
                    if (now > (stock.lastUpdated || 0) + (5000 + Math.random() * 10000)) { 
                        stateChanged = true;
                        const microFluctuation = (Math.random() - 0.5) * 0.02; 
                        const newPrice = Math.max(1, Math.round(stock.price * (1 + microFluctuation)));
                        const changePercent = ((newPrice - stock.history[0]) / stock.history[0]) * 100;
                        const newHistory = [...stock.history, newPrice].slice(-50);
                        return { ...stock, price: newPrice, history: newHistory, changePercent, lastUpdated: now };
                    }
                    return stock;
                });
                newPlayerStats.stocks = newStocks;
    
                const lastSnapshot = newPlayerStats.assetHistory[newPlayerStats.assetHistory.length - 1];
                if (!lastSnapshot || now - lastSnapshot.timestamp > 5000) {
                    stateChanged = true;
                    newPlayerStats = logAssetSnapshot(newPlayerStats);
                }

                // Handle property upgrades/purchases
                const updatedProperties = newPlayerStats.properties.map(prop => {
                    if (prop.status === 'Upgrading' && prop.upgradeStartTime && prop.upgradeDuration && now > prop.upgradeStartTime + prop.upgradeDuration) {
                        stateChanged = true;
                        const newProp = { ...prop, status: 'Idle' as const, upgradeStartTime: undefined, upgradeDuration: undefined };
                        if (prop.upgradingComponent === 'Purchase') {
                            const upgradeKey = `${newProp.type.toLowerCase()}Level` as keyof Property;
                            (newProp as any)[upgradeKey] = 1;
                            toastsToFire.push({ title: "Property Acquired!", description: `Your new ${newProp.type} property in ${newProp.systemName} is ready.` });
                        } else {
                            const upgradeKey = `${newProp.type.toLowerCase()}Level` as keyof Property;
                            (newProp as any)[upgradeKey] = ((newProp[upgradeKey] as number) || 0) + 1;
                            toastsToFire.push({ title: "Upgrade Complete!", description: `Your ${newProp.name} has been upgraded.` });
                        }
                        return newProp;
                    }
                    return prop;
                });

                if (stateChanged) {
                    newPlayerStats.properties = updatedProperties;
                }
                
                // Handle lease payments and expirations
                const activeLeases = newPlayerStats.activeLeases || [];
                const newlyCompletedLeases: Lease[] = [];
                let stillActiveLeases: Lease[] = [];

                if(activeLeases.length > 0) {
                    stillActiveLeases = activeLeases.map(lease => {
                         const leaseEndTime = lease.startTime + lease.duration * 3600 * 1000;
                        if (now >= leaseEndTime) {
                            newlyCompletedLeases.push(lease);
                            stateChanged = true;
                            return null;
                        }
    
                        const rentIntervalMs = 2 * 60 * 1000;
                        const timeSinceLastRent = now - (lease.lastRentCollection || lease.startTime);
                        const intervalsToPay = Math.floor(timeSinceLastRent / rentIntervalMs);
                        
                        if (intervalsToPay > 0) {
                            const rentToCollect = intervalsToPay * lease.rent;
                            newPlayerStats.netWorth += rentToCollect;
                            
                            const newReputation = { ...newPlayerStats.factionReputation };
                            FACTIONS_DATA.forEach(faction => {
                                if (faction.id !== 'Independent') {
                                    newReputation[faction.id] = (newReputation[faction.id] || 0) + 0.5 * intervalsToPay;
                                }
                            });
                            newPlayerStats.factionReputation = newReputation;
    
                            eventsToAdd.push({
                                id: `evt_rent_${lease.propertyId}_${now}_${Math.random()}`,
                                timestamp: now,
                                type: 'Lease',
                                description: `Collected ${rentToCollect.toLocaleString()}¢ in rent from ${lease.tenantName}.`,
                                value: rentToCollect,
                                reputationChange: 0.5 * intervalsToPay,
                                isMilestone: false,
                            });
                            
                            lease.lastRentCollection = (lease.lastRentCollection || lease.startTime) + intervalsToPay * rentIntervalMs;
                            stateChanged = true;
                        }
                        return lease;
                    }).filter(Boolean) as Lease[];
    
                    if (newlyCompletedLeases.length > 0) {
                        stateChanged = true;
                        const completedPropertyIds = new Set(newlyCompletedLeases.map(l => l.propertyId));
                        newPlayerStats.properties = newPlayerStats.properties.map(p => 
                            completedPropertyIds.has(p.id) ? { ...p, status: 'Idle' } : p
                        );
                    }
                    newPlayerStats.activeLeases = stillActiveLeases;
                }
    
                if (eventsToAdd.length > 0) {
                    newPlayerStats.events = [...newPlayerStats.events, ...eventsToAdd];
                }
    
                if (toastsToFire.length > 0) {
                    setTimeout(() => toastsToFire.forEach(t => toast(t)), 0);
                }
    
                if (bankruptcyTriggered) {
                    return { ...prev, isGameOver: true };
                }
    
                return stateChanged ? { ...prev, playerStats: newPlayerStats } : prev;
            });
        }, 60000); // Check every minute
    
        return () => clearInterval(financialInterval);
    }, [setGameState, toast]);
    
    return { gameState, setGameState, isClient, isGeneratingNewGame, startNewGame, loadGameStateFromKey, generateShareKey };
}

```
  </change>
  <change>
    <file>/src/app/landlord/page.tsx</file>
    <content><![CDATA[
'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LandPlot, Home, Briefcase, Factory, Ticket, Shield, ChevronsUp, UserPlus, FileText, Loader2, Hourglass, PenSquare, X, Tag } from 'lucide-react';
import type { Property, PropertyType, Lease, PropertySaleOffer, NpcPropertySale } from '@/lib/types';
import { propertyUpgrades } from '@/lib/property-upgrades';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import CooldownTimer from '@/app/components/cooldown-timer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { calculatePropertyValue } from '@/lib/utils';


const propertyTypeConfig: { type: PropertyType; icon: React.ElementType, cost: number }[] = [
    { type: 'Residential', icon: Home, cost: 250000 },
    { type: 'Commercial', icon: Briefcase, cost: 1000000 },
    { type: 'Industrial', icon: Factory, cost: 1750000 },
    { type: 'Recreational', icon: Ticket, cost: 2250000 },
    { type: 'Military', icon: Shield, cost: 5000000 },
];

const UpgradeDialog = ({ property }: { property: Property }) => {
    const { gameState, handleUpgradeProperty } = useGame();
    if (!gameState) return null;
    
    if (property.status !== 'Idle') {
        return <p className="text-sm text-muted-foreground text-center py-4">Upgrades are unavailable while property is leased, for sale, or being upgraded.</p>
    }

    const upgradeKey = `${property.type.toLowerCase()}Level` as keyof Property;
    const upgradeData = propertyUpgrades[property.type.toLowerCase() as keyof typeof propertyUpgrades];
    if (!upgradeData) return null;

    const currentLevel = (property[upgradeKey] as number) || 0;

    return (
        <div className="space-y-2">
            {upgradeData.upgrades.map(upgrade => {
                const isCurrent = upgrade.level === currentLevel;
                const isNext = upgrade.level === currentLevel + 1;
                const cost = upgrade.cost - (upgradeData.upgrades[currentLevel-1]?.cost || 0);
                const canAfford = gameState.playerStats.netWorth >= cost;
                return (
                    <div key={upgrade.level} className="flex justify-between items-center text-sm p-2 rounded-md bg-background/50">
                        <div>
                            <p className={isCurrent ? 'font-bold text-primary' : ''}>Lvl {upgrade.level}: {upgrade.upgrade}</p>
                            <p className="text-xs text-muted-foreground">{upgrade.effect}</p>
                        </div>
                        {isNext && (
                            <Button size="sm" onClick={() => handleUpgradeProperty(property.id, property.type)} disabled={!canAfford}>
                                Upgrade ({cost.toLocaleString()}¢)
                            </Button>
                        )}
                    </div>
                )
            })}
        </div>
    );
};

const ListForSaleDialog = ({ property, onList }: { property: Property, onList: (id: number, price: number) => void }) => {
    const estimatedValue = calculatePropertyValue(property);
    const [askingPrice, setAskingPrice] = useState(estimatedValue);

    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>List Property for Sale</DialogTitle>
                <DialogDescription>
                    List "{property.name}" on the galactic market. You can set your asking price. Offers may come in higher or lower.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <div className="text-sm text-center">Estimated Market Value: <span className="font-mono text-amber-300">{estimatedValue.toLocaleString()}¢</span></div>
                 <div>
                    <Label htmlFor="asking-price">Asking Price</Label>
                    <Input id="asking-price" type="number" value={askingPrice} onChange={(e) => setAskingPrice(Number(e.target.value))} />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <DialogClose asChild><Button onClick={() => onList(property.id, askingPrice)}>List Property</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}


const PropertyCard = ({ property, onRenameClick, onListClick }: { property: Property, onRenameClick: (property: Property) => void, onListClick: (property: Property) => void }) => {
    const { gameState } = useGame();
    const Icon = propertyTypeConfig.find(p => p.type === property.type)?.icon || LandPlot;
    
    const upgradeKey = `${property.type.toLowerCase()}Level` as keyof Property;
    const currentLevel = (property[upgradeKey] as number) || 0;
    const upgradeData = propertyUpgrades[property.type.toLowerCase() as keyof typeof propertyUpgrades];
    const currentUpgradeName = upgradeData?.upgrades[currentLevel - 1]?.upgrade || 'Base';

    const activeLease = gameState?.playerStats.activeLeases.find(l => l.propertyId === property.id);
    const leaseProgress = activeLease ? (Date.now() - activeLease.startTime) / (activeLease.duration * 3600 * 1000) * 100 : 0;
    
    let statusBadge: React.ReactNode;
    if (property.status === 'ForSale') {
        statusBadge = <Badge variant="outline" className="text-amber-400 border-amber-500/30">For Sale</Badge>
    } else if (property.status === 'Upgrading') {
        statusBadge = <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">Upgrading</Badge>
    } else if (activeLease) {
        statusBadge = <Badge variant="outline" className="text-green-400 border-green-500/30">Leased</Badge>
    } else {
        statusBadge = <Badge variant="outline">Available</Badge>
    }

    return (
         <Card className="bg-card/50 flex flex-col">
            <CardHeader>
                <CardTitle className="text-base flex justify-between items-start">
                    <span className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {property.name}
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onRenameClick(property)}>
                            <PenSquare className="h-3 w-3" />
                        </Button>
                    </span>
                    {statusBadge}
                </CardTitle>
                <CardDescription>
                    Level {currentLevel}: {currentUpgradeName}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                {property.status === 'Upgrading' && property.upgradeStartTime && property.upgradeDuration ? (
                    <div className="space-y-2">
                        <p className="text-xs text-cyan-400 text-center">Upgrading: {property.upgradingComponent}</p>
                        <Progress value={ (1 - ((property.upgradeStartTime + property.upgradeDuration) - Date.now()) / property.upgradeDuration) * 100 } indicatorClassName="bg-cyan-400" />
                        <p className="text-xs text-muted-foreground text-center">
                            <CooldownTimer expiry={property.upgradeStartTime + property.upgradeDuration} onCompleteText="Finalising Upgrades"/>
                        </p>
                    </div>
                ) : activeLease ? (
                     <div className="space-y-2">
                        <p className="text-xs text-green-400 text-center">Tenant: {activeLease.tenantName}</p>
                        <Progress value={leaseProgress} indicatorClassName="bg-green-400" />
                        <p className="text-xs text-muted-foreground text-center">
                           Lease ends in: <CooldownTimer expiry={activeLease.startTime + activeLease.duration * 3600 * 1000} />
                        </p>
                    </div>
                ) : (
                     <Accordion type="single" collapsible disabled={property.status !== 'Idle'}>
                        <AccordionItem value="upgrades" className="border-b-0">
                            <AccordionTrigger>Show Upgrades</AccordionTrigger>
                            <AccordionContent>
                                <UpgradeDialog property={property} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
            </CardContent>
            {property.status === 'Idle' && (
                <CardContent>
                    <Button className="w-full" size="sm" variant="secondary" onClick={() => onListClick(property)}>
                        <Tag className="mr-2 h-4 w-4"/> List for Sale
                    </Button>
                </CardContent>
            )}
        </Card>
    )
}

const AssignLeaseDialog = ({ lease, properties, onAssign, isOpen, onOpenChange }: { lease: Lease, properties: Property[], onAssign: (propertyId: number) => void, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Lease: {lease.tenantName}</DialogTitle>
                    <DialogDescription>Select an available and suitable property to assign this lease to.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Label htmlFor="property-select">Available Properties</Label>
                    <Select onValueChange={setSelectedPropertyId}>
                        <SelectTrigger id="property-select">
                            <SelectValue placeholder="Select a property..." />
                        </SelectTrigger>
                        <SelectContent>
                            {properties.map(prop => (
                                <SelectItem key={prop.id} value={String(prop.id)}>
                                    {prop.name} (Lvl {prop[`${prop.type.toLowerCase()}Level` as keyof Property] as number}) - {prop.systemName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <DialogClose asChild><Button onClick={() => onAssign(Number(selectedPropertyId))} disabled={!selectedPropertyId}>Confirm Lease</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const RenamePropertyDialog = ({ property, onRename, isOpen, onOpenChange }: { property: Property | null, onRename: (id: number, newName: string) => void, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const [name, setName] = useState(property?.name || '');

    useEffect(() => {
        if(property) setName(property.name);
    }, [property]);

    if(!property) return null;

    const handleSave = () => {
        if(name.trim()) {
            onRename(property.id, name.trim());
            onOpenChange(false);
        }
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename Property</DialogTitle>
                    <DialogDescription>Give your property a unique name.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="property-name">New Property Name</Label>
                    <Input id="property-name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>Save Name</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function LandlordPage() {
    const { gameState, handlePurchaseProperty, handleFindTenants, handleAssignLease, isGeneratingLeases, handleRenameProperty, handleIgnoreLease, handleListPropertyForSale, handleAcceptPropertyOffer, handleDeclinePropertyOffer, handleScoutForListings, isGeneratingListings, handlePurchaseNpcProperty } = useGame();
    const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
    const [renamingProperty, setRenamingProperty] = useState<Property | null>(null);
    const [listingProperty, setListingProperty] = useState<Property | null>(null);

    if (!gameState) return null;

    const { playerStats } = gameState;
    const { properties, availableLeases, activeLeases, propertySaleOffers, npcPropertySales } = playerStats;
    
    const idleProperties = properties.filter(p => p.status === 'Idle' && !activeLeases.some(l => l.propertyId === p.id));
    
    const getAssignableProperties = (lease: Lease) => {
        return idleProperties.filter(p => p.type === lease.propertyType && p[`${p.type.toLowerCase()}Level` as keyof Property] >= lease.requiredLevel);
    };
    
    const leaseCooldown = 60 * 1000;
    const lastLeaseGeneration = playerStats.lastLeaseGeneration || 0;
    const isLeaseOnCooldown = Date.now() < lastLeaseGeneration + leaseCooldown;
    const leaseCooldownExpiry = lastLeaseGeneration + leaseCooldown;
    
    const listingCooldown = 20 * 60 * 1000;
    const lastListingGeneration = playerStats.lastNpcPropertyGeneration || 0;
    const isListingOnCooldown = Date.now() < lastListingGeneration + listingCooldown;
    const listingCooldownExpiry = lastListingGeneration + listingCooldown;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <LandPlot className="text-primary" />
                        Galactic Real Estate
                    </CardTitle>
                    <CardDescription>
                        As a Landlord, your empire is built on property. Acquire, upgrade, and lease properties across the galaxy to generate a steady stream of income and influence.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Acquire New Property</CardTitle>
                    <CardDescription>Purchase new properties in the current system. Each purchase takes 10 seconds to finalize.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {propertyTypeConfig.map(({ type, icon: Icon, cost }) => (
                        <Button key={type} className="flex-col h-24" onClick={() => handlePurchaseProperty(type)} disabled={playerStats.netWorth < cost}>
                            <Icon className="h-8 w-8 mb-2" />
                            Buy {type}
                            <span className="text-xs font-mono text-primary-foreground/80">({cost.toLocaleString()}¢)</span>
                        </Button>
                    ))}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Property Market</CardTitle>
                    <CardDescription>Scout for properties being sold by other entities in this system.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Button onClick={handleScoutForListings} disabled={isGeneratingListings || isListingOnCooldown}>
                        {isGeneratingListings ? <Loader2 className="animate-spin mr-2"/> : <UserPlus className="mr-2"/>}
                        {isListingOnCooldown ? <CooldownTimer expiry={listingCooldownExpiry} /> : "Scout for Listings"}
                    </Button>
                    {(npcPropertySales || []).length > 0 && (
                        <Accordion type="single" collapsible defaultValue="npc-listings" className="w-full">
                           <AccordionItem value="npc-listings">
                               <AccordionTrigger>View {npcPropertySales?.length} Available Listings</AccordionTrigger>
                               <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                   {(npcPropertySales || []).map(prop => (
                                       <div key={prop.id} className="p-4 rounded-md border bg-background/50">
                                            <p className="font-semibold text-sm">{prop.name} ({prop.type})</p>
                                            <p className="text-xs text-muted-foreground">Lvl {prop.level} - {prop.systemName}</p>
                                            <p className="text-xs text-muted-foreground mt-2 italic">"{prop.description}"</p>
                                            <div className="flex justify-between items-center mt-2 pt-2 border-t">
                                                <span className="text-sm font-mono text-amber-300">{prop.askingPrice.toLocaleString()}¢</span>
                                                <Button size="sm" onClick={() => handlePurchaseNpcProperty(prop)} disabled={playerStats.netWorth < prop.askingPrice}>Purchase</Button>
                                            </div>
                                       </div>
                                   ))}
                               </AccordionContent>
                           </AccordionItem>
                        </Accordion>
                    )}
                </CardContent>
            </Card>

            {(propertySaleOffers || []).length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Incoming Offers</CardTitle>
                        <CardDescription>Review and respond to incoming offers for your listed properties.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(propertySaleOffers || []).map(offer => {
                            const property = properties.find(p => p.id === offer.propertyId);
                            if (!property) return null;
                            const valueDiff = offer.offerAmount - offer.askingPrice;
                            return (
                                <div key={offer.offerId} className="p-4 rounded-md border bg-background/50">
                                    <p className="font-semibold text-sm">{property.name} ({property.type})</p>
                                    <p className="text-xs text-muted-foreground">Offer from: <span className="font-semibold text-primary">{offer.buyerName}</span></p>
                                    <p className="text-xs text-muted-foreground mt-2 italic">"{offer.narrative}"</p>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t">
                                        <div className="text-sm">
                                            Offer: <span className="font-mono text-amber-300">{offer.offerAmount.toLocaleString()}¢</span>
                                            <span className={cn("text-xs font-mono ml-2", valueDiff > 0 ? "text-green-400" : valueDiff < 0 ? "text-destructive" : "text-muted-foreground")}>
                                                ({valueDiff >= 0 ? '+' : ''}{valueDiff.toLocaleString()}¢)
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleAcceptPropertyOffer(offer.offerId)}>Accept</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDeclinePropertyOffer(offer.offerId)}>Decline</Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Your Portfolio</CardTitle>
                    <CardDescription>An overview of all properties you own, grouped by type.</CardDescription>
                </CardHeader>
                <CardContent>
                    {properties.length > 0 ? (
                        <Accordion type="multiple" defaultValue={propertyTypeConfig.map(p => p.type)}>
                           {propertyTypeConfig.map(({ type, icon: Icon }) => {
                               const propertiesOfType = properties.filter(p => p.type === type);
                               if (propertiesOfType.length === 0) return null;
                               return (
                                   <AccordionItem value={type} key={type}>
                                       <AccordionTrigger>
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-5 w-5 text-primary" />
                                                <span className="font-semibold">{type} Properties ({propertiesOfType.length})</span>
                                            </div>
                                       </AccordionTrigger>
                                       <AccordionContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                                           {propertiesOfType.map(prop => <PropertyCard key={prop.id} property={prop} onRenameClick={setRenamingProperty} onListClick={setListingProperty} />)}
                                       </AccordionContent>
                                   </AccordionItem>
                               )
                           })}
                        </Accordion>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">You do not own any properties. Purchase one to get started.</p>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <FileText className="text-primary"/>
                        Lease Management
                    </CardTitle>
                    <CardDescription>Find tenants and manage your leases. New proposals are generated based on your property portfolio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Button onClick={handleFindTenants} disabled={isGeneratingLeases || idleProperties.length === 0 || isLeaseOnCooldown}>
                        {isGeneratingLeases ? <Loader2 className="animate-spin mr-2"/> : <UserPlus className="mr-2"/>}
                        {isLeaseOnCooldown ? <CooldownTimer expiry={leaseCooldownExpiry} /> : (idleProperties.length === 0 ? "No Available Properties" : "Find Tenants")}
                    </Button>

                    <Accordion type="multiple" defaultValue={['active-leases']}>
                        {(activeLeases && activeLeases.length > 0) && (
                            <AccordionItem value="active-leases">
                                <AccordionTrigger>Active Leases ({activeLeases.length})</AccordionTrigger>
                                <AccordionContent className="space-y-2 pt-4">
                                    {activeLeases.map(lease => {
                                        const property = properties.find(p => p.id === lease.propertyId);
                                        return (
                                        <div key={`${lease.id}-${lease.propertyId}`} className="p-3 rounded-md border bg-background/50">
                                            <p className="font-semibold text-sm">{lease.tenantName} @ {property?.name}</p>
                                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                <span>Rent: {lease.rent.toLocaleString()}¢ / 2 mins</span>
                                                <span className="flex items-center gap-1"><Hourglass className="h-3 w-3"/> <CooldownTimer expiry={lease.startTime + lease.duration * 3600 * 1000} /></span>
                                            </div>
                                        </div>
                                    )})}
                                </AccordionContent>
                            </AccordionItem>
                        )}
                        
                        {(availableLeases && availableLeases.length > 0) && (
                           <AccordionItem value="available-leases">
                                <AccordionTrigger>Available Lease Proposals ({availableLeases.length})</AccordionTrigger>
                                <AccordionContent className="space-y-2 pt-4">
                                     {availableLeases.map(lease => {
                                        const assignableProps = getAssignableProperties(lease);
                                        return (
                                        <div key={lease.id} className="p-3 rounded-md border bg-background/50 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-sm">{lease.tenantName}</p>
                                                <p className="text-xs text-muted-foreground">{lease.description}</p>
                                                <p className="text-xs mt-1">Requires: Lvl {lease.requiredLevel}+ {lease.propertyType} | Rent: {lease.rent.toLocaleString()}¢/2mins | Term: {lease.duration}h</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" onClick={() => setSelectedLease(lease)} disabled={assignableProps.length === 0}>
                                                    Assign
                                                </Button>
                                                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleIgnoreLease(lease.id)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )})}
                                </AccordionContent>
                            </AccordionItem>
                        )}
                    </Accordion>
                </CardContent>
            </Card>

            {selectedLease && (
                <AssignLeaseDialog 
                    isOpen={!!selectedLease}
                    onOpenChange={() => setSelectedLease(null)}
                    lease={selectedLease}
                    properties={getAssignableProperties(selectedLease)}
                    onAssign={(propertyId) => handleAssignLease(selectedLease.id, propertyId)}
                />
            )}
            
            <RenamePropertyDialog
                isOpen={!!renamingProperty}
                onOpenChange={() => setRenamingProperty(null)}
                property={renamingProperty}
                onRename={handleRenameProperty}
            />
            {listingProperty && (
                <Dialog open={!!listingProperty} onOpenChange={() => setListingProperty(null)}>
                    <ListForSaleDialog 
                        property={listingProperty}
                        onList={(id, price) => {
                            handleListPropertyForSale(id, price);
                            setListingProperty(null);
                        }}
                    />
                </Dialog>
            )}
        </div>
    );
}
