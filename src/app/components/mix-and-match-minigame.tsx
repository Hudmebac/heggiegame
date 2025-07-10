
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Martini, Beer, GlassWater, Wine, Coffee, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const DRINK_TYPES = [
    { icon: Martini, color: 'text-green-400' },
    { icon: Beer, color: 'text-amber-400' },
    { icon: GlassWater, color: 'text-sky-400' },
    { icon: Wine, color: 'text-purple-400' },
    { icon: Coffee, color: 'text-yellow-800' },
];

const GAME_DURATION = 30; // seconds

enum GameState {
  Idle,
  Playing,
  Finished,
}

export default function MixAndMatchMinigame() {
  const { handleMixAndMatchMinigameScore } = useGame();
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);
  const [currentOrder, setCurrentOrder] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateNewOrder = useCallback(() => {
    const orderLength = 2 + Math.floor(Math.random() * 3); // 2 to 4 drinks
    const newOrder = Array.from({ length: orderLength }, () => Math.floor(Math.random() * DRINK_TYPES.length));
    setCurrentOrder(newOrder);
  }, []);

  const startGame = () => {
    setGameState(GameState.Playing);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    generateNewOrder();
  };
  
  const stopGame = useCallback(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState(GameState.Finished);
      handleMixAndMatchMinigameScore(score);
  }, [handleMixAndMatchMinigameScore, score]);

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
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) };
  }, [gameState, stopGame]);

  const handleServeDrink = (drinkIndex: number) => {
    if (gameState !== GameState.Playing) return;

    if (drinkIndex === currentOrder[0]) {
      const newOrder = currentOrder.slice(1);
      setCurrentOrder(newOrder);

      if (newOrder.length === 0) {
        const roundScore = 150 + timeLeft * 5;
        setScore(prev => prev + roundScore);
        generateNewOrder();
      }
    } else {
      // Incorrect drink
      setScore(prev => Math.max(0, prev - 50));
    }
  };

  const handleReset = () => {
    setGameState(GameState.Idle);
    setCurrentOrder([]);
    setScore(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <Martini className="text-primary" />
          Mix & Match
        </CardTitle>
        <CardDescription>
          Serve the correct sequence of drinks to the patrons before time runs out. Fast and accurate service yields higher tips!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-card/50">
          <div className="text-sm">Score: <span className="font-mono text-amber-300">{score.toLocaleString()}</span></div>
          <div className="text-sm">Time Left: <span className={cn("font-mono", timeLeft < 6 && 'text-destructive animate-pulse')}>{timeLeft}s</span></div>
        </div>

        {gameState === GameState.Playing && (
          <div>
            <div className="mb-4">
                <h4 className="text-center text-xs text-muted-foreground mb-2">Current Order</h4>
                <div className="flex justify-center items-center gap-2 h-16 bg-background/50 p-2 rounded-md border">
                    {currentOrder.length > 0 ? currentOrder.map((drinkIndex, i) => {
                        const DrinkIcon = DRINK_TYPES[drinkIndex].icon;
                        const color = DRINK_TYPES[drinkIndex].color;
                        return <DrinkIcon key={i} className={cn("h-8 w-8 transition-all", color, i > 0 && "opacity-50")} />;
                    }) : (
                        <p className="text-green-400 font-semibold">Order Complete!</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
                {DRINK_TYPES.map((drink, index) => {
                    const DrinkIcon = drink.icon;
                    return (
                        <Button key={index} variant="outline" className="h-20 w-full" onClick={() => handleServeDrink(index)}>
                             <DrinkIcon className={cn("h-8 w-8", drink.color)} />
                        </Button>
                    );
                })}
            </div>
            <Progress value={(timeLeft / GAME_DURATION) * 100} className="mt-4 h-2" />
          </div>
        )}
        
        {gameState !== GameState.Playing && (
            <div className="text-center space-y-2">
                 {gameState === GameState.Finished && <p className="font-bold text-lg">Final Score: {score.toLocaleString()}¢</p>}
                <Button onClick={startGame} className="w-full">
                    <Zap className="mr-2"/> {gameState === GameState.Idle ? 'Start Serving' : 'New Shift'}
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
