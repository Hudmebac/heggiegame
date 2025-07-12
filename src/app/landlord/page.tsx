
'use client';

import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LandPlot, Home, Briefcase, Factory, Ticket, Shield } from 'lucide-react';
import type { PropertyType } from '@/lib/types';

const propertyTypes: { type: PropertyType; icon: React.ElementType }[] = [
    { type: 'Residential', icon: Home },
    { type: 'Commercial', icon: Briefcase },
    { type: 'Industrial', icon: Factory },
    { type: 'Recreational', icon: Ticket },
    { type: 'Military', icon: Shield },
];

export default function LandlordPage() {
    const { gameState, handlePurchaseProperty } = useGame();

    if (!gameState) return null;

    const { playerStats } = gameState;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <LandPlot className="text-primary" />
                        Galactic Real Estate
                    </CardTitle>
                    <CardDescription>
                        As a Landlord, your empire is built on property. Acquire, upgrade, and lease properties across the galaxy to generate a steady stream of income and influence.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Acquire New Property</CardTitle>
                    <CardDescription>Purchase new properties in the current system. Each purchase takes 10 seconds to finalize.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {propertyTypes.map(({ type, icon: Icon }) => (
                        <Button key={type} className="flex-col h-24" onClick={() => handlePurchaseProperty(type)}>
                            <Icon className="h-8 w-8 mb-2" />
                            Buy {type}
                        </Button>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Your Portfolio</CardTitle>
                    <CardDescription>An overview of all properties you own.</CardDescription>
                </CardHeader>
                <CardContent>
                    {playerStats.properties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Property cards will go here */}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">You do not own any properties. Purchase one to get started.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
