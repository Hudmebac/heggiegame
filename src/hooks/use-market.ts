
'use client';

import { useState, useCallback } from 'react';
import type { GameState, MarketItem, InventoryItem } from '@/lib/types';
import { STATIC_ITEMS } from '@/lib/items';
import { useToast } from '@/hooks/use-toast';
import { calculateCurrentCargo } from '@/lib/utils';


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
                    setTimeout(() => toast({ variant: "destructive", title: "Transaction Failed", description: "Not enough credits." }), 0);
                    return prev;
                }
                const currentCargo = calculateCurrentCargo(prev.inventory);
                if (currentCargo + totalCargo > newPlayerStats.maxCargo) {
                    setTimeout(() => toast({ variant: "destructive", title: "Transaction Failed", description: `Not enough cargo space. Available: ${(newPlayerStats.maxCargo - currentCargo).toFixed(2)}t. Needed: ${totalCargo.toFixed(2)}t.` }), 0);
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
                    setTimeout(() => toast({ variant: "destructive", title: "Transaction Failed", description: "Not enough items to sell." }), 0);
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
