'use client';

import { useState, useTransition, useCallback } from 'react';
import type { GameState, System, MarketItem, Pirate, ItemCategory, SystemEconomy } from '@/lib/types';
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
                toast({ variant: "destructive", title: "Travel Failed", description: `Not enough fuel. You need ${planetFuelCost} SU.` });
                return prev;
            }
            const newPlayerStats = { ...prev.playerStats, fuel: prev.playerStats.fuel - planetFuelCost };
            toast({ title: `Arrived at ${planetName}`, description: `Orbital realignment complete. Fuel consumed: ${planetFuelCost} SU.` });
            return { ...prev, playerStats: newPlayerStats, currentPlanet: planetName };
        });
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
            setTravelDestination(null);
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
                    const scanResult = await runPirateScan({
                        pirateName: pirateEncounterObject.name,
                        pirateShipType: pirateEncounterObject.shipType,
                        pirateThreatLevel: pirateEncounterObject.threatLevel,
                        sensorLevel: gameState.playerStats.sensorLevel,
                    });
                    scannedPirateEncounter = { ...pirateEncounterObject, scanResult: scanResult.scanReport };
                }

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
                        ...prev, playerStats: newPlayerStats, currentSystem: travelDestination.name, currentPlanet: travelDestination.planets[0].name, marketItems: newMarketItems, priceHistory: newPriceHistory, pirateEncounter: scannedPirateEncounter
                    };
                });
                toast({ title: `Arrival: ${travelDestination.name}`, description: eventResult.eventDescription });
            } catch (e) {
                toast({ variant: "destructive", title: "Warp Malfunction", description: "Something went wrong during travel." });
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
