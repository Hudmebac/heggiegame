

'use client';

import { useCallback } from 'react';
import type { GameState, Stock, PortfolioItem, StockCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function useStocks(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
    const { toast } = useToast();

    const handleAddStock = useCallback((name: string, price: number, shares: number, category: StockCategory) => {
        setGameState(prev => {
            if (!prev) return null;
            const totalShares = shares > 0 ? shares : 0; // Use 0 for unlimited
            const newStock: Stock = {
                id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                name,
                category,
                price,
                history: Array(50).fill(price),
                changePercent: 0,
                lastUpdated: Date.now(),
                totalShares: totalShares,
                sharesAvailable: totalShares > 0 ? totalShares : null,
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

            const stockIndex = prev.playerStats.stocks.findIndex(s => s.id === stockId);
            if (stockIndex === -1) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Error', description: 'Stock not found.' }), 0);
                return prev;
            }
            
            const stock = { ...prev.playerStats.stocks[stockIndex] };
            const cost = stock.price * amount;

            if (prev.playerStats.netWorth < cost) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Transaction Failed', description: 'Insufficient funds.' }), 0);
                return prev;
            }
            
            if (stock.totalShares > 0 && stock.sharesAvailable !== null && amount > stock.sharesAvailable) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Transaction Failed', description: 'Not enough shares available on the market.' }), 0);
                return prev;
            }

            const newPortfolio = [...prev.playerStats.portfolio];
            const holdingIndex = newPortfolio.findIndex(h => h.id === stockId);

            if (holdingIndex > -1) {
                newPortfolio[holdingIndex] = { ...newPortfolio[holdingIndex], shares: newPortfolio[holdingIndex].shares + amount };
            } else {
                newPortfolio.push({ id: stockId, shares: amount });
            }
            
            if (stock.totalShares > 0 && stock.sharesAvailable !== null) {
              stock.sharesAvailable = stock.sharesAvailable - amount;
            }
            const newStocks = [...prev.playerStats.stocks];
            newStocks[stockIndex] = stock;

            setTimeout(() => toast({ title: 'Purchase Successful', description: `Bought ${amount.toLocaleString()} share(s) of ${stock.name}.` }), 0);
            
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth - cost,
                    portfolio: newPortfolio,
                    stocks: newStocks,
                }
            };
        });
    }, [setGameState, toast]);

    const handleSellStock = useCallback((stockId: string, amount: number) => {
        setGameState(prev => {
            if (!prev) return null;
            
            const stockIndex = prev.playerStats.stocks.findIndex(s => s.id === stockId);
            const holdingIndex = prev.playerStats.portfolio.findIndex(h => h.id === stockId);
            
            if (stockIndex === -1 || holdingIndex === -1) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Transaction Failed', description: 'You do not own these shares.' }), 0);
                return prev;
            }
            
            const holding = prev.playerStats.portfolio[holdingIndex];
            
            if (holding.shares < amount || amount <= 0) {
                 setTimeout(() => toast({ variant: 'destructive', title: 'Transaction Failed', description: 'Invalid amount to sell.' }), 0);
                return prev;
            }
            
            const stock = { ...prev.playerStats.stocks[stockIndex] };

            const income = stock.price * amount;
            const newPortfolio = [...prev.playerStats.portfolio];
            newPortfolio[holdingIndex] = { ...newPortfolio[holdingIndex], shares: newPortfolio[holdingIndex].shares - amount };

            if (stock.totalShares > 0 && stock.sharesAvailable !== null) {
              stock.sharesAvailable = stock.sharesAvailable + amount;
            }
            const newStocks = [...prev.playerStats.stocks];
            newStocks[stockIndex] = stock;

            setTimeout(() => toast({ title: 'Sale Successful', description: `Sold ${amount.toLocaleString()} share(s) of ${stock.name}.` }), 0);

            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth + income,
                    portfolio: newPortfolio.filter(h => h.shares > 0),
                    stocks: newStocks,
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
