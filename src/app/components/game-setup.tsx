'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, Skull, Star, LucideIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Difficulty, Career as CareerType } from '@/lib/types';
import { CAREER_DATA } from '@/lib/careers';
import { useRouter } from 'next/navigation';

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

const DifficultySelector = ({ onSelect }: { onSelect: (difficulty: Difficulty) => void }) => (
    <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">Choose Your Difficulty</CardTitle>
            <CardDescription>Select the challenge level for your space trading adventure.</CardDescription>
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
                                    <AlertDialogAction onClick={() => onSelect('Hardcore')}>I Understand The Risks</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )
                }
                return (
                     <Button key={difficulty} variant="outline" className="h-full flex-col p-4 text-left items-start gap-2 whitespace-normal" onClick={() => onSelect(difficulty)}>
                        <Icon className="h-6 w-6 text-primary"/>
                        <h3 className="font-bold">{title}</h3>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </Button>
                )
            })}
        </CardContent>
    </Card>
);

const CareerSelector = ({ onSelect }: { onSelect: (career: CareerType) => void }) => (
    <Card className="w-full max-w-6xl">
        <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">Select Your Career</CardTitle>
            <CardDescription>Your choice will determine your starting conditions and unlock unique gameplay opportunities.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAREER_DATA.map((career) => {
                const CareerIcon = career.icon as LucideIcon;
                return (
                <Card key={career.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-lg">
                            <CareerIcon className="text-primary" />
                            {career.name}
                        </CardTitle>
                        <CardDescription className="text-xs">{career.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs flex-grow">
                        <div>
                            <h4 className="font-semibold text-primary/90">Perks:</h4>
                            <ul className="list-disc list-inside text-muted-foreground">
                                {career.perks.map((perk, i) => <li key={i}>{perk}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-destructive/90">Risks:</h4>
                            <ul className="list-disc list-inside text-muted-foreground">
                                {career.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                            </ul>
                        </div>
                    </CardContent>
                    <CardContent>
                        <Button className="w-full" onClick={() => onSelect(career.id)}>Choose {career.name}</Button>
                    </CardContent>
                </Card>
            )})}
        </CardContent>
    </Card>
);

export default function GameSetup() {
    const { startNewGame, isGeneratingNewGame } = useGame();
    const router = useRouter();
    const [step, setStep] = useState<'difficulty' | 'career'>('difficulty');
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

    const handleDifficultySelect = (difficulty: Difficulty) => {
        setSelectedDifficulty(difficulty);
        setStep('career');
    };

    const handleCareerSelect = async (career: CareerType) => {
        if (selectedDifficulty) {
            await startNewGame(selectedDifficulty, career);
            router.push('/captain');
        }
    };

    if (isGeneratingNewGame) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center space-y-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <h2 className="text-2xl font-headline text-primary">Generating Your Galaxy...</h2>
                <p className="text-muted-foreground">Calibrating star charts and preparing your new career.</p>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full items-start justify-center overflow-y-auto bg-background p-4 pt-8 md:items-center md:py-4">
            {step === 'difficulty' && <DifficultySelector onSelect={handleDifficultySelect} />}
            {step === 'career' && <CareerSelector onSelect={handleCareerSelect} />}
        </div>
    );
}
