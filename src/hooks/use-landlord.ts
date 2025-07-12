
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

            const cost = 10000; // Placeholder cost
            if (prev.playerStats.netWorth < cost) {
                toast({ variant: 'destructive', title: 'Purchase Failed', description: 'Insufficient funds.' });
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
            
            toast({ title: 'Property Acquisition Started!', description: `Finalizing purchase of new ${type} property. ETA: 10 seconds.` });

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
            
            const propIndex = prev.playerStats.properties.findIndex(p => p.id === propertyId);
            if(propIndex === -1) return prev;

            const newProperties = [...prev.playerStats.properties];
            const property = { ...newProperties[propIndex] };

            if(property.status !== 'Idle') {
                toast({ variant: 'destructive', title: 'Upgrade Failed', description: 'Property is currently busy.' });
                return prev;
            }
            
            const upgradeKey = `${type.toLowerCase()}Level` as keyof Property;
            const upgradeData = propertyUpgrades[type.toLowerCase() as keyof typeof propertyUpgrades];
            if (!upgradeData) return prev;
            
            const currentLevel = (property[upgradeKey] as number) || 0;
            if (currentLevel >= upgradeData.upgrades.length) {
                toast({ variant: 'destructive', title: 'Upgrade Failed', description: 'Property is at max level.' });
                return prev;
            }
            
            const cost = upgradeData.upgrades[currentLevel].cost - (upgradeData.upgrades[currentLevel-1]?.cost || 0);

            if (prev.playerStats.netWorth < cost) {
                toast({ variant: 'destructive', title: 'Upgrade Failed', description: 'Insufficient funds.' });
                return prev;
            }

            property.status = 'Upgrading';
            property.upgradeStartTime = Date.now();
            property.upgradeDuration = 20000; // 20 seconds
            property.upgradingComponent = type;
            newProperties[propIndex] = property;
            
            toast({ title: `Upgrading ${property.name}`, description: `ETA: 20 seconds.` });

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
                        availableLeases: result.leases
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
                toast({ variant: 'destructive', title: 'Assignment Failed', description: 'Property is not available.' });
                return prev;
            }

            const newLease: Lease = {
                ...lease,
                status: 'Active',
                startTime: Date.now(),
                propertyId: property.id,
            };
            
            property.status = 'Leased';
            const newProperties = [...prev.playerStats.properties];
            newProperties[propertyIndex] = property;

            toast({ title: 'Lease Signed!', description: `${lease.tenantName} is now leasing ${property.name}.` });
            
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


    return {
        handlePurchaseProperty,
        handleUpgradeProperty,
        handleFindTenants,
        handleAssignLease,
        isGeneratingLeases,
    };
}
