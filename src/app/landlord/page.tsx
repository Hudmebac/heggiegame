
'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LandPlot, Home, Briefcase, Factory, Ticket, Shield, ChevronsUp, UserPlus } from 'lucide-react';
import type { Property, PropertyType } from '@/lib/types';
import { propertyUpgrades } from '@/lib/property-upgrades';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import CooldownTimer from '@/app/components/cooldown-timer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const propertyTypeConfig: { type: PropertyType; icon: React.ElementType }[] = [
    { type: 'Residential', icon: Home },
    { type: 'Commercial', icon: Briefcase },
    { type: 'Industrial', icon: Factory },
    { type: 'Recreational', icon: Ticket },
    { type: 'Military', icon: Shield },
];

const UpgradeDialog = ({ property }: { property: Property }) => {
    const { gameState, handleUpgradeProperty } = useGame();
    if (!gameState) return null;
    
    const upgradeLevels = propertyUpgrades[property.type.toLowerCase() as keyof typeof propertyUpgrades];
    if (!upgradeLevels) return null;

    const currentLevel = property[`${property.type.toLowerCase()}Level` as keyof Property] as number || 0;

    return (
        <div className="space-y-2">
            {upgradeLevels.map(upgrade => {
                const isCurrent = upgrade.level === currentLevel;
                const isNext = upgrade.level === currentLevel + 1;
                const cost = 10000 * upgrade.level; // Placeholder cost
                const canAfford = gameState.playerStats.netWorth >= cost;
                return (
                    <div key={upgrade.level} className="flex justify-between items-center text-sm p-2 rounded-md bg-background/50">
                        <div>
                            <p className={isCurrent ? 'font-bold text-primary' : ''}>Lvl {upgrade.level}: {upgrade.upgrade}</p>
                            <p className="text-xs text-muted-foreground">{upgrade.effect}</p>
                        </div>
                        {isNext && (
                            <Button size="sm" onClick={() => handleUpgradeProperty(property.id, property.type)} disabled={!canAfford}>
                                Upgrade ({cost.toLocaleString()}¢)
                            </Button>
                        )}
                    </div>
                )
            })}
        </div>
    );
};


const PropertyCard = ({ property }: { property: Property }) => {
    const Icon = propertyTypeConfig.find(p => p.type === property.type)?.icon || LandPlot;
    const currentLevel = property[`${property.type.toLowerCase()}Level` as keyof Property] as number || 0;

    return (
         <Card className="bg-card/50">
            <CardHeader>
                <CardTitle className="text-base flex justify-between items-start">
                    <span className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {property.name}
                    </span>
                    <Badge variant="outline">{property.systemName}</Badge>
                </CardTitle>
                <CardDescription>
                    {property.type} Property - Level {currentLevel}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {property.status === 'Upgrading' && property.upgradeStartTime && property.upgradeDuration ? (
                    <div className="space-y-2">
                        <p className="text-xs text-cyan-400 text-center">Upgrading: {property.upgradingComponent}</p>
                        <Progress value={ (1 - ((property.upgradeStartTime + property.upgradeDuration) - Date.now()) / property.upgradeDuration) * 100 } />
                        <p className="text-xs text-muted-foreground text-center">
                            <CooldownTimer expiry={property.upgradeStartTime + property.upgradeDuration} />
                        </p>
                    </div>
                ) : (
                     <Accordion type="single" collapsible>
                        <AccordionItem value="upgrades">
                            <AccordionTrigger>Show Upgrades</AccordionTrigger>
                            <AccordionContent>
                                <UpgradeDialog property={property} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
            </CardContent>
        </Card>
    )
}

export default function LandlordPage() {
    const { gameState, handlePurchaseProperty } = useGame();

    if (!gameState) return null;

    const { playerStats } = gameState;
    const { properties } = playerStats;

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
                    {propertyTypeConfig.map(({ type, icon: Icon }) => (
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
                    {properties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {properties.map(prop => <PropertyCard key={prop.id} property={prop}/>)}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">You do not own any properties. Purchase one to get started.</p>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Lease Management</CardTitle>
                    <CardDescription>Find tenants and manage your leases.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button>
                        <UserPlus className="mr-2"/> Find Tenants
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

