
'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { CarTaxiFront, UserCheck, Coins, ArrowRight, Hourglass, Loader2, FileText, Rocket, PenSquare, Wrench, Fuel, HeartPulse, Recycle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { PlayerShip, TaxiMission } from '@/lib/types';
import CooldownTimer from '@/components/ui/cooldown-timer';
import ShipOutfittingDialog from '@/components/ship-outfitting-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { hullUpgrades, fuelUpgrades, cargoUpgrades } from '@/lib/upgrades';

const riskColorMap = {
    'Low': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const RenameShipDialog = ({ ship, onRename, isOpen, onOpenChange }: { ship: PlayerShip, onRename: (id: number, newName: string) => void, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const [newName, setNewName] = useState(ship.name);

    const handleSave = () => {
        onRename(ship.instanceId, newName);
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename Ship</DialogTitle>
                    <DialogDescription>Give your vessel a unique callsign.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="ship-name">New Ship Name</Label>
                    <Input id="ship-name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Name</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface FleetStatusProps {
    game: ReturnType<typeof useGame>;
    onOutfit: (instanceId: number) => void;
}

const FleetStatus = ({ game, onOutfit }: FleetStatusProps) => {
    const { gameState, handleRepairFleetShip, handleRefuelFleetShip, handleRenameShip, handleSalvageShip } = game;
    const [renamingShip, setRenamingShip] = useState<PlayerShip | null>(null);

    if (!gameState) return null;

    const { playerStats } = gameState;
    const { fleet, taxiMissions } = playerStats;
    const activeMissions = taxiMissions.filter(c => c.status === 'Active');
    const assignedShipIds = new Set(activeMissions.map(m => m.assignedShipInstanceId));
    
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Rocket className="text-primary"/>
                        Taxi Fleet Status
                    </CardTitle>
                    <CardDescription>Your ships available for fares. Damaged ships must be repaired.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fleet.map(ship => {
                        const isAssigned = assignedShipIds.has(ship.instanceId);
                        const mission = isAssigned ? activeMissions.find(m => m.assignedShipInstanceId === ship.instanceId) : null;
                        
                        const hullUpgrade = hullUpgrades[ship.hullLevel - 1];
                        const maxHealth = hullUpgrade?.health || 100;
                        const shipDamage = maxHealth - (ship.health || maxHealth);
                        const shipRepairCost = Math.round(shipDamage * (playerStats.insurance.ship ? 25 : 50));
                        const canAffordShipRepair = playerStats.netWorth >= shipRepairCost;

                        const fuelUpgrade = fuelUpgrades[ship.fuelLevel - 1];
                        const maxFuel = fuelUpgrade?.capacity || 100;
                        const fuelNeeded = maxFuel - (ship.fuel || 0);
                        const shipRefuelCost = Math.round(fuelNeeded * 2);
                        const canAffordRefuel = playerStats.netWorth >= shipRefuelCost;

                        return (
                            <div key={ship.instanceId} className={cn("p-4 rounded-md border flex flex-col", isAssigned ? "bg-muted/50 border-amber-500/30" : ship.status === 'repair_needed' ? 'bg-destructive/10 border-destructive/30' : "bg-card/50", ship.status === 'destroyed' && 'bg-destructive/30 border-destructive')}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm">{ship.name}</h4>
                                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setRenamingShip(ship)}><PenSquare className="h-3 w-3"/></Button>
                                    </div>
                                    {isAssigned ? (
                                        <Badge variant="outline" className="text-amber-400 border-amber-500/30">On Fare</Badge>
                                    ) : ship.status === 'upgrading' && ship.upgradeStartTime && ship.upgradeDuration ? (
                                        <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">
                                            <CooldownTimer expiry={ship.upgradeStartTime + ship.upgradeDuration} />
                                        </Badge>
                                    ) : ship.status === 'repair_needed' ? (
                                        <Badge variant="destructive">Repair Needed</Badge>
                                    ) : ship.status === 'destroyed' ? (
                                        <Badge variant="destructive">Destroyed</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-green-400 border-green-500/30">Available</Badge>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{isAssigned ? `En route to ${mission?.toSystem}` : ship.status === 'upgrading' ? `Upgrading: ${ship.upgradingComponent}` : "Awaiting dispatch"}</div>
                                
                                <div className="space-y-2 mt-4 flex-grow">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-xs"><span className="flex items-center gap-1.5"><HeartPulse/> Hull:</span> <span className="font-mono">{(ship.health || 0).toFixed(0)} / {maxHealth} HP</span></div>
                                        <Progress value={((ship.health || 0) / maxHealth) * 100} indicatorClassName={cn((ship.health || 0) < maxHealth * 0.25 ? 'bg-destructive' : (ship.health || 0) < maxHealth * 0.5 ? 'bg-yellow-500' : 'bg-green-400')} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-xs"><span className="flex items-center gap-1.5"><Fuel/> Fuel:</span> <span className="font-mono">{(ship.fuel || 0).toFixed(0)} / {maxFuel} SU</span></div>
                                        <Progress value={(((ship.fuel || 0)) / maxFuel) * 100} indicatorClassName="bg-amber-400" />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-4">
                                    {ship.status === 'destroyed' ? (
                                        <Button size="sm" variant="destructive" onClick={() => handleSalvageShip(ship.instanceId)}><Recycle className="mr-2"/> Salvage Wreck</Button>
                                    ) : (
                                        <>
                                            <Button variant="outline" size="sm" onClick={() => onOutfit(ship.instanceId)} disabled={ship.status !== 'operational'}>
                                                <Wrench className="mr-2" /> Outfit
                                            </Button>
                                            <Button size="sm" variant="secondary" onClick={() => handleRepairFleetShip(ship.instanceId)} disabled={!shipDamage || !canAffordShipRepair || ship.status === 'upgrading'}>Repair ({shipRepairCost.toLocaleString()}¢)</Button>
                                            <Button size="sm" variant="secondary" onClick={() => handleRefuelFleetShip(ship.instanceId)} disabled={!fuelNeeded || !canAffordRefuel}>Refuel ({shipRefuelCost.toLocaleString()}¢)</Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
            {renamingShip && <RenameShipDialog ship={renamingShip} onRename={handleRenameShip} isOpen={!!renamingShip} onOpenChange={() => setRenamingShip(null)}/>}
        </>
    );
};

const checkRequirements = (ship: PlayerShip, mission: TaxiMission): { met: boolean; reasons: string[] } => {
    const reasons: string[] = [];
    
    if (mission.requiredFuel && (ship.fuel || 0) < mission.requiredFuel) {
        reasons.push(`Requires ${mission.requiredFuel} SU fuel (ship has ${ship.fuel?.toFixed(0)} SU).`);
    }

    const hullHealth = hullUpgrades[ship.hullLevel - 1]?.health || 100;
    const requiredHealth = hullHealth * (mission.minHullPercentage || 0);
    if(ship.health < requiredHealth) {
        reasons.push(`Requires ${requiredHealth.toFixed(0)} HP (ship has ${ship.health.toFixed(0)} HP).`);
    }
    
    return { met: reasons.length === 0, reasons };
}

export default function TaxiPage() {
    const game = useGame();
    const { gameState, handleGenerateTaxiMissions, handleAcceptTaxiMission, isGeneratingMissions } = game;
    const [outfittingShipId, setOutfittingShipId] = useState<number | null>(null);

    if (!gameState) return null;

    const { playerStats } = gameState;
    const { taxiMissions = [] } = playerStats;

    const availableMissions = taxiMissions.filter(m => m.status === 'Available');
    const activeMissions = taxiMissions.filter(m => m.status === 'Active');

    const assignedShipIds = new Set(activeMissions.map(m => m.assignedShipInstanceId));
    const availableShips = playerStats.fleet.filter(s => s.status === 'operational' && !assignedShipIds.has(s.instanceId));
    const hasAvailableShips = availableShips.length > 0;

    const cooldown = 60 * 1000; // 60 seconds
    const lastGeneration = playerStats.lastTaxiMissionGeneration || 0;
    const isCooldownActive = Date.now() < lastGeneration + cooldown;
    const cooldownExpiry = lastGeneration + cooldown;

    const canAcceptMission = (mission: TaxiMission): { can: boolean, shipId?: number, reasons?: string[] } => {
        for (const ship of availableShips) {
            const { met, reasons } = checkRequirements(ship, mission);
            if(met) return { can: true, shipId: ship.instanceId };
        }
        if(availableShips.length > 0) {
            const { reasons } = checkRequirements(availableShips[0], mission);
            return { can: false, reasons };
        }
        return { can: false, reasons: ["No operational ships available."] };
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <CarTaxiFront className="text-primary" />
                        Taxi Dispatch
                    </CardTitle>
                    <CardDescription>
                        Manage your taxi service. Find lucrative fares, accept missions, and ensure timely drop-offs to build your reputation and wealth.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGenerateTaxiMissions} disabled={isGeneratingMissions || isCooldownActive || !hasAvailableShips}>
                        {isGeneratingMissions ? <Loader2 className="mr-2 animate-spin" /> : <FileText className="mr-2" />}
                        {isCooldownActive ? <CooldownTimer expiry={cooldownExpiry} /> : 'Scan for New Fares'}
                    </Button>
                    {!hasAvailableShips && <p className="text-xs text-amber-400 mt-2">All ships are currently assigned. A ship must be available to scan for new fares.</p>}
                </CardContent>
            </Card>

            <FleetStatus game={game} onOutfit={setOutfittingShipId} />

            {activeMissions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2"><Hourglass className="text-primary"/> Active Fares</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeMissions.map(mission => (
                            <Card key={mission.id} className="bg-card/50">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                          <CardTitle className="text-base flex items-center gap-2"><UserCheck className="text-primary/80"/> {mission.passengerName}</CardTitle>
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
                                            <span>Payout: <span className="font-mono text-amber-300">{mission.fare.toLocaleString()}¢ (+{mission.bonus.toLocaleString()}¢ Bonus)</span></span>
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
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><FileText className="text-primary"/> Available Fares</CardTitle>
                     {!hasAvailableShips && (
                        <CardDescription className="text-amber-400">All operational ships are currently assigned. You must have an available ship to accept new fares.</CardDescription>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {isGeneratingMissions && availableMissions.length === 0 ? (
                        <div className="text-center text-muted-foreground p-8">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                            <p>Scanning local dispatch network...</p>
                        </div>
                    ) : availableMissions.length > 0 ? (
                        availableMissions.map(mission => {
                            const acceptance = canAcceptMission(mission);
                            return (
                            <Card key={mission.id} className="bg-card/50">
                                <CardHeader>
                                     <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base flex items-center gap-2"><UserCheck className="text-primary/80"/> {mission.passengerName}</CardTitle>
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
                                        <p className="flex items-center gap-2"><Coins className="h-4 w-4 text-amber-300" /> Fare: <span className="font-mono text-amber-300">{mission.fare.toLocaleString()}¢ (+{mission.bonus.toLocaleString()}¢)</span></p>
                                        <p className="flex items-center gap-2 text-muted-foreground"><Hourglass className="h-4 w-4" /> Duration: {mission.duration}s</p>
                                    </div>
                                    <div>
                                        {!acceptance.can && acceptance.reasons && (
                                            <div className="text-xs text-destructive text-right mb-1">
                                                {acceptance.reasons.map(reason => <p key={reason}>{reason}</p>)}
                                            </div>
                                        )}
                                        <Button onClick={() => handleAcceptTaxiMission(mission.id, acceptance.shipId)} disabled={!acceptance.can}>Accept Fare</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )})
                    ) : (
                        <p className="text-center text-muted-foreground p-8">No fares available. Try scanning for new ones.</p>
                    )}
                </CardContent>
            </Card>

            {outfittingShipId !== null && (
                <ShipOutfittingDialog
                    shipInstanceId={outfittingShipId}
                    isOpen={!!outfittingShipId}
                    onOpenChange={(isOpen) => !isOpen && setOutfittingShipId(null)}
                />
            )}
        </div>
    );
}
