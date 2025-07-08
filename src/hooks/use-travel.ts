
'use client';

import { useState, useTransition, useCallback } from 'react';
import type { GameState, System, MarketItem, Pirate, ItemCategory, SystemEconomy, PlayerStats, BarContract } from '@/lib/types';
import { runMarketSimulation, runPirateScan, runEventGeneration } from '@/app/actions';
import { STATIC_ITEMS } from '@/lib/items';
import { useToast } from '@/hooks/use-toast';

const pirateNames = ['Dread Captain "Scar" Ironheart', 'Admiral "Voidgazer" Kael', 'Captain "Mad" Mel', 'Commander "Hex" Stryker'];
const shipTypes = ['Marauder-class Corvette', 'Reaper-class Frigate', 'Void-reaver Battleship', 'Shadow-class Interceptor'];

function generateRandomPirate(hasNavigator: boolean): Pirate {
    const weightedThreats: Pirate['threatLevel'][] = hasNavigator
        ? ['Low', 'Low', 'Low', 'Medium', 'Medium', 'Medium', 'High', 'High', 'Critical']
        : ['Low', 'Medium', 'High', 'Critical'];
    const threat = weightedThreats[Math.floor(Math.random() * weightedThreats.length)];
    return {
        name: pirateNames[Math.floor(Math.random() * pirateNames.length)],
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
    'Marketing':    { 'Agricultural': 1.0, 'High-Tech': 1.0, 'Industrial': 1.0, 'Extraction': 1.0, 'Refinery': 1.0 },
    'Scientific':   { 'Agricultural': 1.2, 'High-Tech': 0.8, 'Industrial': 1.1, 'Extraction': 1.1, 'Refinery': 1.0 },
    'Robotic':      { 'Agricultural': 1.3, 'High-Tech': 0.9, 'Industrial': 0.8, 'Extraction': 1.2, 'Refinery': 1.1 },
};

function calculatePrice(basePrice: number, supply: number, demand: number, economyMultiplier: number): number {
    const demandFactor = demand / supply;
    const price = basePrice * economyMultiplier * Math.pow(demandFactor, 0.5);
    return Math.round(price);
}

export function useTravel(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
    const { toast } = useToast();
    const [travelDestination, setTravelDestination] = useState<System | null>(null);
    const [isSimulating, startSimulationTransition] = useTransition();

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
                setTimeout(() => toast({ variant: "destructive", title: "Travel Failed", description: `Not enough fuel. You need ${planetFuelCost} SU.` }), 0);
                return prev;
            }
            const newPlayerStats = { ...prev.playerStats, fuel: prev.playerStats.fuel - planetFuelCost };
            setTimeout(() => toast({ title: `Arrived at ${planetName}`, description: `Orbital realignment complete. Fuel consumed: ${planetFuelCost} SU.` }), 0);
            return { ...prev, playerStats: newPlayerStats, currentPlanet: planetName };
        });
    };

    const handleConfirmTravel = () => {
        if (!gameState || !travelDestination) return;

        const currentSystem = gameState.systems.find(s => s.name === gameState.currentSystem)!;
        const distance = Math.hypot(travelDestination.x - currentSystem.x, travelDestination.y - currentSystem.y);
        let fuelCost = Math.round(distance / 5);

        if (gameState.playerStats.fuel < fuelCost) {
            setTimeout(() => {
                toast({ variant: "destructive", title: "Travel Failed", description: `Not enough fuel. You need ${fuelCost} SU.` });
            }, 0);
            setTravelDestination(null);
            return;
        }
        
        startSimulationTransition(async () => {
            setTravelDestination(null);
            try {
                // Determine if a pirate encounter occurs
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
                
                const eventResult = await runEventGeneration();

                const marketItemsForDestination = calculateMarketDataForSystem(travelDestination);

                // Select a smaller, random subset of items for the AI simulation
                const itemsToSimulate = marketItemsForDestination.length > 30 
                    ? [...marketItemsForDestination].sort(() => 0.5 - Math.random()).slice(0, 30)
                    : marketItemsForDestination;

                const [simResult, scanResult] = await Promise.all([
                     runMarketSimulation({
                        items: itemsToSimulate,
                        systemEconomy: travelDestination.economy,
                        systemVolatility: travelDestination.volatility,
                        eventDescription: eventResult.eventDescription,
                    }),
                    pirateEncounterObject ? runPirateScan({
                        pirateName: pirateEncounterObject.name,
                        pirateShipType: pirateEncounterObject.shipType,
                        pirateThreatLevel: pirateEncounterObject.threatLevel,
                        sensorLevel: gameState.playerStats.sensorLevel,
                    }) : Promise.resolve(null)
                ]);

                let scannedPirateEncounter: Pirate | null = null;
                if (pirateEncounterObject && scanResult) {
                     scannedPirateEncounter = { ...pirateEncounterObject, scanResult: scanResult.scanReport };
                }
               
                const simUpdates = new Map(simResult.map(item => [item.name, item]));

                const newMarketItems: MarketItem[] = marketItemsForDestination.map(item => {
                    const update = simUpdates.get(item.name);
                    const staticItem = STATIC_ITEMS.find(si => si.name === item.name)!;
                    const economyMultiplier = ECONOMY_MULTIPLIERS[staticItem.category][travelDestination.economy];
                    
                    if (update) {
                        // This item was simulated by the AI
                        return {
                            name: update.name,
                            supply: update.newSupply,
                            demand: update.newDemand,
                            currentPrice: calculatePrice(staticItem.basePrice, update.newSupply, update.newDemand, economyMultiplier),
                        };
                    } else {
                        // This item was not simulated, apply a simple volatility fluctuation
                        const volatilityFactor = (Math.random() - 0.5) * travelDestination.volatility * 0.2; // Smaller fluctuation
                        const newSupply = Math.max(10, Math.round(item.supply * (1 - volatilityFactor)));
                        const newDemand = Math.max(10, Math.round(item.demand * (1 + volatilityFactor)));
                        return {
                            name: item.name,
                            supply: newSupply,
                            demand: newDemand,
                            currentPrice: calculatePrice(staticItem.basePrice, newSupply, newDemand, economyMultiplier),
                        };
                    }
                });

                setGameState(prev => {
                    if (!prev) return null;
                    const newPriceHistory = { ...prev.priceHistory };
                    newMarketItems.forEach(item => {
                        newPriceHistory[item.name] = [...(newPriceHistory[item.name] || []), item.currentPrice].slice(-20);
                    });
                    
                    const newPlayerStats = { ...prev.playerStats, fuel: prev.playerStats.fuel - fuelCost };
                    const contractKeys: Array<keyof PlayerStats> = ['barContract', 'residenceContract', 'commerceContract', 'industryContract', 'constructionContract', 'recreationContract'];
                    
                    contractKeys.forEach(key => {
                        const contract = newPlayerStats[key] as BarContract | undefined;
                        if (contract) {
                            const volatility = (Math.random() - 0.5) * 0.2 * travelDestination.volatility; // Fluctuation of +/- 10% * volatility
                            let newMarketValue = Math.round(contract.currentMarketValue * (1 + volatility));
                            newMarketValue = Math.max(1000, newMarketValue);
                            
                            (newPlayerStats as any)[key] = {
                                ...contract,
                                currentMarketValue: newMarketValue,
                                valueHistory: [...contract.valueHistory, newMarketValue].slice(-20)
                            };
                        }
                    });

                    setTimeout(() => {
                        toast({ title: `Arrival: ${travelDestination.name}`, description: eventResult.eventDescription });
                    }, 0);

                    return {
                        ...prev, 
                        playerStats: newPlayerStats, 
                        currentSystem: travelDestination.name, 
                        currentPlanet: travelDestination.planets[0].name, 
                        marketItems: newMarketItems, 
                        priceHistory: newPriceHistory, 
                        pirateEncounter: scannedPirateEncounter
                    };
                });
            } catch (e) {
                console.error(e);
                setTimeout(() => {
                    toast({ variant: "destructive", title: "Warp Malfunction", description: "Something went wrong during travel." });
                }, 0);
            }
        });
    };

    const travelFuelCost = gameState && travelDestination ? Math.round(Math.hypot(travelDestination.x - (gameState.systems.find(s => s.name === gameState.currentSystem)?.x || 0), travelDestination.y - (gameState.systems.find(s => s.name === gameState.currentSystem)?.y || 0)) / 5) : 0;
    
    return {
        travelDestination,
        setTravelDestination,
        handleInitiateTravel,
        handlePlanetTravel,
        handleConfirmTravel,
        travelFuelCost,
        isSimulating,
    };
}
