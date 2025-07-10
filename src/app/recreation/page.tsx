
'use client';

import RecreationClicker from '@/app/components/recreation-clicker';
import HolotagArenaMinigame from '@/app/components/holotag-arena-minigame';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ticket } from 'lucide-react';

export default function RecreationPage() {
    return (
        <div className="space-y-6">
            <RecreationClicker />
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Ticket className="text-primary"/>
                        Training Simulators
                    </CardTitle>
                    <CardDescription>Hone your skills and earn extra credits.</CardDescription>
                </CardHeader>
                <CardContent>
                    <HolotagArenaMinigame />
                </CardContent>
            </Card>
        </div>
    );
}
