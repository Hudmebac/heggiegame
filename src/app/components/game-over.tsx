
'use client';

import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skull, RefreshCw } from 'lucide-react';

export default function GameOver() {
    const { handleResetGame } = useGame();

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center border-destructive">
                <CardHeader>
                    <div className="mx-auto bg-destructive/20 p-4 rounded-full w-fit">
                        <Skull className="h-12 w-12 text-destructive" />
                    </div>
                    <CardTitle className="font-headline text-3xl text-destructive pt-4">Game Over</CardTitle>
                    <CardDescription>Your journey has ended. The galaxy is unforgiving. All progress has been lost.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleResetGame} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Start a New Game
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
