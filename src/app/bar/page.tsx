
'use client';

import BarClicker from '@/app/components/bar-clicker';
import MixAndMatchMinigame from '@/app/components/mix-and-match-minigame';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Martini } from 'lucide-react';

export default function BarPage() {
    return (
        <div className="space-y-6">
            <BarClicker />
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Martini className="text-primary"/>
                        Training Simulators
                    </CardTitle>
                    <CardDescription>Hone your bartending skills and earn extra credits.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MixAndMatchMinigame />
                </CardContent>
            </Card>
        </div>
    );
}
