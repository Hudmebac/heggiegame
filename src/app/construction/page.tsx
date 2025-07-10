
'use client';

import ConstructionClicker from '@/app/components/construction-clicker';
import BlueprintScrambleMinigame from '@/app/components/blueprint-scramble-minigame';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export default function ConstructionPage() {
    return (
        <div className="space-y-6">
            <ConstructionClicker />
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Building2 className="text-primary"/>
                        Training Simulators
                    </CardTitle>
                    <CardDescription>Hone your architectural skills and earn extra credits.</CardDescription>
                </CardHeader>
                <CardContent>
                    <BlueprintScrambleMinigame />
                </CardContent>
            </Card>
        </div>
    );
}
