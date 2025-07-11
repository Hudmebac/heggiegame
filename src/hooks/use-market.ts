

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { GameState, MarketItem } from '@/lib/types';
import { STATIC_ITEMS } from '@/lib/items';
import { useToast } from '@/hooks/use-toast';
import { calculateCurrentCargo, calculateCargoValue, calculatePrice, ECONOMY_MULTIPLIERS } from '@/lib/utils';


export function useMarket(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
    const { toast } = useToast();
    const [chartItem, setChartItem] = useState<string>(STATIC_ITEMS[0].name);
    const [tradeDetails, setTradeDetails] = useState<{ item: MarketItem, type: 'buy' | 'sell' } | null>(null);
    const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
    
    const handleTrade = useCallback((itemName: string, type: 'buy' | 'sell', amount: number) => {
        setGameState(prev => {
            if (!prev) return null;

            const marketItemIndex = prev.marketItems.findIndex(i => i.name === itemName);
            const staticItemData = STATIC_ITEMS.find(i => i.name === itemName);
            if (marketItemIndex === -1 || !staticItemData) return prev;
            
            const marketItem = prev.marketItems[marketItemIndex];

            const newPlayerStats = { ...prev.playerStats };
            const newInventory = [...prev.inventory];
            const inventoryItemIndex = newInventory.findIndex(i => i.name === itemName);
            let inventoryItem = newInventory[inventoryItemIndex];
            
            const isTrader = prev.playerStats.career === 'Trader';
            const price = (type === 'buy' && isTrader) ? marketItem.currentPrice * 0.8 : marketItem.currentPrice;
            const totalCost = price * amount;
            const totalCargo = staticItemData.cargoSpace * amount;

            const newMarketItems = [...prev.marketItems];
            let newMarketItem = { ...marketItem };

            // These checks are now primarily for server-side safety, UI validation is handled in the dialog
            if (type === 'buy') {
                if (newPlayerStats.netWorth < totalCost) return prev;
                if (marketItem.supply < amount) return prev;
                const currentCargo = calculateCurrentCargo(prev.inventory);
                if (currentCargo + totalCargo > newPlayerStats.maxCargo) return prev;

                newPlayerStats.netWorth -= totalCost;

                if (inventoryItem) {
                    newInventory[inventoryItemIndex] = { ...inventoryItem, owned: inventoryItem.owned + amount };
                } else {
                    newInventory.push({ name: itemName, owned: amount });
                }
                
                newMarketItem.supply -= amount;
                newMarketItem.demand += Math.round(amount * 0.1);

            } else { // sell
                if (!inventoryItem || inventoryItem.owned < amount) return prev;

                newPlayerStats.netWorth += marketItem.currentPrice * amount;
                newInventory[inventoryItemIndex] = { ...inventoryItem, owned: inventoryItem.owned - amount };

                newMarketItem.supply += amount;
                newMarketItem.demand = Math.max(1, newMarketItem.demand - Math.round(amount * 0.1));
            }

            const updatedInventory = newInventory.filter(item => item.owned > 0);
            newPlayerStats.cargo = calculateCurrentCargo(updatedInventory);

            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            if (currentSystem) {
                 const economyMultiplier = ECONOMY_MULTIPLIERS[staticItemData.category]?.[currentSystem.economy] ?? 1.0;
                 newMarketItem.currentPrice = calculatePrice(staticItemData.basePrice, newMarketItem.supply, newMarketItem.demand, economyMultiplier);
                 newMarketItems[marketItemIndex] = newMarketItem;
            }

            const newCargoValue = calculateCargoValue(updatedInventory, newMarketItems);
            newPlayerStats.cargoValueHistory = [...(prev.playerStats.cargoValueHistory || [0]), newCargoValue].slice(-20);

            return { ...prev, playerStats: newPlayerStats, inventory: updatedInventory, marketItems: newMarketItems };
        });
    }, [setGameState]);

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
        selectedStockId,
        setSelectedStockId,
    };
};
