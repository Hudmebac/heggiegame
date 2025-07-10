
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldCheck, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const CODE_LENGTH = 6;
const GAME_TIME = 20; // seconds

enum GameState {
  Idle,
  Playing,
  Finished,
}

const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export default function VaultBreachMinigame() {
  const { handleVaultBreachMinigameScore } = useGame();
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);
  const [targetCode, setTargetCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [score, setScore] = useState(0);
  const [correctSequences, setCorrectSequences] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startNewRound = useCallback(() => {
    setTargetCode(generateCode());
    setUserInput('');
  }, []);

  const startGame = () => {
    setGameState(GameState.Playing);
    setScore(0);
    setCorrectSequences(0);
    setTimeLeft(GAME_TIME);
    startNewRound();
  };
  
  const stopGame = useCallback(() => {
      if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
      }
      setGameState(GameState.Finished);
      handleVaultBreachMinigameScore(score);
  }, [handleVaultBreachMinigameScore, score]);

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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, stopGame]);

  useEffect(() => {
    if (gameState === GameState.Playing && userInput.toUpperCase() === targetCode) {
        const roundScore = 250 + (targetCode.length * 50);
        setScore(prev => prev + roundScore);
        setCorrectSequences(prev => prev + 1);
        startNewRound();
    }
  }, [userInput, targetCode, gameState, startNewRound]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(gameState === GameState.Playing) {
          setUserInput(e.target.value.toUpperCase());
      }
  }

  const handleReset = () => {
      setGameState(GameState.Idle);
      setUserInput('');
      setScore(0);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <ShieldCheck className="text-primary" />
          Vault Breach Defense
        </CardTitle>
        <CardDescription>
          Hackers are probing the vault—solve encryption puzzles to stop them. Correctly type the sequences before the timer runs out.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-card/50">
          <div className="text-sm">Score: <span className="font-mono text-amber-300">{score.toLocaleString()}</span></div>
          <div className="text-sm">Time Left: <span className={cn("font-mono", timeLeft < 6 && 'text-destructive animate-pulse')}>{timeLeft}s</span></div>
        </div>

        {gameState === GameState.Playing && (
            <div className="text-center space-y-2">
                <p className="text-muted-foreground">Target Encryption Key:</p>
                <p className="font-mono text-2xl tracking-widest text-primary bg-background/50 p-2 rounded-md">{targetCode}</p>
                 <Input 
                    value={userInput}
                    onChange={handleInputChange}
                    maxLength={CODE_LENGTH}
                    className="text-center font-mono text-lg tracking-widest"
                    autoFocus
                 />
            </div>
        )}

        {gameState === GameState.Idle && (
            <Button onClick={startGame} className="w-full">
                <Zap className="mr-2"/> Start Simulation
            </Button>
        )}

        {gameState === GameState.Finished && (
             <div className="text-center space-y-4 py-4">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <h3 className="font-bold text-lg">Simulation Complete!</h3>
                <p>Final Score: <span className="font-mono text-amber-300">{score.toLocaleString()}¢</span></p>
                <p className="text-sm text-muted-foreground">You correctly input {correctSequences} sequences.</p>
                <Button onClick={handleReset} className="w-full">
                    Run New Simulation
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
