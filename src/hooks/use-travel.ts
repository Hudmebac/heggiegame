'use client';

import { useState, useTransition, useCallback } from 'react';
import type { GameState, System, Route, Pirate, PlayerStats, ActiveObjective } from '@/lib/types';
import { runMarketSimulation, resolveEncounter, runPirateScan, runEventGeneration } from '@/app/actions';
import { SYSTEMS, ROUTES } from '@/lib/systems';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, AlertTriangle, Factory, Wheat, Cpu, Hammer, Recycle } from 'lucide-react';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades } from '@/lib/upgrades'; // Needed for syncActiveShipStats if it moves
import { STATIC_ITEMS } from '@/lib/items'; // Needed for market calculation

// Assume calculateCurrentCargo is available or imported if moved
// Assume syncActiveShipStats is available or imported if moved
// Assume generateRandomPirate is available or imported if moved
// Assume updateObjectiveProgress is available or imported if moved
// Assume barThemes, residenceThemes, etc. are available or imported for contract value updates

const pirateNames = ['Dread Captain "Scar" Ironheart', 'Admiral "Voidgazer" Kael', 'Captain "Mad" Mel', 'Commander "Hex" Stryker'];
const shipTypes = ['Marauder-class Corvette', 'Reaper-class Frigate', 'Void-reaver Battleship', 'Shadow-class Interceptor'];
const threatLevels: Pirate['threatLevel'][] = ['Low', 'Medium', 'High', 'Critical'];

function generateRandomPirate(hasNavigator: boolean): Pirate {
    const weightedThreats: Pirate['threatLevel'][] = hasNavigator
        ? ['Low', 'Low', 'Low', 'Medium', 'Medium', 'Medium', 'High', 'High', 'Critical'] // Skewed probabilities with Navigator
        : ['Low', 'Medium', 'High', 'Critical']; // Even probabilities

    const threat = weightedThreats[Math.floor(Math.random() * weightedThreats.length)];

    return {
        name: pirateNames[Math.floor(Math.random() * pirateLevels.length)],
        shipType: shipTypes[Math.floor(Math.random() * shipTypes.length)],
        threatLevel: threat,
    };
}

const ECONOMY_MULTIPLIERS: Record<ItemCategory, Record<SystemEconomy, number>> = {
    'Biological': { 'Agricultural': 0.7, 'High-Tech': 1.2, 'Industrial': 1.3, 'Extraction': 1.1, 'Refinery': 1.2 },
    'Industrial': { 'Agricultural': 1.3, 'High-Tech': 1.1, 'Industrial': 0.7, 'Extraction': 1.2, 'Refinery': 0.8 },
    'Pleasure': { 'Agricultural': 1.1, 'High-Tech': 1.2, 'Industrial': 1.1, 'Extraction': 1.0, 'Refinery': 1.0 },
    'Food': { 'Agricultural': 0.6, 'High-Tech': 1.2, 'Industrial': 1.3, 'Extraction': 1.4, 'Refinery': 1.2 },
    'Military': { 'Agricultural': 1.4, 'High-Tech': 1.1, 'Industrial': 1.2, 'Extraction': 1.0, 'Refinery': 1.0 },
    'Technology': { 'Agricultural': 1.3, 'High-Tech': 0.7, 'Industrial': 1.1, 'Extraction': 1.2, 'Refinery': 1.2 },
    'Minerals': { 'Agricultural': 1.2, 'High-Tech': 1.1, 'Industrial': 0.9, 'Extraction': 0.7, 'Refinery': 0.8 },
    'Illegal': { 'Agricultural': 1.1, 'High-Tech': 1.2, 'Industrial': 1.0, 'Extraction': 1.3, 'Refinery': 1.4 },
    'Marketing': { 'Agricultural': 1.0, 'High-Tech': 1.0, 'Industrial': 1.0, 'Extraction': 1.0, 'Refinery': 1.0 },
    'Scientific': { 'Agricultural': 1.2, 'High-Tech': 0.8, 'Industrial': 1.1, 'Extraction': 1.1, 'Refinery': 1.0 },
    'Robotic': { 'Agricultural': 1.3, 'High-Tech': 0.9, 'Industrial': 0.8, 'Extraction': 1.2, 'Refinery': 1.1 },
};

function calculatePrice(basePrice: number, supply: number, demand: number, economyMultiplier: number): number {
    const demandFactor = demand / supply;
    const price = basePrice * economyMultiplier * Math.pow(demandFactor, 0.5);
    return Math.round(price);
}


const securityConfig: Record<System['security'], { color: string; icon: React.ReactNode }> = {
    'High': { color: 'text-green-400', icon: <ShieldCheck className="h-4 w-4" /> },
    'Medium': { color: 'text-yellow-400', icon: <ShieldCheck className="h-4 w-4" /> },
    'Low': { color: 'text-orange-400', icon: <AlertTriangle className="h-4 w-4" /> },
    'Anarchy': { color: 'text-destructive', icon: <AlertTriangle className="h-4 w-4" /> },
};

const economyIcons: Record<System['economy'], React.ReactNode> = {
    'Industrial': <Factory className="h-4 w-4" />,
    'Agricultural': <Wheat className="h-4 w-4" />,
    'High-Tech': <Cpu className="h-4 w-4" />,
    'Extraction': <Hammer className="h-4 w-4" />,
    'Refinery': <Recycle className="h-4 w-4" />,
};

interface UseTravelProps {
    gameState: GameState | null;
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
    // Assuming these are provided by parent GameProvider or other hooks
    syncActiveShipStats: (playerStats: PlayerStats) => PlayerStats;
    updateObjectiveProgress: (objectiveType: QuestTask['type'], state: GameState) => [GameState, ActiveObjective[]];
}

export function useTravel({ gameState, setGameState, syncActiveShipStats, updateObjectiveProgress }: UseTravelProps) {
    const { toast } = useToast();
    const [travelDestination, setTravelDestination] = useState<System | null>(null);
    const [isSimulating, startSimulationTransition] = useTransition();

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
                if (zoneType === 'Frontier Outpost' || system.security === 'Anarchy') {
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


    const handleInitiateTravel = (systemName: string) => {
        if (!gameState || systemName === gameState.currentSystem) return;
        const destination = gameState.systems.find(s => s.name === systemName);
        if (destination) {
            setTravelDestination(destination);
        }
    };

    const handlePlanetTravel = (planetName: string) => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev || prev.currentPlanet === planetName) return prev;

            const planetFuelCost = 1;
            if (prev.playerStats.fuel < planetFuelCost) {
                toastMessage = {
                    variant: "destructive",
                    title: "Intra-system Travel Failed",
                    description: `Not enough fuel for orbital realignment. You need ${planetFuelCost} SU.`
                };
                return prev;
            }

            const newPlayerStats = {
                ...prev.playerStats,
                fuel: prev.playerStats.fuel - planetFuelCost,
            };

            toastMessage = {
                title: `Arrived at ${planetName}`,
                description: `Orbital realignment complete. Fuel consumed: ${planetFuelCost} SU.`
            };

            return {
                ...prev,
                playerStats: newPlayerStats,
                currentPlanet: planetName,
            };
        });
        if (toastMessage) {
            setTimeout(() => toast(toastMessage!), 0);
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
            let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
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

                    let newPlayerStats = {
                        ...prev.playerStats,
                        netWorth: prev.playerStats.netWorth - totalSalary,
                        fuel: prev.playerStats.fuel - fuelCost,
                        pirateRisk: scannedPirateEncounter ? 0 : Math.max(0, prev.playerStats.pirateRisk - 0.05)
                    };

                    // Update establishment contract values (consider moving this logic)
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
                    if (newPlayerStats.constructionContract) {
                        const oldValue = newPlayerStats.constructionContract.currentMarketValue;
                        const changePercent = (Math.random() - 0.5) * 0.1; // -5% to +5% change
                        const newValue = Math.round(oldValue * (1 + changePercent));
                        newPlayerStats.constructionContract.currentMarketValue = newValue;
                        newPlayerStats.constructionContract.valueHistory = [...newPlayerStats.constructionContract.valueHistory, newValue].slice(-20);
                    }
                    if (newPlayerStats.recreationContract) {
                        const oldValue = newPlayerStats.recreationContract.currentMarketValue;
                        const changePercent = (Math.random() - 0.5) * 0.1; // -5% to +5% change
                        const newValue = Math.round(oldValue * (1 + changePercent));
                        newPlayerStats.recreationContract.currentMarketValue = newValue;
                        newPlayerStats.recreationContract.valueHistory = [...newPlayerStats.recreationContract.valueHistory, newValue].slice(-20);
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
                    };
                });

                toastMessage = {
                    title: `Arrival: ${travelDestination.name}`,
                    description: `${eventDescription} Now in orbit of ${travelDestination.planets[0].name}. Your crew has been paid ${totalSalary.toLocaleString()}¢.`
                };
            } catch (error) {
                console.error(error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toastMessage = { variant: "destructive", title: "Warp Drive Malfunction", description: errorMessage };
            } finally {
                if (toastMessage) {
                    toast(toastMessage);
                }
            }
        });
    };

    const travelFuelCost = gameState && travelDestination ? Math.round(Math.hypot(travelDestination.x - (gameState.systems.find(s => s.name === gameState.currentSystem)?.x || 0), travelDestination.y - (gameState.systems.find(s => s.name === gameState.currentSystem)?.y || 0)) / 5) : 0;

    return {
        travelDestination,
        setTravelDestination, // Provide this so the parent can close the dialog
        handleInitiateTravel,
        handlePlanetTravel,
        handleConfirmTravel,
        travelFuelCost,
        securityConfig,
        economyIcons,
        isSimulating,
    };
}