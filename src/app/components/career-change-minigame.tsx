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
  Finished,
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

    if (index !== sequence[newPlayerInput.length - 1]) {
      // Wrong sequence
      setCurrentGameState(GameState.Finished);
      return;
    }

    if (newPlayerInput.length === sequence.length) {
      // Correct sequence
      if (level >= 8) {
        setLevel(prev => prev + 1); // Final level is 9, indicating 8 completed rounds.
        setCurrentGameState(GameState.Finished);
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
    setSelectedNewCareer(null);
  }

  const handleConfirmCareerChange = () => {
      if (selectedNewCareer) {
          handleChangeCareer(selectedNewCareer);
          router.push('/captain');
      }
  }
  
  const renderGameContent = () => {
      if (currentGameState === GameState.Finished) {
          const completedRounds = Math.max(0, level - 1);
          // Use the master CAREER_DATA list for tiered unlocks, based on the original order
          const careersToOffer = CAREER_DATA.slice(0, completedRounds);
          // Filter out the player's current career from the unlocked list
          const unlockedCareers = careersToOffer.filter(c => c.id !== gameState?.playerStats.career);
          
          return (
              <div className="text-center space-y-4">
                  <Check className="h-16 w-16 mx-auto text-green-500"/>
                  <h3 className="text-xl font-bold">Aptitude Test Finished!</h3>
                  <p className="text-muted-foreground">
                      You successfully completed {completedRounds} round(s). 
                      {unlockedCareers.length > 0 
                          ? " Please select a new career from the ones you have unlocked." 
                          : " Please try again to unlock a new career path."
                      }
                  </p>
                  {unlockedCareers.length > 0 ? (
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                          <Select onValueChange={(value) => setSelectedNewCareer(value as Career)}>
                              <SelectTrigger className="w-full sm:w-[280px]">
                                  <SelectValue placeholder="Select an unlocked career" />
                              </SelectTrigger>
                              <SelectContent>
                                  {unlockedCareers.map(career => (
                                      <SelectItem key={career.id} value={career.id}>{career.name}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                          <Button onClick={handleConfirmCareerChange} disabled={!selectedNewCareer} className="w-full sm:w-auto">
                              Confirm <ArrowRight className="ml-2"/>
                          </Button>
                      </div>
                  ) : (
                      <Button onClick={handleRetry}>Retry Test</Button>
                  )}
              </div>
          )
      }

      return (
           <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-card/50">
                    <div className="text-sm">Level: <span className="font-mono text-primary">{level} / 8</span></div>
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
                            <span className="text-xs text-center">{career.name}</span>
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
