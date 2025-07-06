'use client';
import GalaxyMap from "@/app/components/galaxy-map";
import { useGame } from "@/app/components/game-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export default function GalaxyPage() {
    const { gameState, handleInitiateTravel } = useGame();

    if (!gameState) return null;

    const currentSystemInfo = {
        name: gameState.currentSystem,
        status: "Secure",
        activity: "Normal"
    }

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
                            <span className={`font-mono flex items-center gap-2 ${currentSystemInfo.status === 'Secure' ? 'text-green-400' : 'text-red-400'}`}>
                                {currentSystemInfo.status === 'Secure' ? <ShieldCheck className="h-4 w-4"/> : <AlertTriangle className="h-4 w-4"/>}
                                {currentSystemInfo.status}
                            </span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Pirate Activity</span>
                             <span className="font-mono text-primary">{currentSystemInfo.activity}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
