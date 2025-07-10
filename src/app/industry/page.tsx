'use client';

import IndustryClicker from '@/app/components/industry-clicker';
import MachinistMemoryMinigame from '@/app/components/machinist-memory-minigame';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Factory } from 'lucide-react';

export default function IndustryPage() {
    return (
        <div className="space-y-6">
            <IndustryClicker />
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Factory className="text-primary"/>
                        Training Simulators
                    </CardTitle>
                    <CardDescription>Hone your industrial skills and earn extra credits.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MachinistMemoryMinigame />
                </CardContent>
            </Card>
        </div>
    );
}
