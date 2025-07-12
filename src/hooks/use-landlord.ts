
'use client';

import { useCallback, useState } from 'react';
import type { GameState, Property, PropertyType, Lease } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { propertyUpgrades } from '@/lib/property-upgrades';
import { generateLeaseProposals } from '@/app/actions';

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

            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth - cost,
                    properties: [...prev.playerStats.properties, newProperty],
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

            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth - cost,
                    properties: newProperties,
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

            setTimeout(() => toast({ title: 'Lease Signed!', description: `${lease.tenantName} is now leasing ${property.name}.` }), 0);
            
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    properties: newProperties,
                    activeLeases: [...(prev.playerStats.activeLeases || []), newLease],
                    availableLeases: prev.playerStats.availableLeases?.filter(l => l.id !== leaseId),
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


    return {
        handlePurchaseProperty,
        handleUpgradeProperty,
        handleFindTenants,
        handleAssignLease,
        handleRenameProperty,
        handleIgnoreLease,
        isGeneratingLeases,
    };
}
