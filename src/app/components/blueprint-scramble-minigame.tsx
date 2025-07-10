
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Wrench, Zap, LucideIcon, Power, Wind, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const GRID_SIZE = 9;
const GAME_DURATION = 30; // seconds

enum GameState {
  Idle,
  Playing,
  Finished,
}

type PieceType = 'power' | 'life-support' | 'structure' | 'empty';
const pieceTypes: PieceType[] = ['power', 'life-support', 'structure'];

const pieceConfig: Record<PieceType, { icon: LucideIcon, color: string }> = {
    'power': { icon: Power, color: 'text-amber-400' },
    'life-support': { icon: Wind, color: 'text-sky-400' },
    'structure': { icon: Shield, color: 'text-gray-400' },
    'empty': { icon: () => null, color: '' }
};

const generateBlueprint = (): PieceType[] => {
    const blueprint = Array(GRID_SIZE).fill('empty');
    const pieceCount = 4 + Math.floor(Math.random() * 3); // 4 to 6 pieces
    for (let i = 0; i < pieceCount; i++) {
        let index = Math.floor(Math.random() * GRID_SIZE);
        while (blueprint[index] !== 'empty') {
            index = Math.floor(Math.random() * GRID_SIZE);
        }
        blueprint[index] = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
    }
    return blueprint;
};

export default function BlueprintScrambleMinigame() {
    const { handleBlueprintScrambleScore } = useGame();
    const [gameState, setGameState] = useState<GameState>(GameState.Idle);
    const [blueprint, setBlueprint] = useState<PieceType[]>([]);
    const [playerGrid, setPlayerGrid] = useState<PieceType[]>(Array(GRID_SIZE).fill('empty'));
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [score, setScore] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startNewRound = useCallback(() => {
        setBlueprint(generateBlueprint());
        setPlayerGrid(Array(GRID_SIZE).fill('empty'));
    }, []);

    const startGame = () => {
        setGameState(GameState.Playing);
        setTimeLeft(GAME_DURATION);
        setScore(0);
        startNewRound();
    };

    const stopGame = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setGameState(GameState.Finished);
        handleBlueprintScrambleScore(score);
    }, [handleBlueprintScrambleScore, score]);

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

    const handleDrop = (index: number, piece: PieceType) => {
        const newGrid = [...playerGrid];
        newGrid[index] = piece;
        setPlayerGrid(newGrid);

        if (newGrid.join('') === blueprint.join('')) {
            const roundScore = 500 + timeLeft * 10;
            setScore(prev => prev + roundScore);
            startNewRound();
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, piece: PieceType) => {
        e.dataTransfer.setData('pieceType', piece);
    }
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }
    
    const handleCellDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        const pieceType = e.dataTransfer.getData('pieceType') as PieceType;
        handleDrop(index, pieceType);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Wrench className="text-primary" />
                    Blueprint Scramble
                </CardTitle>
                <CardDescription>
                    Drag components to match the target blueprint before time runs out.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-card/50">
                    <div className="text-sm">Score: <span className="font-mono text-amber-300">{score.toLocaleString()}</span></div>
                    <div className="text-sm">Time Left: <span className={cn("font-mono", timeLeft < 6 && 'text-destructive animate-pulse')}>{timeLeft}s</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h4 className="text-center text-xs text-muted-foreground">Target Blueprint</h4>
                        <div className="grid grid-cols-3 gap-1 p-2 rounded-md bg-background/50 border">
                            {blueprint.map((piece, index) => {
                                const Icon = pieceConfig[piece].icon;
                                return <div key={index} className="h-16 flex items-center justify-center bg-muted/30 rounded-sm"><Icon className={cn("h-6 w-6", pieceConfig[piece].color)} /></div>
                            })}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <h4 className="text-center text-xs text-muted-foreground">Your Assembly</h4>
                        <div className="grid grid-cols-3 gap-1 p-2 rounded-md bg-background/50 border">
                             {playerGrid.map((piece, index) => {
                                const Icon = pieceConfig[piece].icon;
                                return <div key={index} onDrop={(e) => handleCellDrop(e, index)} onDragOver={handleDragOver} className="h-16 flex items-center justify-center bg-muted/50 rounded-sm border border-dashed border-transparent hover:border-primary transition-colors"><Icon className={cn("h-6 w-6", pieceConfig[piece].color)} /></div>
                            })}
                        </div>
                    </div>
                </div>

                {gameState === GameState.Playing && (
                    <div className="flex justify-center gap-2 pt-4 border-t">
                        {pieceTypes.map(piece => {
                             const Icon = pieceConfig[piece].icon;
                            return (
                                <Button key={piece} variant="outline" draggable onDragStart={(e) => handleDragStart(e, piece)} className="cursor-grab">
                                    <Icon className={cn("h-5 w-5 mr-2", pieceConfig[piece].color)} />
                                    {piece.replace('-', ' ')}
                                </Button>
                            )
                        })}
                    </div>
                )}
                
                {gameState !== GameState.Playing && (
                    <div className="text-center space-y-2">
                         {gameState === GameState.Finished && <p className="font-bold text-lg">Final Score: {score.toLocaleString()}¢</p>}
                        <Button onClick={startGame} className="w-full">
                            <Zap className="mr-2"/> {gameState === GameState.Idle ? 'Start Simulation' : 'Run New Simulation'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
