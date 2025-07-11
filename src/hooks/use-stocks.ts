
'use client';

import { useCallback } from 'react';
import type { GameState, Stock, PortfolioItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function useStocks(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
    const { toast } = useToast();

    const handleAddStock = useCallback((name: string, price: number) => {
        setGameState(prev => {
            if (!prev) return null;
            const newStock: Stock = {
                id: name.toLowerCase().replace(/\s/g, '-'),
                name,
                price,
                history: Array(50).fill(price),
                changePercent: 0,
                lastUpdated: Date.now(),
            };
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    stocks: [...prev.playerStats.stocks, newStock]
                }
            };
        });
    }, [setGameState]);

    const handleBuyStock = useCallback((stockId: string, amount: number) => {
        setGameState(prev => {
            if (!prev) return null;

            const stock = prev.playerStats.stocks.find(s => s.id === stockId);
            if (!stock) {
                toast({ variant: 'destructive', title: 'Error', description: 'Stock not found.' });
                return prev;
            }

            const cost = stock.price * amount;
            if (prev.playerStats.netWorth < cost) {
                toast({ variant: 'destructive', title: 'Transaction Failed', description: 'Insufficient funds.' });
                return prev;
            }

            const newPortfolio = [...prev.playerStats.portfolio];
            const holdingIndex = newPortfolio.findIndex(h => h.id === stockId);

            if (holdingIndex > -1) {
                newPortfolio[holdingIndex].shares += amount;
            } else {
                newPortfolio.push({ id: stockId, shares: amount });
            }
            
            toast({ title: 'Purchase Successful', description: `Bought ${amount} share(s) of ${stock.name}.` });
            
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth - cost,
                    portfolio: newPortfolio,
                }
            };
        });
    }, [setGameState, toast]);

    const handleSellStock = useCallback((stockId: string, amount: number) => {
        setGameState(prev => {
            if (!prev) return null;
            
            const stock = prev.playerStats.stocks.find(s => s.id === stockId);
            const holding = prev.playerStats.portfolio.find(h => h.id === stockId);

            if (!stock || !holding || holding.shares < amount) {
                toast({ variant: 'destructive', title: 'Transaction Failed', description: 'Not enough shares to sell.' });
                return prev;
            }

            const income = stock.price * amount;
            const newPortfolio = [...prev.playerStats.portfolio];
            const holdingIndex = newPortfolio.findIndex(h => h.id === stockId);
            newPortfolio[holdingIndex].shares -= amount;

            toast({ title: 'Sale Successful', description: `Sold ${amount} share(s) of ${stock.name}.` });

            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth + income,
                    portfolio: newPortfolio.filter(h => h.shares > 0),
                }
            };
        });
    }, [setGameState, toast]);

    return {
        handleAddStock,
        handleBuyStock,
        handleSellStock,
    };
}
