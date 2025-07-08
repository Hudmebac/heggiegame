'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skull, Shield, Zap, Target } from 'lucide-react';

const GRID_SIZE = 9;
const GAME_LENGTH_MS = 30000; // 30 seconds
const SPAWN_INTERVAL_MS = 750;

type TargetType = 'enemy' | 'friendly';

interface Target {
  id: number;
  type: TargetType;
}

export default function DefenceMinigame() {
  const { gameState, handleDefenceMinigameScore } = useGame();
  const [targets, setTargets] = useState<Map<number, Target>>(new Map());
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(GAME_LENGTH_MS);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const gameTimer = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1000) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    const spawnTimer = setInterval(() => {
      setTargets(prevTargets => {
        if (prevTargets.size >= GRID_SIZE - 2) return prevTargets;

        const newTargets = new Map(prevTargets);
        let cellIndex = Math.floor(Math.random() * GRID_SIZE);
        while (newTargets.has(cellIndex)) {
          cellIndex = Math.floor(Math.random() * GRID_SIZE);
        }
        
        const type: TargetType = Math.random() > 0.25 ? 'enemy' : 'friendly';
        newTargets.set(cellIndex, { id: Date.now(), type });
        return newTargets;
      });
    }, SPAWN_INTERVAL_MS);

    return () => {
      clearInterval(gameTimer);
      clearInterval(spawnTimer);
    };
  }, [isPlaying]);

  const handleStartGame = () => {
    setScore(0);
    setGameTime(GAME_LENGTH_MS);
    setTargets(new Map());
    setIsPlaying(true);
  };

  const handleTargetClick = (cellIndex: number, type: TargetType) => {
    if (!isPlaying) return;

    let points = 0;
    if (type === 'enemy') {
      points = 150;
    } else {
      points = -500;
    }

    setScore(prev => prev + points);
    handleDefenceMinigameScore(points);
    setTargets(prev => {
      const newTargets = new Map(prev);
      newTargets.delete(cellIndex);
      return newTargets;
    });
  };
  
  const getIconForType = (type: TargetType) => {
    if (type === 'enemy') return <Skull className="h-6 w-6 text-destructive animate-pulse" />;
    return <Shield className="h-6 w-6 text-green-400" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <Target className="text-primary" />
          Planetary Defense Simulator
        </CardTitle>
        <CardDescription>
          Destroy hostile targets to earn credits. Avoid hitting friendlies!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-card/50">
          <div className="text-sm">Score: <span className="font-mono text-amber-300">{score.toLocaleString()}</span></div>
          <div className="text-sm">Time Left: <span className="font-mono text-primary">{(gameTime / 1000).toFixed(0)}s</span></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: GRID_SIZE }).map((_, index) => {
            const target = targets.get(index);
            return (
              <Button
                key={index}
                variant="outline"
                className="h-20 w-full"
                onClick={() => target && handleTargetClick(index, target.type)}
                disabled={!isPlaying}
              >
                {target && getIconForType(target.type)}
              </Button>
            );
          })}
        </div>
        <Button onClick={handleStartGame} disabled={isPlaying} className="w-full">
            <Zap className="mr-2"/> Start Simulation
        </Button>
      </CardContent>
    </Card>
  );
}
