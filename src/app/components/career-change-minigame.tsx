'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Zap, Check, ArrowRight, LucideIcon } from 'lucide-react';
import { CAREER_DATA } from '@/lib/careers';
import type { Career, CareerData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

enum GameState {
  Idle,
  ShowingSequence,
  PlayerTurn,
  Success,
  Failed,
}

const SEQUENCE_DELAY = 700;
const HIGHLIGHT_DURATION = 350;

export default function CareerChangeMinigame() {
  const { gameState, handleChangeCareer } = useGame();
  const router = useRouter();

  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [currentGameState, setCurrentGameState] = useState<GameState>(GameState.Idle);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [selectedNewCareer, setSelectedNewCareer] = useState<Career | null>(null);

  const availableCareers = CAREER_DATA.filter(c => c.id !== gameState?.playerStats.career);

  const startNewRound = useCallback(() => {
    setCurrentGameState(GameState.ShowingSequence);
    setPlayerInput([]);
    setSequence(prev => [...prev, Math.floor(Math.random() * availableCareers.length)]);
  }, [availableCareers.length]);

  useEffect(() => {
    if (currentGameState !== GameState.ShowingSequence) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setHighlightedIndex(sequence[i]);
        setTimeout(() => setHighlightedIndex(null), HIGHLIGHT_DURATION);
        i++;
      } else {
        clearInterval(interval);
        setCurrentGameState(GameState.PlayerTurn);
      }
    }, SEQUENCE_DELAY);

    return () => clearInterval(interval);
  }, [currentGameState, sequence]);

  const handlePlayerClick = (index: number) => {
    if (currentGameState !== GameState.PlayerTurn) return;

    const newPlayerInput = [...playerInput, index];
    setPlayerInput(newPlayerInput);

    if (newPlayerInput[newPlayerInput.length - 1] !== sequence[newPlayerInput.length - 1]) {
      setCurrentGameState(GameState.Failed);
      return;
    }

    if (newPlayerInput.length === sequence.length) {
      if (level >= 3) {
        setCurrentGameState(GameState.Success);
      } else {
        setLevel(prev => prev + 1);
        setTimeout(() => startNewRound(), 500);
      }
    }
  };
  
  const handleStartGame = () => {
    setLevel(1);
    setSequence([]);
    setPlayerInput([]);
    startNewRound();
  };

  const handleRetry = () => {
    setCurrentGameState(GameState.Idle);
    setSequence([]);
    setPlayerInput([]);
    setLevel(1);
  }

  const handleConfirmCareerChange = () => {
      if (selectedNewCareer) {
          handleChangeCareer(selectedNewCareer);
          router.push('/captain');
      }
  }
  
  const renderGameContent = () => {
      if (currentGameState === GameState.Success) {
          return (
              <div className="text-center space-y-4">
                  <Check className="h-16 w-16 mx-auto text-green-500"/>
                  <h3 className="text-xl font-bold">Aptitude Test Passed!</h3>
                  <p className="text-muted-foreground">You have demonstrated the mental flexibility required for a new path. Please select your new career.</p>
                  <div className="flex justify-center gap-4">
                      <Select onValueChange={(value) => setSelectedNewCareer(value as Career)}>
                          <SelectTrigger className="w-[280px]">
                              <SelectValue placeholder="Select a new career" />
                          </SelectTrigger>
                          <SelectContent>
                              {availableCareers.map(career => (
                                  <SelectItem key={career.id} value={career.id}>{career.name}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                      <Button onClick={handleConfirmCareerChange} disabled={!selectedNewCareer}>Confirm <ArrowRight className="ml-2"/></Button>
                  </div>
              </div>
          )
      }
       if (currentGameState === GameState.Failed) {
          return (
              <div className="text-center space-y-4">
                  <h3 className="text-xl font-bold text-destructive">Sequence Incorrect</h3>
                  <p className="text-muted-foreground">Your focus wavered. Please try again to prove your aptitude.</p>
                  <Button onClick={handleRetry}>Retry Test</Button>
              </div>
          )
      }

      return (
           <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-card/50">
                    <div className="text-sm">Level: <span className="font-mono text-primary">{level} / 3</span></div>
                     <div className="text-sm">Sequence Length: <span className="font-mono text-primary">{sequence.length}</span></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {availableCareers.map((career, index) => {
                    const Icon = career.icon as LucideIcon;
                    return (
                        <Button
                            key={career.id}
                            variant="outline"
                            className={cn(
                                "h-28 w-full flex-col gap-2 transition-all duration-150",
                                highlightedIndex === index && 'bg-primary/80 scale-105 border-primary',
                            )}
                            onClick={() => handlePlayerClick(index)}
                            disabled={currentGameState !== GameState.PlayerTurn}
                        >
                            <Icon className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                            <span className="text-xs">{career.name}</span>
                        </Button>
                    );
                  })}
                </div>
            </div>
      )
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-lg flex items-center justify-center gap-2">
          <Brain className="text-primary" />
          Career Aptitude Test
        </CardTitle>
        <CardDescription>
          Memorize and repeat the flashing sequences to prove your cognitive flexibility. Succeed to unlock a new career path.
        </CardDescription>
      </CardHeader>
      <CardContent>
          {currentGameState === GameState.Idle ? (
               <div className="text-center py-8">
                    <Button onClick={handleStartGame} size="lg">
                        <Zap className="mr-2"/> Start Test
                    </Button>
               </div>
          ) : renderGameContent()}
      </CardContent>
    </Card>
  );
}
