
'use client';

import { useState, useCallback } from 'react';
import type { GameState, MarketItem, InventoryItem } from '@/lib/types';
import { STATIC_ITEMS } from '@/lib/items';
import { useToast } from '@/hooks/use-toast';

function calculateCurrentCargo(inventory: InventoryItem[]): number {
    return inventory.reduce((acc, item) => {
        const staticItem = STATIC_ITEMS.find(si => si.name === item.name);
        return acc + (staticItem ? staticItem.cargoSpace * item.owned : 0);
    }, 0);
}

export function useMarket(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
    const { toast } = useToast();
    const [chartItem, setChartItem] = useState<string>(STATIC_ITEMS[0].name);
    const [tradeDetails, setTradeDetails] = useState<{ item: MarketItem, type: 'buy' | 'sell' } | null>(null);

    const handleTrade = useCallback((itemName: string, type: 'buy' | 'sell', amount: number) => {
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

            return { ...prev, playerStats: newPlayerStats, inventory: updatedInventory };
        });
    }, [setGameState, toast]);

    const handleInitiateTrade = (itemName: string, type: 'buy' | 'sell') => {
        if (!gameState) return;
        const item = gameState.marketItems.find(i => i.name === itemName);
        if (item) {
            setTradeDetails({ item, type });
        }
    };

    return {
        chartItem,
        setChartItem,
        tradeDetails,
        setTradeDetails,
        handleTrade,
        handleInitiateTrade,
    };
};
