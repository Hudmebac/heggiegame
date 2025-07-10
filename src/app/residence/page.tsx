
'use client';

import ResidenceClicker from '@/app/components/residence-clicker';
import KeypadCrackerMinigame from '@/app/components/keypad-cracker-minigame';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Home } from 'lucide-react';

export default function ResidencePage() {
    return (
        <div className="space-y-6">
            <ResidenceClicker />
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Home className="text-primary"/>
                        Training Simulators
                    </CardTitle>
                    <CardDescription>Hone your property management skills and earn extra credits.</CardDescription>
                </CardHeader>
                <CardContent>
                    <KeypadCrackerMinigame />
                </CardContent>
            </Card>
        </div>
    );
}
