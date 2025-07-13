
'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LandPlot, Home, Briefcase, Factory, Ticket, Shield, ChevronsUp, UserPlus, FileText, Loader2, Hourglass, PenSquare, X, Tag, ListCollapse, ListTree } from 'lucide-react';
import type { Property, PropertyType, Lease, PropertySaleOffer, NpcPropertySale } from '@/lib/types';
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
import { calculatePropertyValue } from '@/lib/utils';


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
    
    if (property.status !== 'Idle') {
        return <p className="text-sm text-muted-foreground text-center py-4">Upgrades are unavailable while property is leased, for sale, or being upgraded.</p>
    }

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

const ListForSaleDialog = ({ property, onList }: { property: Property, onList: (id: number, price: number) => void }) => {
    const estimatedValue = calculatePropertyValue(property);
    const [askingPrice, setAskingPrice] = useState(estimatedValue);
    const maxAskingPrice = Math.round(estimatedValue * 1.2);
    const isPriceTooHigh = askingPrice > maxAskingPrice;
    const isPriceAmbitious = askingPrice > estimatedValue * 1.1;

    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>List Property for Sale</DialogTitle>
                <DialogDescription>
                    List "{property.name}" on the galactic market. You can set your asking price. Offers may come in higher or lower.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <div className="text-sm text-center">Estimated Market Value: <span className="font-mono text-amber-300">{estimatedValue.toLocaleString()}¢</span></div>
                 <div>
                    <Label htmlFor="asking-price">Asking Price (Max: {maxAskingPrice.toLocaleString()}¢)</Label>
                    <Input id="asking-price" type="number" value={askingPrice} onChange={(e) => setAskingPrice(Number(e.target.value))} />
                    {isPriceTooHigh && <p className="text-xs text-destructive mt-1">Asking price cannot exceed 20% of the estimated value.</p>}
                    {isPriceAmbitious && !isPriceTooHigh && <p className="text-xs text-amber-400 mt-1">Pricing aggressively may lead to lower offers.</p>}
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <DialogClose asChild><Button onClick={() => onList(property.id, askingPrice)} disabled={isPriceTooHigh}>List Property</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}


const PropertyCard = ({ property, onRenameClick, onListClick }: { property: Property, onRenameClick: (property: Property) => void, onListClick: (property: Property) => void }) => {
    const { gameState } = useGame();
    const Icon = propertyTypeConfig.find(p => p.type === property.type)?.icon || LandPlot;
    
    const upgradeKey = `${property.type.toLowerCase()}Level` as keyof Property;
    const currentLevel = (property[upgradeKey] as number) || 0;
    const upgradeData = propertyUpgrades[property.type.toLowerCase() as keyof typeof propertyUpgrades];
    const currentUpgradeName = upgradeData?.upgrades[currentLevel - 1]?.upgrade || 'Base';

    const activeLease = gameState?.playerStats.activeLeases.find(l => l.propertyId === property.id);
    const leaseProgress = activeLease ? (Date.now() - activeLease.startTime) / (activeLease.duration * 3600 * 1000) * 100 : 0;
    
    let statusBadge: React.ReactNode;
    if (property.status === 'ForSale') {
        statusBadge = <Badge variant="outline" className="text-amber-400 border-amber-500/30">For Sale</Badge>
    } else if (property.status === 'Upgrading') {
        statusBadge = <Badge variant="outline" className="text-cyan-400 border-cyan-500/30">Upgrading</Badge>
    } else if (activeLease) {
        statusBadge = <Badge variant="outline" className="text-green-400 border-green-500/30">Leased</Badge>
    } else {
        statusBadge = <Badge variant="outline">Available</Badge>
    }

    return (
         <Card className="bg-card/50 flex flex-col">
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
                    Level {currentLevel}: {currentUpgradeName}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                {property.status === 'Upgrading' && property.upgradeStartTime && property.upgradeDuration ? (
                    <div className="space-y-2">
                        <p className="text-xs text-cyan-400 text-center">Upgrading: {property.upgradingComponent}</p>
                        <Progress value={ (1 - ((property.upgradeStartTime + property.upgradeDuration) - Date.now()) / property.upgradeDuration) * 100 } indicatorClassName="bg-cyan-400" />
                        <p className="text-xs text-muted-foreground text-center">
                            <CooldownTimer expiry={property.upgradeStartTime + property.upgradeDuration} onCompleteText="Finalising Upgrades"/>
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
                        <AccordionItem value="upgrades" className="border-b-0">
                            <AccordionTrigger>Show Upgrades</AccordionTrigger>
                            <AccordionContent>
                                <UpgradeDialog property={property} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}
            </CardContent>
            {property.status === 'Idle' && (
                <CardContent>
                    <Button className="w-full" size="sm" variant="secondary" onClick={() => onListClick(property)}>
                        <Tag className="mr-2 h-4 w-4"/> List for Sale
                    </Button>
                </CardContent>
            )}
        </Card>
    )
}

const AssignLeaseDialog = ({ lease, properties, onAssign, isOpen, onOpenChange }: { lease: Lease, properties: Property[], onAssign: (propertyId: number) => void, isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
    const idleProperties = properties.filter(p => p.status === 'Idle');

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
                            {idleProperties.map(prop => (
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
    const { gameState, handlePurchaseProperty, handleFindTenants, handleAssignLease, isGeneratingLeases, handleRenameProperty, handleIgnoreLease, handleListPropertyForSale, handleAcceptPropertyOffer, handleDeclinePropertyOffer, handleScoutForListings, isGeneratingListings, handlePurchaseNpcProperty } = useGame();
    const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
    const [renamingProperty, setRenamingProperty] = useState<Property | null>(null);
    const [listingProperty, setListingProperty] = useState<Property | null>(null);
    const [openPortfolioSections, setOpenPortfolioSections] = useState<string[]>([]);
    
    if (!gameState) return null;

    const { playerStats } = gameState;
    const { properties, availableLeases, activeLeases, propertySaleOffers, npcPropertySales } = playerStats;
    
    const idleProperties = properties.filter(p => p.status === 'Idle' && !activeLeases.some(l => l.propertyId === p.id));
    
    const getAssignableProperties = (lease: Lease) => {
        return idleProperties.filter(p => 
            p.type === lease.propertyType && 
            p.status === 'Idle' &&
            (p[`${p.type.toLowerCase()}Level` as keyof Property] as number) >= lease.requiredLevel
        );
    };
    
    const leaseCooldown = 60 * 1000;
    const lastLeaseGeneration = playerStats.lastLeaseGeneration || 0;
    const isLeaseOnCooldown = Date.now() < lastLeaseGeneration + leaseCooldown;
    const leaseCooldownExpiry = lastLeaseGeneration + leaseCooldown;
    
    const listingCooldown = 20 * 60 * 1000;
    const lastNpcPropertyGeneration = playerStats.lastNpcPropertyGeneration || 0;
    const isListingOnCooldown = Date.now() < lastNpcPropertyGeneration + listingCooldown;
    const listingCooldownExpiry = lastNpcPropertyGeneration + listingCooldown;
    
    const toggleAllSections = () => {
        if (openPortfolioSections.length > 0) {
            setOpenPortfolioSections([]);
        } else {
            setOpenPortfolioSections(propertyTypeConfig.map(p => p.type));
        }
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
                    <CardTitle className="font-headline text-lg">Property Market</CardTitle>
                    <CardDescription>Scout for properties being sold by other entities in this system.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Button onClick={handleScoutForListings} disabled={isGeneratingListings || isListingOnCooldown}>
                        {isGeneratingListings ? <Loader2 className="animate-spin mr-2"/> : <UserPlus className="mr-2"/>}
                        {isListingOnCooldown ? <CooldownTimer expiry={listingCooldownExpiry} /> : "Scout for Listings"}
                    </Button>
                    {(npcPropertySales || []).length > 0 && (
                        <Accordion type="single" collapsible className="w-full">
                           <AccordionItem value="npc-listings">
                               <AccordionTrigger>View {npcPropertySales?.length} Available Listings</AccordionTrigger>
                               <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                   {(npcPropertySales || []).map(prop => (
                                       <div key={prop.id} className="p-4 rounded-md border bg-background/50">
                                            <p className="font-semibold text-sm">{prop.name} ({prop.type})</p>
                                            <p className="text-xs text-muted-foreground">Lvl {prop.level} - {prop.systemName}</p>
                                            <p className="text-xs text-muted-foreground mt-2 italic">"{prop.description}"</p>
                                            <div className="flex justify-between items-center mt-2 pt-2 border-t">
                                                <span className="text-sm font-mono text-amber-300">{prop.askingPrice.toLocaleString()}¢</span>
                                                <Button size="sm" onClick={() => handlePurchaseNpcProperty(prop)} disabled={playerStats.netWorth < prop.askingPrice}>Purchase</Button>
                                            </div>
                                       </div>
                                   ))}
                               </AccordionContent>
                           </AccordionItem>
                        </Accordion>
                    )}
                </CardContent>
            </Card>

            {(propertySaleOffers || []).length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Incoming Offers</CardTitle>
                        <CardDescription>Review and respond to incoming offers for your listed properties.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(propertySaleOffers || []).map(offer => {
                            const property = properties.find(p => p.id === offer.propertyId);
                            if (!property) return null;
                            const valueDiff = offer.offerAmount - offer.askingPrice;
                            return (
                                <div key={offer.offerId} className="p-4 rounded-md border bg-background/50">
                                    <p className="font-semibold text-sm">{property.name} ({property.type})</p>
                                    <p className="text-xs text-muted-foreground">Offer from: <span className="font-semibold text-primary">{offer.buyerName}</span></p>
                                    <p className="text-xs text-muted-foreground mt-2 italic">"{offer.narrative}"</p>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t">
                                        <div className="text-sm">
                                            Offer: <span className="font-mono text-amber-300">{offer.offerAmount.toLocaleString()}¢</span>
                                            <span className={cn("text-xs font-mono ml-2", valueDiff > 0 ? "text-green-400" : valueDiff < 0 ? "text-destructive" : "text-muted-foreground")}>
                                                ({valueDiff >= 0 ? '+' : ''}{valueDiff.toLocaleString()}¢)
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleAcceptPropertyOffer(offer.offerId)}>Accept</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDeclinePropertyOffer(offer.offerId)}>Decline</Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline text-lg">Your Portfolio</CardTitle>
                            <CardDescription>An overview of all properties you own, grouped by type.</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={toggleAllSections}>
                           {openPortfolioSections.length > 0 ? <ListCollapse className="mr-2"/> : <ListTree className="mr-2"/>}
                           {openPortfolioSections.length > 0 ? 'Collapse All' : 'Expand All'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {properties.length > 0 ? (
                        <Accordion type="multiple" value={openPortfolioSections} onValueChange={setOpenPortfolioSections}>
                           {propertyTypeConfig.map(({ type, icon: Icon }) => {
                               const propertiesOfType = properties.filter(p => p.type === type);
                               if (propertiesOfType.length === 0) return null;
                               return (
                                   <AccordionItem value={type} key={type}>
                                       <AccordionTrigger>
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-5 w-5 text-primary" />
                                                <span className="font-semibold">{type} Properties ({propertiesOfType.length})</span>
                                            </div>
                                       </AccordionTrigger>
                                       <AccordionContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                                           {propertiesOfType.map(prop => <PropertyCard key={prop.id} property={prop} onRenameClick={setRenamingProperty} onListClick={setListingProperty} />)}
                                       </AccordionContent>
                                   </AccordionItem>
                               )
                           })}
                        </Accordion>
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
                     <Button onClick={handleFindTenants} disabled={isGeneratingLeases || idleProperties.length === 0 || isLeaseOnCooldown}>
                        {isGeneratingLeases ? <Loader2 className="animate-spin mr-2"/> : <UserPlus className="mr-2"/>}
                        {isLeaseOnCooldown ? <CooldownTimer expiry={leaseCooldownExpiry} /> : (idleProperties.length === 0 ? "No Available Properties" : "Find Tenants")}
                    </Button>

                    <Accordion type="multiple">
                        {(activeLeases && activeLeases.length > 0) && (
                            <AccordionItem value="active-leases">
                                <AccordionTrigger>Active Leases ({activeLeases.length})</AccordionTrigger>
                                <AccordionContent className="space-y-2 pt-4">
                                    {activeLeases.map(lease => {
                                        const property = properties.find(p => p.id === lease.propertyId);
                                        return (
                                        <div key={`${lease.id}-${lease.propertyId}`} className="p-3 rounded-md border bg-background/50">
                                            <p className="font-semibold text-sm">{lease.tenantName} @ {property?.name}</p>
                                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                <span>Rent: {lease.rent.toLocaleString()}¢ / 2 mins</span>
                                                <span className="flex items-center gap-1"><Hourglass className="h-3 w-3"/> <CooldownTimer expiry={lease.startTime + lease.duration * 3600 * 1000} /></span>
                                            </div>
                                        </div>
                                    )})}
                                </AccordionContent>
                            </AccordionItem>
                        )}
                        
                        {(availableLeases && availableLeases.length > 0) && (
                           <AccordionItem value="available-leases">
                                <AccordionTrigger>Available Lease Proposals ({availableLeases.length})</AccordionTrigger>
                                <AccordionContent className="space-y-2 pt-4">
                                     {availableLeases.map(lease => {
                                        const assignableProps = getAssignableProperties(lease);
                                        return (
                                        <div key={lease.id} className="p-3 rounded-md border bg-background/50 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-sm">{lease.tenantName}</p>
                                                <p className="text-xs text-muted-foreground">{lease.description}</p>
                                                <p className="text-xs mt-1">Requires: Lvl {lease.requiredLevel}+ {lease.propertyType} | Rent: {lease.rent.toLocaleString()}¢/2mins | Term: {lease.duration}h</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" onClick={() => setSelectedLease(lease)} disabled={assignableProps.length === 0}>
                                                    Assign
                                                </Button>
                                                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleIgnoreLease(lease.id)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )})}
                                </AccordionContent>
                            </AccordionItem>
                        )}
                    </Accordion>
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
            {listingProperty && (
                <Dialog open={!!listingProperty} onOpenChange={() => setListingProperty(null)}>
                    <ListForSaleDialog 
                        property={listingProperty}
                        onList={(id, price) => {
                            handleListPropertyForSale(id, price);
                            setListingProperty(null);
                        }}
                    />
                </Dialog>
            )}
        </div>
    );
}
