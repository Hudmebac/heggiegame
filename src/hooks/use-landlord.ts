
'use client';

import { useCallback, useState, useEffect } from 'react';
import type { GameState, Property, PropertyType, Lease, GameEvent, FactionId, PropertySaleOffer, NpcPropertySale } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { propertyUpgrades } from '@/lib/property-upgrades';
import { generateLeaseProposals, generatePropertyListings } from '@/app/actions';
import { FACTIONS_DATA } from '@/lib/factions';
import { calculatePropertyValue } from '@/lib/utils';
import { traderNames } from '@/lib/traders';

export function useLandlord(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
    const { toast } = useToast();
    const [isGeneratingLeases, setIsGeneratingLeases] = useState(false);
    const [isGeneratingListings, setIsGeneratingListings] = useState(false);


    const handlePurchaseProperty = useCallback((type: PropertyType) => {
        setGameState(prev => {
            if (!prev) return null;

            if (prev.playerStats.properties.some(p => p.status === 'Upgrading')) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Action Failed', description: 'Another property is already being purchased or upgraded.' }), 0);
                return prev;
            }

            const costMap: Record<PropertyType, number> = {
                'Residential': 250000,
                'Commercial': 1000000,
                'Industrial': 1750000,
                'Recreational': 2250000,
                'Military': 5000000,
            };

            const cost = costMap[type];
            if (prev.playerStats.netWorth < cost) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Purchase Failed', description: `Insufficient funds. You need ${cost.toLocaleString()}¢.` }), 0);
                return prev;
            }

            const newProperty: Property = {
                id: Date.now(),
                name: `${type} Property #${prev.playerStats.properties.filter(p => p.type === type).length + 1}`,
                type,
                systemName: prev.currentSystem,
                residentialLevel: 0,
                commercialLevel: 0,
                industrialLevel: 0,
                recreationalLevel: 0,
                militaryLevel: 0,
                status: 'Upgrading', // 'Purchasing' is a form of upgrading
                upgradeStartTime: Date.now(),
                upgradeDuration: 10000, // 10 seconds
                upgradingComponent: 'Purchase',
            };
            
            setTimeout(() => toast({ title: 'Property Acquisition Started!', description: `Finalizing purchase of new ${type} property. ETA: 10 seconds.` }), 0);

            const newEvent: GameEvent = {
                id: `evt_prop_purchase_${Date.now()}_${Math.random()}`,
                timestamp: Date.now(),
                type: 'Purchase' as const,
                description: `Purchased a new ${type} property in ${prev.currentSystem}.`,
                value: -cost,
                reputationChange: 1,
                isMilestone: true,
            };

            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth - cost,
                    properties: [...prev.playerStats.properties, newProperty],
                    events: [...prev.playerStats.events, newEvent],
                }
            };
        });
    }, [setGameState, toast]);

    const handleUpgradeProperty = useCallback((propertyId: number, type: PropertyType) => {
        setGameState(prev => {
            if (!prev) return null;

            if (prev.playerStats.properties.some(p => p.status === 'Upgrading')) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Action Failed', description: 'Another property is already being purchased or upgraded.' }), 0);
                return prev;
            }
            
            const propIndex = prev.playerStats.properties.findIndex(p => p.id === propertyId);
            if(propIndex === -1) return prev;

            const newProperties = [...prev.playerStats.properties];
            const property = { ...newProperties[propIndex] };

            if(property.status !== 'Idle') {
                setTimeout(() => toast({ variant: 'destructive', title: 'Upgrade Failed', description: 'Property is currently busy.' }), 0);
                return prev;
            }
            
            const upgradeKey = `${type.toLowerCase()}Level` as keyof Property;
            const upgradeData = propertyUpgrades[type.toLowerCase() as keyof typeof propertyUpgrades];
            if (!upgradeData) return prev;
            
            const currentLevel = (property[upgradeKey] as number) || 0;
            if (currentLevel >= upgradeData.upgrades.length) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Upgrade Failed', description: 'Property is at max level.' }), 0);
                return prev;
            }
            
            const cost = upgradeData.upgrades[currentLevel].cost - (upgradeData.upgrades[currentLevel-1]?.cost || 0);

            if (prev.playerStats.netWorth < cost) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Upgrade Failed', description: 'Insufficient funds.' }), 0);
                return prev;
            }

            property.status = 'Upgrading';
            property.upgradeStartTime = Date.now();
            property.upgradeDuration = 20000; // 20 seconds
            property.upgradingComponent = type;
            newProperties[propIndex] = property;
            
            setTimeout(() => toast({ title: `Upgrading ${property.name}`, description: `ETA: 20 seconds.` }), 0);

            const newEvent: GameEvent = {
                id: `evt_prop_upgrade_${Date.now()}_${Math.random()}`,
                timestamp: Date.now(),
                type: 'Upgrade' as const,
                description: `Upgraded "${property.name}" to Level ${currentLevel + 1}.`,
                value: -cost,
                isMilestone: false,
            };

            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth - cost,
                    properties: newProperties,
                    events: [...prev.playerStats.events, newEvent],
                }
            };
        });
    }, [setGameState, toast]);

    const handleFindTenants = useCallback(async () => {
        if (!gameState) return;

        const cooldown = 60 * 1000;
        const lastGeneration = gameState.playerStats.lastLeaseGeneration || 0;
        if (Date.now() - lastGeneration < cooldown) {
            toast({ variant: 'destructive', title: 'On Cooldown', description: 'Can only search for tenants once per minute.' });
            return;
        }

        setIsGeneratingLeases(true);
        try {
            const idleProperties = gameState.playerStats.properties.filter(p => p.status === 'Idle');
            if (idleProperties.length === 0) {
                 toast({ variant: 'destructive', title: 'No Available Properties', description: 'All your properties are currently occupied or upgrading.' });
                 setIsGeneratingLeases(false);
                return;
            }
            const result = await generateLeaseProposals({ propertyCount: idleProperties.length, proposalCount: 3 + Math.floor(Math.random() * 3) });
            setGameState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    playerStats: {
                        ...prev.playerStats,
                        availableLeases: result.leases,
                        lastLeaseGeneration: Date.now(),
                    }
                }
            });
            toast({ title: 'Lease Proposals Received', description: 'Potential tenants are ready for review.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Network Error', description: 'Could not fetch tenant proposals at this time.' });
        } finally {
            setIsGeneratingLeases(false);
        }
    }, [gameState, setGameState, toast]);

    const handleAssignLease = useCallback((leaseId: string, propertyId: number) => {
        setGameState(prev => {
            if (!prev) return null;
            
            const lease = prev.playerStats.availableLeases?.find(l => l.id === leaseId);
            const propertyIndex = prev.playerStats.properties.findIndex(p => p.id === propertyId);
            
            if (!lease || propertyIndex === -1) return prev;

            const property = { ...prev.playerStats.properties[propertyIndex] };

            if (property.status !== 'Idle') {
                setTimeout(() => toast({ variant: 'destructive', title: 'Assignment Failed', description: 'Property is not available.' }), 0);
                return prev;
            }

            const newLease: Lease = {
                ...lease,
                status: 'Active',
                startTime: Date.now(),
                propertyId: property.id,
                lastRentCollection: Date.now(),
            };
            
            property.status = 'Leased';
            const newProperties = [...prev.playerStats.properties];
            newProperties[propertyIndex] = property;
            
            const newEvent: GameEvent = {
                id: `evt_lease_assign_${Date.now()}_${property.id}`,
                timestamp: Date.now(),
                type: 'Lease' as const,
                description: `Signed a ${lease.duration}h lease with ${lease.tenantName} for "${property.name}".`,
                value: 0,
                reputationChange: 0,
                isMilestone: true,
            };

            setTimeout(() => toast({ title: 'Lease Signed!', description: `${lease.tenantName} is now leasing ${property.name}.` }), 0);
            
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    properties: newProperties,
                    activeLeases: [...(prev.playerStats.activeLeases || []), newLease],
                    availableLeases: prev.playerStats.availableLeases?.filter(l => l.id !== leaseId),
                    events: [...prev.playerStats.events, newEvent],
                }
            };
        });
    }, [setGameState, toast]);
    
    const handleRenameProperty = useCallback((propertyId: number, newName: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const properties = prev.playerStats.properties.map(prop => 
                prop.id === propertyId ? { ...prop, name: newName } : prop
            );
            toast({ title: "Property Renamed", description: `Your property is now known as "${newName}".`});
            return { ...prev, playerStats: { ...prev.playerStats, properties } };
        });
    }, [setGameState, toast]);

    const handleIgnoreLease = useCallback((leaseId: string) => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.availableLeases) return prev;

            const newAvailableLeases = prev.playerStats.availableLeases.filter(l => l.id !== leaseId);
            
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    availableLeases: newAvailableLeases,
                }
            }
        });
    }, [setGameState]);

    const handleListPropertyForSale = useCallback((propertyId: number, askingPrice: number) => {
        setGameState(prev => {
            if (!prev) return null;

            const newProperties = prev.playerStats.properties.map(p => p.id === propertyId ? { ...p, status: 'ForSale' as const } : p);
            const property = newProperties.find(p => p.id === propertyId);
            if (!property) return prev;

            const estimatedValue = calculatePropertyValue(property);
            const offerCount = 2 + Math.floor(Math.random() * 3); // 2-4 offers
            
            const isAmbitious = askingPrice > estimatedValue * 1.1;
            const offerPriceCap = isAmbitious ? estimatedValue * 1.05 : Infinity;
            
            const newOffers: PropertySaleOffer[] = Array.from({ length: offerCount }).map((_, i) => {
                const offerModifier = isAmbitious
                    ? 0.8 + Math.random() * 0.25 // Offer between 80% and 105% of estimated value
                    : 0.8 + Math.random() * 0.4; // Offer between 80% and 120% of asking price
                
                const basePriceForOffer = isAmbitious ? estimatedValue : askingPrice;
                let offerAmount = Math.round(basePriceForOffer * offerModifier);
                if (isAmbitious) {
                    offerAmount = Math.min(offerAmount, Math.round(offerPriceCap));
                }
                
                return {
                    offerId: `offer_${propertyId}_${Date.now()}_${i}`,
                    propertyId: propertyId,
                    buyerName: traderNames[Math.floor(Math.random() * traderNames.length)],
                    offerAmount: offerAmount,
                    askingPrice: askingPrice,
                    narrative: "A compelling offer for a prime piece of real estate."
                }
            });

            setTimeout(() => toast({ title: 'Property Listed!', description: `Your property "${property.name}" is now on the market.` }), 0);

            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    properties: newProperties,
                    propertySaleOffers: [...(prev.playerStats.propertySaleOffers || []), ...newOffers]
                }
            }
        });
    }, [setGameState, toast]);

    const handleAcceptPropertyOffer = useCallback((offerId: string) => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.propertySaleOffers) return prev;
            
            const offer = prev.playerStats.propertySaleOffers.find(o => o.offerId === offerId);
            if (!offer) return prev;
            
            const propertySold = prev.playerStats.properties.find(p => p.id === offer.propertyId);

            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + offer.offerAmount,
                properties: prev.playerStats.properties.filter(p => p.id !== offer.propertyId),
                propertySaleOffers: prev.playerStats.propertySaleOffers.filter(o => o.propertyId !== offer.propertyId),
                events: [
                    ...prev.playerStats.events,
                    {
                        id: `evt_prop_sale_${offer.propertyId}`,
                        timestamp: Date.now(),
                        type: 'Purchase' as const,
                        description: `Sold property "${propertySold?.name}" to ${offer.buyerName}.`,
                        value: offer.offerAmount,
                        reputationChange: 2,
                        isMilestone: true,
                    },
                ]
            };
            
            setTimeout(() => toast({ title: 'Property Sold!', description: `You sold "${propertySold?.name}" for ${offer.offerAmount.toLocaleString()}¢.` }), 0);

            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleDeclinePropertyOffer = useCallback((offerId: string) => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.propertySaleOffers) return prev;
            
            const newOffers = prev.playerStats.propertySaleOffers.filter(o => o.offerId !== offerId);
            const declinedOffer = prev.playerStats.propertySaleOffers.find(o => o.offerId === offerId);

            if (newOffers.every(o => o.propertyId !== declinedOffer?.propertyId)) {
                // Last offer for this property was declined, set it back to Idle
                const newProperties = prev.playerStats.properties.map(p => 
                    p.id === declinedOffer?.propertyId ? { ...p, status: 'Idle' as const } : p
                );
                return { ...prev, playerStats: { ...prev.playerStats, properties: newProperties, propertySaleOffers: newOffers } };
            }
            
            return { ...prev, playerStats: { ...prev.playerStats, propertySaleOffers: newOffers } };
        });
    }, [setGameState]);

    const handleScoutForListings = useCallback(async () => {
        if (!gameState) return;

        const cooldown = 20 * 60 * 1000;
        const lastGeneration = gameState.playerStats.lastNpcPropertyGeneration || 0;
        if (Date.now() - lastGeneration < cooldown) {
            toast({ variant: 'destructive', title: 'On Cooldown', description: 'Can only scout for new listings every 20 minutes.' });
            return;
        }

        setIsGeneratingListings(true);
        try {
            const result = await generatePropertyListings({ count: 3 + Math.floor(Math.random() * 3), systemName: gameState.currentSystem });
            setGameState(prev => {
                if (!prev) return null;
                const newPlayerStats = {
                    ...prev.playerStats,
                    npcPropertySales: result.properties as NpcPropertySale[],
                    lastNpcPropertyGeneration: Date.now(),
                };
                return { ...prev, playerStats: newPlayerStats };
            });
            toast({ title: 'Market Scanned', description: 'New property listings are available in this system.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Network Error', description: 'Could not fetch property listings at this time.' });
        } finally {
            setIsGeneratingListings(false);
        }
    }, [gameState, setGameState, toast]);

    const handlePurchaseNpcProperty = useCallback((property: NpcPropertySale) => {
        setGameState(prev => {
            if (!prev) return null;

            const cost = property.askingPrice;
             if (prev.playerStats.netWorth < cost) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Purchase Failed', description: 'Insufficient funds.' }), 0);
                return prev;
            }

            const newProperty: Property = {
                id: Date.now(),
                name: property.name,
                type: property.type,
                systemName: property.systemName,
                residentialLevel: property.type === 'Residential' ? property.level : 0,
                commercialLevel: property.type === 'Commercial' ? property.level : 0,
                industrialLevel: property.type === 'Industrial' ? property.level : 0,
                recreationalLevel: property.type === 'Recreational' ? property.level : 0,
                militaryLevel: property.type === 'Military' ? property.level : 0,
                status: 'Idle',
            };

            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
                properties: [...prev.playerStats.properties, newProperty],
                npcPropertySales: prev.playerStats.npcPropertySales?.filter(p => p.id !== property.id)
            };

            const newEvent: GameEvent = {
                id: `evt_prop_purchase_${Date.now()}_${Math.random()}`,
                timestamp: Date.now(),
                type: 'Purchase' as const,
                description: `Purchased "${property.name}" in ${property.systemName}.`,
                value: -cost,
                reputationChange: 1,
                isMilestone: true,
            };
            newPlayerStats.events.push(newEvent);
            
            setTimeout(() => toast({ title: 'Property Acquired!', description: `You have successfully purchased ${property.name}.` }), 0);

            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);


    return {
        handlePurchaseProperty,
        handleUpgradeProperty,
        handleFindTenants,
        handleAssignLease,
        handleRenameProperty,
        handleIgnoreLease,
        handleListPropertyForSale,
        handleAcceptPropertyOffer,
        handleDeclinePropertyOffer,
        handleScoutForListings,
        handlePurchaseNpcProperty,
        isGeneratingLeases,
        isGeneratingListings,
    };
}
