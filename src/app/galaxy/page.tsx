
'use client';
import { useState } from 'react';
import GalaxyMap from "@/app/components/galaxy-map";
import PlanetMap from "@/app/components/planet-map";
import { useGame } from "@/app/components/game-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, ShieldCheck, Factory, Wheat, Cpu, Hammer, Recycle, Globe, Orbit as PlanetIcon } from "lucide-react";
import { PLANET_TYPE_MODIFIERS } from "@/lib/utils";
import OpenRouteDialog from '@/app/components/open-route-dialog';

export default function GalaxyPage() {
    const { gameState, handleInitiateTravel, handlePlanetTravel } = useGame();
    const [negotiationRoute, setNegotiationRoute] = useState<{from: string, to: string} | null>(null);

    if (!gameState) return null;

    const currentSystemInfo = gameState.systems.find(s => s.name === gameState.currentSystem);
    
    if (!currentSystemInfo) return null;

    const currentPlanetInfo = currentSystemInfo.planets.find(p => p.name === gameState.currentPlanet);

    const securityConfig = {
        'High': { color: 'text-green-400', icon: <ShieldCheck className="h-4 w-4"/>, activity: 'Low' },
        'Medium': { color: 'text-yellow-400', icon: <ShieldCheck className="h-4 w-4"/>, activity: 'Normal' },
        'Low': { color: 'text-orange-400', icon: <AlertTriangle className="h-4 w-4"/>, activity: 'High' },
        'Anarchy': { color: 'text-destructive', icon: <AlertTriangle className="h-4 w-4"/>, activity: 'Rampant' },
    }

    const economyIcons = {
        'Industrial': <Factory className="h-4 w-4"/>,
        'Agricultural': <Wheat className="h-4 w-4"/>,
        'High-Tech': <Cpu className="h-4 w-4"/>,
        'Extraction': <Hammer className="h-4 w-4"/>,
        'Refinery': <Recycle className="h-4 w-4"/>,
    }
    
    const currentSecurity = securityConfig[currentSystemInfo.security];

    const handleInitiateNegotiation = (from: string, to: string) => {
        setNegotiationRoute({from, to});
    };

    return (
        <>
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-3">
                    <GalaxyMap
                        systems={gameState.systems}
                        routes={gameState.routes}
                        currentSystem={gameState.currentSystem}
                        onTravel={handleInitiateTravel}
                        onNegotiate={handleInitiateNegotiation}
                    />
                </div>
                <div className="xl:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center gap-2"><Globe className="text-primary" /> System Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">System Name</span>
                                <span className="font-mono text-primary">{currentSystemInfo.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Security Status</span>
                                <span className={`font-mono flex items-center gap-2 ${currentSecurity.color}`}>
                                    {currentSecurity.icon}
                                    {currentSystemInfo.security}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Primary Economy</span>
                                <span className="font-mono flex items-center gap-2 text-primary">
                                    {economyIcons[currentSystemInfo.economy]}
                                    {currentSystemInfo.economy}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Pirate Activity</span>
                                <span className={`font-mono ${currentSecurity.color}`}>{currentSecurity.activity}</span>
                            </div>
                            <CardDescription className="pt-2 border-t mt-2">{currentSystemInfo.description}</CardDescription>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center gap-2"><PlanetIcon className="text-primary" /> System Map: {currentSystemInfo.name}</CardTitle>
                            <CardDescription>Click on a planet to travel within the system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PlanetMap 
                                planets={currentSystemInfo.planets}
                                currentPlanet={gameState.currentPlanet}
                                onPlanetTravel={handlePlanetTravel}
                            />
                        </CardContent>
                    </Card>
                    {currentPlanetInfo && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-lg flex items-center gap-2"><PlanetIcon className="text-primary" /> Planet Details: {currentPlanetInfo.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Planet Type</span>
                                    <span className="font-mono text-primary">{currentPlanetInfo.type}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Business Income Modifier</span>
                                    <span className="font-mono text-primary">{Math.round(PLANET_TYPE_MODIFIERS[currentPlanetInfo.type] * 100)}%</span>
                                </div>
                                <p className="text-muted-foreground pt-2 border-t mt-2">{currentPlanetInfo.description}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            <OpenRouteDialog
                isOpen={!!negotiationRoute}
                onOpenChange={(open) => !open && setNegotiationRoute(null)}
                route={negotiationRoute}
            />
        </>
    )
}
