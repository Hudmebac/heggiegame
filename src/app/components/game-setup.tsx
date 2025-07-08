
'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, Skull, Star } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Difficulty } from '@/lib/types';

const difficultyLevels: Record<Difficulty, { title: string; description: string; icon: React.ElementType }> = {
    Easy: {
        title: 'Easy',
        description: 'A more relaxed experience. Pirate encounters are less frequent and less dangerous. Perfect for learning the ropes.',
        icon: Star,
    },
    Medium: {
        title: 'Medium',
        description: 'The standard HEGGIE experience. A balanced challenge with moderate risks and rewards.',
        icon: Shield,
    },
    Hard: {
        title: 'Hard',
        description: 'A tough challenge for veteran traders. Pirate activity is high, and threats are more severe.',
        icon: Skull,
    },
    Hardcore: {
        title: 'Hardcore',
        description: 'Medium difficulty with permadeath. If your ship is destroyed, your game is over. No second chances.',
        icon: Skull,
    },
};

export default function GameSetup() {
    const { startNewGame, isGeneratingNewGame } = useGame();

    const handleSelect = (difficulty: Difficulty) => {
        startNewGame(difficulty);
    };

    if (isGeneratingNewGame) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center space-y-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h2 className="text-2xl font-headline text-primary">Generating Your Galaxy...</h2>
                <p className="text-muted-foreground">Calibrating star charts and preparing trade routes.</p>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background p-4">
            <Card className="w-full max-w-4xl">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">Welcome to HEGGIE</CardTitle>
                    <CardDescription>Choose your difficulty to begin your space trading adventure.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(difficultyLevels).map(([key, { title, description, icon: Icon }]) => {
                        const difficulty = key as Difficulty;
                        if (difficulty === 'Hardcore') {
                            return (
                                <AlertDialog key={difficulty}>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="h-full flex-col p-4 text-left items-start gap-2 whitespace-normal">
                                            <Icon className="h-6 w-6" />
                                            <h3 className="font-bold">{title}</h3>
                                            <p className="text-xs text-destructive-foreground/80">{description}</p>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirm Hardcore Mode</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure? In Hardcore mode, if your ship is destroyed, your save file will be permanently deleted. There are no rebirths or second chances.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleSelect('Hardcore')}>I Understand The Risks</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )
                        }
                        return (
                             <Button key={difficulty} variant="outline" className="h-full flex-col p-4 text-left items-start gap-2 whitespace-normal" onClick={() => handleSelect(difficulty)}>
                                <Icon className="h-6 w-6 text-primary"/>
                                <h3 className="font-bold">{title}</h3>
                                <p className="text-xs text-muted-foreground">{description}</p>
                            </Button>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
