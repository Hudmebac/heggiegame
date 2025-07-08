'use client';

import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck, Coins, ArrowRight, Hourglass, Loader2, FileText, Anchor, Rocket, Sword } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { PlayerShip } from '@/lib/types';
import DefenceMinigame from '@/app/components/defence-minigame';
import AssaultMinigame from '@/app/components/assault-minigame';
import { hullUpgrades } from '@/lib/upgrades';

const riskColorMap = {
    'Low': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const missionTypeIcons: Record<string, React.ElementType> = {
    'VIP Escort': ShieldCheck,
    'Cargo Convoy': Anchor,
    'Data Runner': FileText,
}

const FleetStatus = ({ fleet, activeMissions }: { fleet: PlayerShip[], activeMissions: any[] }) => {
    const assignedShipIds = new Set(activeMissions.map(m => m.assignedShipInstanceId));
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Rocket className="text-primary"/>
                    Fleet Status
                </CardTitle>
                <CardDescription>Your ships available for escort missions. Damaged ships must be repaired on the Ship page.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fleet.map(ship => {
                    const isAssigned = assignedShipIds.has(ship.instanceId);
                    const mission = isAssigned ? activeMissions.find(m => m.assignedShipInstanceId === ship.instanceId) : null;
                    const maxHealth = hullUpgrades[ship.hullLevel - 1]?.health || 100;

                    return (
                        <div key={ship.instanceId} className={cn("p-3 rounded-md border", isAssigned ? "bg-muted/50 border-amber-500/30" : ship.status === 'repair_needed' ? 'bg-destructive/10 border-destructive/30' : "bg-card/50")}>
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-sm">{ship.name}</h4>
                                {isAssigned ? (
                                    <Badge variant="outline" className="text-amber-400 border-amber-500/30">On Mission</Badge>
                                ) : ship.status === 'repair_needed' ? (
                                    <Badge variant="destructive">Repair Needed</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-green-400 border-green-500/30">Available</Badge>
                                )}
                            </div>
                             <div className="text-xs text-muted-foreground space-y-1 mt-2">
                                <p>{isAssigned ? `Escorting to ${mission?.toSystem}` : "Awaiting orders"}</p>
                                <Progress value={(ship.health / maxHealth) * 100} indicatorClassName={cn(ship.health < maxHealth * 0.25 ? 'bg-destructive' : ship.health < maxHealth * 0.5 ? 'bg-yellow-500' : 'bg-green-400')} />
                                <div className="text-right font-mono">{ship.health.toFixed(0)} / {maxHealth} HP</div>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    );
};


export default function DefencePage() {
    const { gameState, handleGenerateEscortMissions, handleAcceptEscortMission, isGeneratingMissions } = useGame();

    if (!gameState) return null;

    const { playerStats } = gameState;
    const { escortMissions = [] } = playerStats;

    const availableMissions = escortMissions.filter(m => m.status === 'Available');
    const activeMissions = escortMissions.filter(m => m.status === 'Active');
    const assignedShipIds = new Set(activeMissions.map(m => m.assignedShipInstanceId));
    const hasAvailableShips = playerStats.fleet.some(s => s.status === 'operational' && !assignedShipIds.has(s.instanceId));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Shield className="text-primary" />
                        Aegis Command
                    </CardTitle>
                    <CardDescription>
                        As a Defender, your duty is to protect the spacelanes. Assign ships to escort missions or run planetary defense simulations to earn credits and bolster galactic security.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGenerateEscortMissions} disabled={isGeneratingMissions}>
                        {isGeneratingMissions ? <Loader2 className="mr-2 animate-spin" /> : <FileText className="mr-2" />}
                        Scan for Escort Contracts
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Sword className="text-primary"/>
                        Training Simulators
                    </CardTitle>
                    <CardDescription>Hone your skills and earn extra credits.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DefenceMinigame />
                    <AssaultMinigame />
                </CardContent>
            </Card>

            <FleetStatus fleet={playerStats.fleet} activeMissions={activeMissions} />

            {activeMissions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2"><Hourglass className="text-primary"/> Active Escorts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeMissions.map(mission => {
                            const Icon = missionTypeIcons[mission.missionType];
                            return (
                            <Card key={mission.id} className="bg-card/50">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                          <CardTitle className="text-base flex items-center gap-2"><Icon className="text-primary/80"/> {mission.clientName}</CardTitle>
                                          <CardDescription className="text-xs">{mission.description}</CardDescription>
                                        </div>
                                        <Badge variant="outline" className={riskColorMap[mission.riskLevel]}>{mission.riskLevel} Risk</Badge>
                                    </div>
                                    <div className="text-sm font-semibold flex items-center gap-2 pt-1">
                                        <span>{mission.fromSystem}</span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        <span>{mission.toSystem}</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                         <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="text-muted-foreground">Assigned Ship: <span className="font-semibold text-foreground">{mission.assignedShipName}</span></span>
                                            <span>En route...</span>
                                        </div>
                                        <Progress value={mission.progress || 0} />
                                        <div className="flex justify-end text-xs text-muted-foreground">
                                            <span>Payout: <span className="font-mono text-amber-300">{mission.payout.toLocaleString()}¢</span></span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )})}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><FileText className="text-primary"/> Available Contracts</CardTitle>
                    {!hasAvailableShips && (
                        <CardDescription className="text-amber-400">All operational ships are currently assigned. You must have an available ship to accept new contracts.</CardDescription>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {isGeneratingMissions && availableMissions.length === 0 ? (
                        <div className="text-center text-muted-foreground p-8">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                            <p>Scanning security channels for contracts...</p>
                        </div>
                    ) : availableMissions.length > 0 ? (
                        availableMissions.map(mission => {
                            const Icon = missionTypeIcons[mission.missionType];
                            return (
                            <Card key={mission.id} className="bg-card/50">
                                <CardHeader>
                                     <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base flex items-center gap-2"><Icon className="text-primary/80"/> {mission.clientName}</CardTitle>
                                            <CardDescription className="text-xs">{mission.description}</CardDescription>
                                        </div>
                                        <Badge variant="outline" className={riskColorMap[mission.riskLevel]}>{mission.riskLevel} Risk</Badge>
                                    </div>
                                    <div className="text-sm font-semibold flex items-center gap-2 pt-1">
                                        <span>{mission.fromSystem}</span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        <span>{mission.toSystem}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex justify-between items-center">
                                    <div className="text-sm space-y-1">
                                        <p className="flex items-center gap-2"><Coins className="h-4 w-4 text-amber-300" /> Payout: <span className="font-mono text-amber-300">{mission.payout.toLocaleString()}¢</span></p>
                                        <p className="flex items-center gap-2 text-muted-foreground"><Hourglass className="h-4 w-4" /> Duration: {mission.duration}s</p>
                                    </div>
                                    <Button onClick={() => handleAcceptEscortMission(mission.id)} disabled={!hasAvailableShips}>Accept Contract</Button>
                                </CardContent>
                            </Card>
                        )})
                    ) : (
                        <p className="text-center text-muted-foreground p-8">No escort contracts available. Try scanning for new ones.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
