
'use client';

import { useCallback, useState, useEffect } from 'react';
import type { GameState, Property, PropertyType, Lease, GameEvent, FactionId, PropertySaleOffer } from '@/lib/types';
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

            const offerCount = 2 + Math.floor(Math.random() * 3); // 2-4 offers
            const newOffers: PropertySaleOffer[] = Array.from({ length: offerCount }).map((_, i) => {
                const offerModifier = 0.8 + Math.random() * 0.4; // Offer between 80% and 120% of asking price
                return {
                    offerId: `offer_${propertyId}_${Date.now()}_${i}`,
                    propertyId: propertyId,
                    buyerName: traderNames[Math.floor(Math.random() * traderNames.length)],
                    offerAmount: Math.round(askingPrice * offerModifier),
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
            
            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + offer.offerAmount,
                properties: prev.playerStats.properties.filter(p => p.id !== offer.propertyId),
                propertySaleOffers: prev.playerStats.propertySaleOffers.filter(o => o.propertyId !== offer.propertyId)
            };
            
            const propertySold = prev.playerStats.properties.find(p => p.id === offer.propertyId);

            newPlayerStats.events.push({
                id: `evt_prop_sale_${Date.now()}_${offer.propertyId}_${Math.random()}`,
                timestamp: Date.now(),
                type: 'Purchase', // Logged as a 'purchase' for the buyer, shows as income for player
                description: `Sold property "${propertySold?.name}" to ${offer.buyerName}.`,
                value: offer.offerAmount,
                isMilestone: true,
            });

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

    const handlePurchaseNpcProperty = useCallback((property: Property) => {
        setGameState(prev => {
            if (!prev) return null;

            const cost = calculatePropertyValue(property);
             if (prev.playerStats.netWorth < cost) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Purchase Failed', description: 'Insufficient funds.' }), 0);
                return prev;
            }

            const newProperty: Property = {
                ...property,
                id: Date.now(),
                status: 'Idle',
                systemName: prev.currentSystem,
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
                description: `Purchased "${property.name}" in ${prev.currentSystem}.`,
                value: -cost,
                reputationChange: 1,
                isMilestone: true,
            };
            newPlayerStats.events.push(newEvent);
            
            setTimeout(() => toast({ title: 'Property Acquired!', description: `You have successfully purchased ${property.name}.` }), 0);

            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    useEffect(() => {
        const interval = setInterval(() => {
            setGameState(prev => {
                if (!prev || prev.isGameOver) return prev;

                let newPlayerStats = { ...prev.playerStats };
                let stateChanged = false;
                const now = Date.now();
                let eventsToAdd: GameEvent[] = [];
                
                const activeLeases = newPlayerStats.activeLeases || [];
                
                if(activeLeases.length > 0) {
                    const stillActiveLeases: Lease[] = [];
                    
                    activeLeases.forEach(lease => {
                        const leaseEndTime = lease.startTime + lease.duration * 3600 * 1000;
                        if (now >= leaseEndTime) {
                            const propIndex = newPlayerStats.properties.findIndex(p => p.id === lease.propertyId);
                            if(propIndex > -1) {
                                newPlayerStats.properties[propIndex].status = 'Idle';
                            }
                            stateChanged = true;
                        } else {
                            const rentIntervalMs = 2 * 60 * 1000;
                            const timeSinceLastRent = now - (lease.lastRentCollection || lease.startTime);
                            const intervalsToPay = Math.floor(timeSinceLastRent / rentIntervalMs);
                            
                            if (intervalsToPay > 0) {
                                const rentToCollect = intervalsToPay * lease.rent;
                                newPlayerStats.netWorth += rentToCollect;
                                
                                const newReputation = { ...newPlayerStats.factionReputation };
                                FACTIONS_DATA.forEach(faction => {
                                    if (faction.id !== 'Independent') {
                                        newReputation[faction.id] = (newReputation[faction.id] || 0) + 0.5 * intervalsToPay;
                                    }
                                });
                                newPlayerStats.factionReputation = newReputation;
        
                                eventsToAdd.push({
                                    id: `evt_rent_${lease.propertyId}_${performance.now()}`,
                                    timestamp: now,
                                    type: 'Lease',
                                    description: `Collected ${rentToCollect.toLocaleString()}¢ in rent from ${lease.tenantName}.`,
                                    value: rentToCollect,
                                    reputationChange: 0.5 * intervalsToPay,
                                    isMilestone: false,
                                });
                                
                                lease.lastRentCollection = (lease.lastRentCollection || lease.startTime) + intervalsToPay * rentIntervalMs;
                                stateChanged = true;
                            }
                            stillActiveLeases.push(lease);
                        }
                    });

                    newPlayerStats.activeLeases = stillActiveLeases;
                }
                
                if (eventsToAdd.length > 0) {
                    newPlayerStats.events = [...newPlayerStats.events, ...eventsToAdd];
                }

                let propStateChanged = false;
                const newProperties = [...newPlayerStats.properties].map(prop => {
                    if (prop.status === 'Upgrading' && prop.upgradeStartTime && prop.upgradeDuration && now > prop.upgradeStartTime + prop.upgradeDuration) {
                        stateChanged = true;
                        propStateChanged = true;
                        const newProp = { ...prop, status: 'Idle' as const, upgradeStartTime: undefined, upgradeDuration: undefined };
                        if(prop.upgradingComponent === 'Purchase') {
                            const upgradeKey = `${newProp.type.toLowerCase()}Level` as keyof Property;
                            (newProp as any)[upgradeKey] = 1;
                            toast({ title: "Property Acquired!", description: `Your new ${newProp.type} property in ${newProp.systemName} is ready.` });
                        } else {
                             const upgradeKey = `${newProp.type.toLowerCase()}Level` as keyof Property;
                             (newProp as any)[upgradeKey] = (newProp[upgradeKey] as number) + 1;
                             toast({ title: "Upgrade Complete!", description: `Your ${newProp.name} has been upgraded.` });
                        }
                        return newProp;
                    }
                    return prop;
                });

                if (propStateChanged) {
                    newPlayerStats.properties = newProperties;
                }
                
                return stateChanged ? { ...prev, playerStats: newPlayerStats } : prev;
            });
        }, 1000); // Check every second

        return () => clearInterval(interval);
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
        handlePurchaseNpcProperty,
        isGeneratingLeases,
    };
}
