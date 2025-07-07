import { useState, useCallback } from 'react';
import type { GameState, MarketItem, InventoryItem, System, ItemCategory, SystemEconomy } from '@/lib/types';
import { STATIC_ITEMS } from '@/lib/items';
import { SYSTEMS } from '@/lib/systems';
import { useToast } from '@/hooks/use-toast';

// Constants for economy multipliers (assuming these are defined in the original file)
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

// Utility functions (assuming these were in the original file)
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

interface UseMarketHook {
    marketItems: MarketItem[];
    chartItem: string;
    setChartItem: (item: string) => void;
    handleTrade: (itemName: string, type: 'buy' | 'sell', amount: number) => void;
    handleInitiateTrade: (itemName: string, type: 'buy' | 'sell') => void;
    calculateMarketDataForSystem: (system: System) => MarketItem[];
    tradeDetails: { item: MarketItem, type: 'buy' | 'sell' } | null;
    setTradeDetails: (details: { item: MarketItem, type: 'buy' | 'sell' } | null) => void;
}

export const useMarket = (
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
): UseMarketHook => {
    const { toast } = useToast();
    const [chartItem, setChartItem] = useState<string>(STATIC_ITEMS[0].name);
    const [tradeDetails, setTradeDetails] = useState<{ item: MarketItem, type: 'buy' | 'sell' } | null>(null);

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
                const currentCargo = calculateCurrentCargo(prev.inventory);
                if (currentCargo + totalCargo > newPlayerStats.maxCargo) {
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
        if (!gameState) return;
        const item = gameState.marketItems.find(i => i.name === itemName);
        if (item) {
            setTradeDetails({ item, type });
        }
    };


    return {
        marketItems: gameState?.marketItems || [],
        chartItem,
        setChartItem,
        handleTrade,
        handleInitiateTrade,
        calculateMarketDataForSystem,
        tradeDetails,
        setTradeDetails,
    };
};
import { useState, useCallback } from 'react';
import type { GameState, MarketItem, InventoryItem, System, ItemCategory, SystemEconomy, PlayerStats } from '@/lib/types';
import { STATIC_ITEMS } from '@/lib/items';
import { SYSTEMS } from '@/lib/systems';
import { useToast } from '@/hooks/use-toast';

// Constants for economy multipliers (assuming these are defined in the original file)
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


// Utility functions (assuming these were in the original file)
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


interface UseMarketHook {
    marketItems: MarketItem[];
    chartItem: string;
    setChartItem: (item: string) => void;
    handleTrade: (itemName: string, type: 'buy' | 'sell', amount: number) => void;
    handleInitiateTrade: (itemName: string, type: 'buy' | 'sell') => void;
    calculateMarketDataForSystem: (system: System) => MarketItem[];
    tradeDetails: { item: MarketItem, type: 'buy' | 'sell' } | null;
    setTradeDetails: (details: { item: MarketItem, type: 'buy' | 'sell' } | null) => void;
}

export const useMarket = (
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
): UseMarketHook => {
    const { toast } = useToast();
    const [chartItem, setChartItem] = useState<string>(STATIC_ITEMS[0].name);
    const [tradeDetails, setTradeDetails] = useState<{ item: MarketItem, type: 'buy' | 'sell' } | null>(null);

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
                // Ensure maxCargo is available and calculated
                const currentCargo = calculateCurrentCargo(prev.inventory); // Calculate from *previous* inventory
                if (currentCargo + totalCargo > newPlayerStats.maxCargo) {
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
            newPlayerStats.cargo = calculateCurrentCargo(updatedInventory); // Update cargo after trade

            const repGain = Math.max(1, Math.round(totalCost / 5000));
            newPlayerStats.reputation = Math.min(100, newPlayerStats.reputation + repGain);

            return { ...prev, playerStats: newPlayerStats, inventory: updatedInventory };
        });
    };

    const handleInitiateTrade = (itemName: string, type: 'buy' | 'sell') => {
        if (!gameState) return;
        const item = gameState.marketItems.find(i => i.name === itemName);
        if (item) {
            setTradeDetails({ item, type });
        }
    };


    return {
        marketItems: gameState?.marketItems || [],
        chartItem,
        setChartItem,
        handleTrade,
        handleInitiateTrade,
        calculateMarketDataForSystem,
        tradeDetails,
        setTradeDetails,
    };
};