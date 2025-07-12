
'use client';

import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Package, Coins, ArrowRight, CheckCircle, Hourglass, Loader2, FileText, Rocket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { hullUpgrades } from '@/lib/upgrades';
import { cn } from '@/lib/utils';
import type { PlayerShip } from '@/lib/types';
import CooldownTimer from '@/app/components/cooldown-timer';


const riskColorMap = {
    'Low': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const FleetStatus = ({ fleet, activeContracts }: { fleet: PlayerShip[], activeContracts: any[] }) => {
    const assignedShipIds = new Set(activeContracts.map(m => m.assignedShipInstanceId));
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Rocket className="text-primary"/>
                    Fleet Status
                </CardTitle>
                <CardDescription>Your ships available for hauling contracts. Damaged ships must be repaired on the Ship page.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fleet.map(ship => {
                    const isAssigned = assignedShipIds.has(ship.instanceId);
                    const mission = isAssigned ? activeContracts.find(m => m.assignedShipInstanceId === ship.instanceId) : null;
                    const maxHealth = hullUpgrades[ship.hullLevel - 1]?.health || 100;

                    return (
                        <div key={ship.instanceId} className={cn("p-3 rounded-md border", isAssigned ? "bg-muted/50 border-amber-500/30" : ship.status === 'repair_needed' ? 'bg-destructive/10 border-destructive/30' : "bg-card/50")}>
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-sm">{ship.name}</h4>
                                {isAssigned ? (
                                    <Badge variant="outline" className="text-amber-400 border-amber-500/30">On Contract</Badge>
                                ) : ship.status === 'repair_needed' ? (
                                    <Badge variant="destructive">Repair Needed</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-green-400 border-green-500/30">Available</Badge>
                                )}
                            </div>
                             <div className="text-xs text-muted-foreground space-y-1 mt-2">
                                <p>{isAssigned ? `Hauling to ${mission?.toSystem}` : "Awaiting orders"}</p>
                                <Progress value={((ship.health || 0) / maxHealth) * 100} indicatorClassName={cn((ship.health || 0) < maxHealth * 0.25 ? 'bg-destructive' : (ship.health || 0) < maxHealth * 0.5 ? 'bg-yellow-500' : 'bg-green-400')} />
                                <div className="text-right font-mono">{(ship.health || 0).toFixed(0)} / {maxHealth} HP</div>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    );
};


export default function HaulerPage() {
    const { gameState, handleGenerateContracts, handleAcceptContract, isGeneratingContracts } = useGame();

    if (!gameState) return null;

    const { playerStats } = gameState;
    const { tradeContracts = [] } = playerStats;

    const availableContracts = tradeContracts.filter(c => c.status === 'Available');
    const activeContracts = tradeContracts.filter(c => c.status === 'Active');

    const assignedShipIds = new Set(activeContracts.map(m => m.assignedShipInstanceId));
    const hasAvailableShips = playerStats.fleet.some(s => s.status === 'operational' && !assignedShipIds.has(s.instanceId));

    const cooldown = 60 * 1000; // 60 seconds
    const lastGeneration = playerStats.lastHaulerContractGeneration || 0;
    const isCooldownActive = Date.now() < lastGeneration + cooldown;
    const cooldownExpiry = lastGeneration + cooldown;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Truck className="text-primary" />
                        Hauler Contracts
                    </CardTitle>
                    <CardDescription>
                        Manage your logistics empire. Find lucrative trade routes, accept contracts, and ensure timely delivery to build your reputation and wealth.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGenerateContracts} disabled={isGeneratingContracts || isCooldownActive || !hasAvailableShips}>
                        {isGeneratingContracts ? <Loader2 className="mr-2 animate-spin" /> : <FileText className="mr-2" />}
                        {isCooldownActive ? <CooldownTimer expiry={cooldownExpiry} /> : 'Scan for New Contracts'}
                    </Button>
                    {!hasAvailableShips && <p className="text-xs text-amber-400 mt-2">All ships are currently assigned. A ship must be available to scan for new contracts.</p>}
                </CardContent>
            </Card>
            
            <FleetStatus fleet={playerStats.fleet} activeContracts={activeContracts} />

            {activeContracts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2"><Hourglass className="text-primary"/> Active Contracts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeContracts.map(contract => (
                            <Card key={contract.id} className="bg-card/50">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold">{contract.fromSystem}</span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-semibold">{contract.toSystem}</span>
                                        </div>
                                        <Badge variant="outline" className={riskColorMap[contract.riskLevel]}>{contract.riskLevel} Risk</Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-2 pt-1"><Package className="h-4 w-4" /> {contract.quantity} units of {contract.cargo}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs mb-1">
                                            <span className="text-muted-foreground">Assigned Ship: <span className="font-semibold text-foreground">{contract.assignedShipName}</span></span>
                                            <span>En route...</span>
                                        </div>
                                        <Progress value={contract.progress || 0} />
                                        <div className="flex justify-end text-xs text-muted-foreground">
                                            <span>Payout: <span className="font-mono text-amber-300">{contract.payout.toLocaleString()}¢</span></span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
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
                    {isGeneratingContracts && availableContracts.length === 0 ? (
                        <div className="text-center text-muted-foreground p-8">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                            <p>Scanning galactic logistics network...</p>
                        </div>
                    ) : availableContracts.length > 0 ? (
                        availableContracts.map(contract => (
                            <Card key={contract.id} className="bg-card/50">
                                <CardHeader>
                                     <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold">{contract.fromSystem}</span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-semibold">{contract.toSystem}</span>
                                        </div>
                                        <Badge variant="outline" className={riskColorMap[contract.riskLevel]}>{contract.riskLevel} Risk</Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-2 pt-1"><Package className="h-4 w-4" /> {contract.quantity} units of {contract.cargo}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex justify-between items-center">
                                    <div className="text-sm space-y-1">
                                        <p className="flex items-center gap-2"><Coins className="h-4 w-4 text-amber-300" /> Payout: <span className="font-mono text-amber-300">{contract.payout.toLocaleString()}¢</span></p>
                                        <p className="flex items-center gap-2 text-muted-foreground"><Hourglass className="h-4 w-4" /> Duration: {contract.duration}s</p>
                                    </div>
                                    <Button onClick={() => handleAcceptContract(contract.id)} disabled={!hasAvailableShips}>Accept Contract</Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground p-8">No contracts available. Try scanning for new ones.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
