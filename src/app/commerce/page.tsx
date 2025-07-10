
'use client';

import CommerceClicker from '@/app/components/commerce-clicker';
import MarketFrenzyMinigame from '@/app/components/market-frenzy-minigame';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

export default function CommercePage() {
    return (
        <div className="space-y-6">
            <CommerceClicker />
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Briefcase className="text-primary"/>
                        Training Simulators
                    </CardTitle>
                    <CardDescription>Hone your trading skills and earn extra credits.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MarketFrenzyMinigame />
                </CardContent>
            </Card>
        </div>
    );
}
