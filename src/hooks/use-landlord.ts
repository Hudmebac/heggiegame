
'use client';

import { useCallback } from 'react';
import type { GameState, Property, PropertyType, Lease } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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
                name: `${type} Property #${prev.playerStats.properties.length + 1}`,
                type,
                systemName: prev.currentSystem,
                residentialLevel: 0,
                commercialLevel: 0,
                industrialLevel: 0,
                recreationalLevel: 0,
                militaryLevel: 0,
                status: 'Idle',
            };

            // Set the base level for the purchased type
            switch (type) {
                case 'Residential': newProperty.residentialLevel = 1; break;
                case 'Commercial': newProperty.commercialLevel = 1; break;
                case 'Industrial': newProperty.industrialLevel = 1; break;
                case 'Recreational': newProperty.recreationalLevel = 1; break;
                case 'Military': newProperty.militaryLevel = 1; break;
            }

            toast({ title: 'Property Acquired!', description: `Finalizing purchase of new ${type} property in ${prev.currentSystem}.` });

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

    return {
        handlePurchaseProperty,
    };
}
