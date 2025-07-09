

'use client';

import { useState, useTransition, useCallback } from 'react';
import type { GameState, System, MarketItem, Pirate, ItemCategory, SystemEconomy, PlayerStats, BarContract, ItemRarity } from '@/lib/types';
import { runMarketSimulation, runPirateScan, runEventGeneration } from '@/app/actions';
import { STATIC_ITEMS } from '@/lib/items';
import { useToast } from '@/hooks/use-toast';
import { pirateNames, shipTypes } from '@/lib/pirates';
import { calculateCargoValue, calculatePrice, ECONOMY_MULTIPLIERS } from '@/lib/utils';

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

const RARITY_SUPPLY_RANGES: Record<ItemRarity, { base: number; range: number }> = {
    'Plentiful': { base: 5000, range: 5000 },
    'Common': { base: 1000, range: 4000 },
    'Accessible': { base: 500, range: 500 },
    'Uncommon': { base: 100, range: 400 },
    'Rare': { base: 20, range: 80 },
    'Ultra Rare': { base: 5, range: 15 },
    'Mythic': { base: 1, range: 4 },
};

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
                    
                    const newCargoValue = calculateCargoValue(prev.inventory, newMarketItems);
                    newPlayerStats.cargoValueHistory = [...(prev.playerStats.cargoValueHistory || [0]), newCargoValue].slice(-20);
                    
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

    const handleOpenRoute = useCallback((fromSystem: string, toSystem: string, cost: number) => {
        setGameState(prev => {
            if (!prev) return null;
            if (prev.playerStats.netWorth < cost) {
                setTimeout(() => toast({ variant: "destructive", title: "Route Failed", description: "Insufficient funds to establish route." }), 0);
                return prev;
            }

            const newRoute = { from: fromSystem, to: toSystem };
            const newRoutes = [...prev.routes, newRoute];

            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
            };

            const routeKey = [fromSystem, toSystem].sort().join('-');
            const newCooldowns = { ...prev.playerStats.negotiationCooldowns };
            delete newCooldowns[routeKey];
            newPlayerStats.negotiationCooldowns = newCooldowns;

            setTimeout(() => toast({ title: "Trade Route Established!", description: `A new route between ${fromSystem} and ${toSystem} is now open.` }), 0);
            return {
                ...prev,
                playerStats: newPlayerStats,
                routes: newRoutes
            };
        });
      }, [setGameState, toast]);

    const handleSetNegotiationCooldown = useCallback((routeKey: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const newCooldowns = {
                ...prev.playerStats.negotiationCooldowns,
                [routeKey]: Date.now() + 30 * 60 * 1000 // 30 minutes
            };
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    negotiationCooldowns: newCooldowns,
                }
            };
        });
    }, [setGameState]);

    const travelFuelCost = gameState && travelDestination ? Math.round(Math.hypot(travelDestination.x - (gameState.systems.find(s => s.name === gameState.currentSystem)?.x || 0), travelDestination.y - (gameState.systems.find(s => s.name === gameState.currentSystem)?.y || 0)) / 5) : 0;
    
    return {
        travelDestination,
        setTravelDestination,
        handleInitiateTravel,
        handlePlanetTravel,
        handleConfirmTravel,
        handleOpenRoute,
        handleSetNegotiationCooldown,
        travelFuelCost,
        isSimulating,
    };
}
