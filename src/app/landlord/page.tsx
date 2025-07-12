'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LandPlot, Home, Briefcase, Factory, Ticket, Shield, ChevronsUp, UserPlus, FileText, Loader2, Hourglass, PenSquare } from 'lucide-react';
import type { Property, PropertyType, Lease } from '@/lib/types';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';


const propertyTypeConfig: { type: PropertyType; icon: React.ElementType, cost: number }[] = [
    { type: 'Residential', icon: Home, cost: 250000 },
    { type: 'Commercial', icon: Briefcase, cost: 1000000 },
    { type: 'Industrial', icon: Factory, cost: 1750000 },
    { type: 'Recreational', icon: Ticket, cost: 2250000 },
    { type: 'Military', icon: Shield, cost: 5000000 },
];

const UpgradeDialog = ({ property }: { property: Property }) => {
    const { gameState, handleUpgradeProperty } = useGame();
    if (!gameState) return null;
    
    const upgradeKey = `${property.type.toLowerCase()}Level` as keyof Property;
    const upgradeData = propertyUpgrades[property.type.toLowerCase() as keyof typeof propertyUpgrades];
    if (!upgradeData) return null;

    const currentLevel = (property[upgradeKey] as number) || 0;

    return (
        <div className="space-y-2">
            {upgradeData.upgrades.map(upgrade => {
                const isCurrent = upgrade.level === currentLevel;
                const isNext = upgrade.level === currentLevel + 1;
                const cost = upgrade.cost - (upgradeData.upgrades[currentLevel-1]?.cost || 0);
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


const PropertyCard = ({ property, onRenameClick }: { property: Property, onRenameClick: (property: Property) => void }) => {
    const { gameState } = useGame();
    const Icon = propertyTypeConfig.find(p => p.type === property.type)?.icon || LandPlot;
    const currentLevel = property[`${property.type.toLowerCase()}Level` as keyof Property] as number || 0;

    const activeLease = gameState?.playerStats.activeLeases.find(l => l.propertyId === property.id);
    const leaseProgress = activeLease ? (Date.now() - activeLease.startTime) / (activeLease.duration * 3600 * 1000) * 100 : 0;
    
    let statusBadge: React.ReactNode;
    if (property.status === 'Upgrading') {
        statusBadge = <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">Upgrading</Badge>
    } else if (activeLease) {
        statusBadge = <Badge variant="outline" className="text-green-400 border-green-500/30">Leased</Badge>
    } else {
        statusBadge = <Badge variant="outline">Available</Badge>
    }

    return (
         <Card className="bg-card/50">
            <CardHeader>
                <CardTitle className="text-base flex justify-between items-start">
                    <span className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {property.name}
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onRenameClick(property)}>
                            <PenSquare className="h-3 w-3" />
                        </Button>
                    </span>
                    {statusBadge}
                </CardTitle>
                <CardDescription>
                    {property.type} Property - Level {currentLevel} - {property.systemName}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {property.status === 'Upgrading' && property.upgradeStartTime && property.upgradeDuration ? (
                    <div className="space-y-2">
                        <p className="text-xs text-cyan-400 text-center">Upgrading: {property.upgradingComponent}</p>
                        <Progress value={ (1 - ((property.upgradeStartTime + property.upgradeDuration) - Date.now()) / property.upgradeDuration) * 100 } indicatorClassName="bg-cyan-400" />
                        <p className="text-xs text-muted-foreground text-center">
                            <CooldownTimer expiry={property.upgradeStartTime + property.upgradeDuration} />
                        </p>
                    </div>
                ) : activeLease ? (
                     <div className="space-y-2">
                        <p className="text-xs text-green-400 text-center">Tenant: {activeLease.tenantName}</p>
                        <Progress value={leaseProgress} indicatorClassName="bg-green-400" />
                        <p className="text-xs text-muted-foreground text-center">
                           Lease ends in: <CooldownTimer expiry={activeLease.startTime + activeLease.duration * 3600 * 1000} />
                        </p>
                    </div>
                ) : (
                     <Accordion type="single" collapsible disabled={property.status !== 'Idle'}>
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

const AssignLeaseDialog = ({ lease, properties, onAssign, isOpen, onOpenChange }: { lease: Lease, properties: Property[], onAssign: (propertyId: number) => void, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Lease: {lease.tenantName}</DialogTitle>
                    <DialogDescription>Select an available and suitable property to assign this lease to.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Label htmlFor="property-select">Available Properties</Label>
                    <Select onValueChange={setSelectedPropertyId}>
                        <SelectTrigger id="property-select">
                            <SelectValue placeholder="Select a property..." />
                        </SelectTrigger>
                        <SelectContent>
                            {properties.map(prop => (
                                <SelectItem key={prop.id} value={String(prop.id)}>
                                    {prop.name} (Lvl {prop[`${prop.type.toLowerCase()}Level` as keyof Property] as number}) - {prop.systemName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <DialogClose asChild><Button onClick={() => onAssign(Number(selectedPropertyId))} disabled={!selectedPropertyId}>Confirm Lease</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const RenamePropertyDialog = ({ property, onRename, isOpen, onOpenChange }: { property: Property | null, onRename: (id: number, newName: string) => void, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const [name, setName] = useState(property?.name || '');

    useEffect(() => {
        if(property) setName(property.name);
    }, [property]);

    if(!property) return null;

    const handleSave = () => {
        if(name.trim()) {
            onRename(property.id, name.trim());
            onOpenChange(false);
        }
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename Property</DialogTitle>
                    <DialogDescription>Give your property a unique name.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="property-name">New Property Name</Label>
                    <Input id="property-name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>Save Name</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function LandlordPage() {
    const { gameState, handlePurchaseProperty, handleFindTenants, handleAssignLease, isGeneratingLeases, handleRenameProperty } = useGame();
    const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
    const [renamingProperty, setRenamingProperty] = useState<Property | null>(null);

    if (!gameState) return null;

    const { playerStats } = gameState;
    const { properties, availableLeases, activeLeases } = playerStats;
    
    const idleProperties = properties.filter(p => p.status === 'Idle' && !activeLeases.some(l => l.propertyId === p.id));
    
    const getAssignableProperties = (lease: Lease) => {
        return idleProperties.filter(p => p.type === lease.propertyType && p[`${p.type.toLowerCase()}Level` as keyof Property] >= lease.requiredLevel);
    };

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
                    {propertyTypeConfig.map(({ type, icon: Icon, cost }) => (
                        <Button key={type} className="flex-col h-24" onClick={() => handlePurchaseProperty(type)} disabled={playerStats.netWorth < cost}>
                            <Icon className="h-8 w-8 mb-2" />
                            Buy {type}
                            <span className="text-xs font-mono text-primary-foreground/80">({cost.toLocaleString()}¢)</span>
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
                            {properties.map(prop => <PropertyCard key={prop.id} property={prop} onRenameClick={setRenamingProperty} />)}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">You do not own any properties. Purchase one to get started.</p>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <FileText className="text-primary"/>
                        Lease Management
                    </CardTitle>
                    <CardDescription>Find tenants and manage your leases. New proposals are generated based on your property portfolio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={handleFindTenants} disabled={isGeneratingLeases || idleProperties.length === 0}>
                        {isGeneratingLeases ? <Loader2 className="animate-spin mr-2"/> : <UserPlus className="mr-2"/>}
                        {idleProperties.length === 0 ? "No Available Properties" : "Find Tenants"}
                    </Button>

                    {activeLeases && activeLeases.length > 0 && (
                        <div className="space-y-2 pt-4">
                            <h4 className="font-semibold">Active Leases</h4>
                            {activeLeases.map(lease => {
                                const property = properties.find(p => p.id === lease.propertyId);
                                return (
                                <div key={lease.id} className="p-3 rounded-md border bg-background/50">
                                    <p className="font-semibold text-sm">{lease.tenantName} @ {property?.name}</p>
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span>Rent: {lease.rent.toLocaleString()}¢ / hour</span>
                                        <span className="flex items-center gap-1"><Hourglass className="h-3 w-3"/> <CooldownTimer expiry={lease.startTime + lease.duration * 3600 * 1000} /></span>
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                    
                    {availableLeases && availableLeases.length > 0 && (
                        <div className="space-y-2 pt-4">
                            <h4 className="font-semibold">Available Lease Proposals</h4>
                             {availableLeases.map(lease => {
                                const assignableProps = getAssignableProperties(lease);
                                return (
                                <div key={lease.id} className="p-3 rounded-md border bg-background/50 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm">{lease.tenantName}</p>
                                        <p className="text-xs text-muted-foreground">{lease.description}</p>
                                        <p className="text-xs mt-1">Requires: Lvl {lease.requiredLevel}+ {lease.propertyType} | Rent: {lease.rent.toLocaleString()}¢/hr | Term: {lease.duration}h</p>
                                    </div>
                                    <Button size="sm" onClick={() => setSelectedLease(lease)} disabled={assignableProps.length === 0}>
                                        Assign
                                    </Button>
                                </div>
                            )})}
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedLease && (
                <AssignLeaseDialog 
                    isOpen={!!selectedLease}
                    onOpenChange={() => setSelectedLease(null)}
                    lease={selectedLease}
                    properties={getAssignableProperties(selectedLease)}
                    onAssign={(propertyId) => handleAssignLease(selectedLease.id, propertyId)}
                />
            )}
            
            <RenamePropertyDialog
                isOpen={!!renamingProperty}
                onOpenChange={() => setRenamingProperty(null)}
                property={renamingProperty}
                onRename={handleRenameProperty}
            />
        </div>
    );
}
