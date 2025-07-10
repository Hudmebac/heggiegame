
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, Zap, Coins, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const GAME_DURATION = 60; // seconds
const TICK_INTERVAL = 2000; // ms

enum GameState {
  Idle,
  Playing,
  Finished,
}

interface MarketItem {
  name: string;
  price: number;
  history: number[];
  held: number;
}

const initialItems: Omit<MarketItem, 'history' | 'held'>[] = [
    { name: 'Quantum Chips', price: 150 },
    { name: 'Synth-Protein', price: 50 },
    { name: 'Hyper-Alloy', price: 300 },
    { name: 'Bio-Gel', price: 80 },
];

export default function MarketFrenzyMinigame() {
  const { handleMarketFrenzyMinigameScore } = useGame();
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);
  const [items, setItems] = useState<MarketItem[]>([]);
  const [cash, setCash] = useState(10000);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const marketTickRef = useRef<NodeJS.Timeout | null>(null);

  const resetGame = useCallback(() => {
    setGameState(GameState.Idle);
    setCash(10000);
    setItems(initialItems.map(item => ({ ...item, history: [item.price], held: 0 })));
    setTimeLeft(GAME_DURATION);
    if(timerRef.current) clearInterval(timerRef.current);
    if(marketTickRef.current) clearInterval(marketTickRef.current);
  }, []);

  const startGame = () => {
    resetGame();
    setGameState(GameState.Playing);
  };
  
  const stopGame = useCallback(() => {
    setGameState(GameState.Finished);
    if(timerRef.current) clearInterval(timerRef.current);
    if(marketTickRef.current) clearInterval(marketTickRef.current);

    const finalPortfolioValue = items.reduce((acc, item) => acc + item.held * item.price, 0);
    const profit = (cash + finalPortfolioValue) - 10000;
    handleMarketFrenzyMinigameScore(profit > 0 ? profit : 0);
  }, [items, cash, handleMarketFrenzyMinigameScore]);

  useEffect(() => {
    if (gameState === GameState.Playing) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      marketTickRef.current = setInterval(() => {
        setItems(prevItems => prevItems.map(item => {
            const volatility = 0.4;
            const trend = Math.random() > 0.5 ? 1 : -1;
            const change = item.price * volatility * (Math.random() - 0.45) * trend;
            const newPrice = Math.max(10, Math.round(item.price + change));
            return {
                ...item,
                price: newPrice,
                history: [...item.history, newPrice].slice(-10)
            }
        }));
      }, TICK_INTERVAL);
    }
    return () => { 
        if (timerRef.current) clearInterval(timerRef.current);
        if (marketTickRef.current) clearInterval(marketTickRef.current);
    };
  }, [gameState, stopGame]);

  const handleTrade = (itemName: string, type: 'buy' | 'buy-max' | 'sell' | 'sell-max') => {
      setItems(prevItems => {
          const itemIndex = prevItems.findIndex(i => i.name === itemName);
          if (itemIndex === -1) return prevItems;
          
          const newItems = [...prevItems];
          const item = { ...newItems[itemIndex] };
          
          let amount = 1;
          
          if (type === 'buy') {
              if (cash >= item.price) {
                  setCash(c => c - item.price);
                  item.held += 1;
              }
          } else if (type === 'buy-max') {
              amount = Math.floor(cash / item.price);
              if (amount > 0) {
                  setCash(c => c - item.price * amount);
                  item.held += amount;
              }
          } else if (type === 'sell') {
              if (item.held > 0) {
                  setCash(c => c + item.price);
                  item.held -= 1;
              }
          } else if (type === 'sell-max') {
              amount = item.held;
              if (amount > 0) {
                  setCash(c => c + item.price * amount);
                  item.held = 0;
              }
          }

          newItems[itemIndex] = item;
          return newItems;
      });
  };
  
  const totalPortfolioValue = items.reduce((acc, item) => acc + item.held * item.price, 0) + cash;
  const profit = totalPortfolioValue - 10000;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <LineChart className="text-primary" />
          Market Frenzy
        </CardTitle>
        <CardDescription>
          Buy low and sell high before time runs out. Your starting capital is 10,000¢.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-card/50">
          <div className="text-sm">Time Left: <span className={cn("font-mono", timeLeft < 10 && 'text-destructive animate-pulse')}>{timeLeft}s</span></div>
          <div className="text-sm">Cash: <span className="font-mono text-amber-300">{cash.toLocaleString()}¢</span></div>
          <div className="text-sm">Profit: <span className={cn("font-mono", profit > 0 ? 'text-green-400' : 'text-destructive')}>{profit.toLocaleString()}¢</span></div>
        </div>

        {gameState === GameState.Playing && (
            <div className="space-y-2">
                {items.map(item => (
                    <div key={item.name} className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/50 border">
                        <div className="flex-grow">
                            <p className="font-semibold text-sm">{item.name}</p>
                            <p className="font-mono text-xs text-amber-300">{item.price.toLocaleString()}¢</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Held</p>
                            <p className="font-mono font-semibold">{item.held}</p>
                        </div>
                        <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleTrade(item.name, 'buy')} disabled={cash < item.price}>Buy</Button>
                            <Button size="sm" variant="outline" onClick={() => handleTrade(item.name, 'sell')} disabled={item.held === 0}>Sell</Button>
                        </div>
                         <div className="flex flex-col gap-1">
                            <Button size="sm" variant="secondary" className="h-auto px-2 py-1 text-xs" onClick={() => handleTrade(item.name, 'buy-max')} disabled={cash < item.price}>Max</Button>
                            <Button size="sm" variant="secondary" className="h-auto px-2 py-1 text-xs" onClick={() => handleTrade(item.name, 'sell-max')} disabled={item.held === 0}>Max</Button>
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        {gameState !== GameState.Playing && (
            <div className="text-center space-y-2 py-8">
                 {gameState === GameState.Finished && <p className="font-bold text-lg">Final Profit: {Math.max(0, profit).toLocaleString()}¢</p>}
                <Button onClick={startGame} className="w-full">
                    <Zap className="mr-2"/> {gameState === GameState.Idle ? 'Start Trading Session' : 'New Session'}
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
