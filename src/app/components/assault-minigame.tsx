'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Crosshair, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const GRID_SIZE = 9;
const SEQUENCE_DELAY = 600;
const HIGHLIGHT_DURATION = 300;

enum GameState {
  Idle,
  ShowingSequence,
  PlayerTurn,
  Finished,
}

export default function AssaultMinigame() {
  const { handleMilitaryMinigameScore } = useGame();
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const startNewRound = () => {
    setGameState(GameState.ShowingSequence);
    setPlayerInput([]);
    setSequence(prev => [...prev, Math.floor(Math.random() * GRID_SIZE)]);
  };

  useEffect(() => {
    if (gameState !== GameState.ShowingSequence) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setHighlightedIndex(sequence[i]);
        setTimeout(() => setHighlightedIndex(null), HIGHLIGHT_DURATION);
        i++;
      } else {
        clearInterval(interval);
        setGameState(GameState.PlayerTurn);
      }
    }, SEQUENCE_DELAY);

    return () => clearInterval(interval);
  }, [gameState, sequence]);

  const handlePlayerClick = (index: number) => {
    if (gameState !== GameState.PlayerTurn) return;

    const newPlayerInput = [...playerInput, index];
    setPlayerInput(newPlayerInput);

    if (newPlayerInput[newPlayerInput.length - 1] !== sequence[newPlayerInput.length - 1]) {
      // Wrong sequence
      setGameState(GameState.Finished);
      handleMilitaryMinigameScore(score);
      return;
    }

    if (newPlayerInput.length === sequence.length) {
      // Correct sequence
      const roundScore = sequence.length * 100;
      setScore(prev => prev + roundScore);
      setTimeout(() => startNewRound(), 500);
    }
  };
  
  const handleStartGame = () => {
    setScore(0);
    setSequence([]);
    setPlayerInput([]);
    startNewRound();
  };
  
  const handleResetGame = () => {
    setGameState(GameState.Idle);
    setScore(0);
    setSequence([]);
    setPlayerInput([]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <Crosshair className="text-primary" />
          Targeting Uplink Simulator
        </CardTitle>
        <CardDescription>
          Memorize and repeat the target sequences. Each successful sequence increases your score. One mistake ends the simulation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-card/50">
          <div className="text-sm">Score: <span className="font-mono text-amber-300">{score.toLocaleString()}</span></div>
          <div className="text-sm">Round: <span className="font-mono text-primary">{sequence.length}</span></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: GRID_SIZE }).map((_, index) => (
            <Button
              key={index}
              variant="outline"
              className={cn(
                  "h-20 w-full transition-all duration-150",
                  highlightedIndex === index && 'bg-primary/80 scale-105',
                  gameState === GameState.Finished && !sequence.includes(index) && 'bg-destructive/50'
              )}
              onClick={() => handlePlayerClick(index)}
              disabled={gameState !== GameState.PlayerTurn}
            >
              <Crosshair className="h-6 w-6 text-muted-foreground" />
            </Button>
          ))}
        </div>
        {gameState === GameState.Idle && (
            <Button onClick={handleStartGame} className="w-full">
                <Zap className="mr-2"/> Start Simulation
            </Button>
        )}
        {gameState === GameState.Finished && (
             <div className="text-center space-y-2">
                <p className="font-bold text-lg">Final Score: {score.toLocaleString()}¢</p>
                <p className="text-muted-foreground text-sm">Credits have been transferred to your account.</p>
                <Button onClick={handleResetGame} className="w-full">
                    <Zap className="mr-2"/> Run New Simulation
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}