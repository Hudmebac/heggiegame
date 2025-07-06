'use client';
import GalaxyMap from "@/app/components/galaxy-map";
import { useGame } from "@/app/components/game-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ShieldCheck, Factory, Wheat, Cpu, Hammer, Recycle } from "lucide-react";

export default function GalaxyPage() {
    const { gameState, handleInitiateTravel } = useGame();

    if (!gameState) return null;

    const currentSystemInfo = gameState.systems.find(s => s.name === gameState.currentSystem);
    
    if (!currentSystemInfo) return null;

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

    return (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-3">
                <GalaxyMap
                    systems={gameState.systems}
                    routes={gameState.routes}
                    currentSystem={gameState.currentSystem}
                    onTravel={handleInitiateTravel}
                />
            </div>
            <div className="xl:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">System Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
