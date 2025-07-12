
'use client';

import { useCallback } from 'react';
import type { GameState, Property, PropertyType, Lease } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { propertyUpgrades } from '@/lib/property-upgrades';

export function useLandlord(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
    const { toast } = useToast();

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
            const currentLevel = property[upgradeKey] as number || 0;
            const cost = 10000 * (currentLevel + 1); // Placeholder cost

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


    return {
        handlePurchaseProperty,
        handleUpgradeProperty,
    };
}
