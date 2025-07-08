
'use client';

import { useState, useTransition, useCallback } from 'react';
import type { GameState, Pirate, EncounterResult } from '@/lib/types';
import { resolveEncounter } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

export function useEncounters(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
  const [isResolvingEncounter, startEncounterResolution] = useTransition();
  const [encounterResult, setEncounterResult] = useState<EncounterResult | null>(null);
  const { toast } = useToast();

  const handlePirateAction = useCallback((action: 'fight' | 'evade' | 'bribe') => {
    if (!gameState?.pirateEncounter) return;

    const pirate = gameState.pirateEncounter;

    startEncounterResolution(async () => {
        try {
            const result = await resolveEncounter({
                action,
                playerNetWorth: gameState.playerStats.netWorth,
                playerCargo: gameState.playerStats.cargo,
                pirateName: pirate.name,
                pirateThreatLevel: pirate.threatLevel,
                hasGunner: gameState.crew.some(c => c.role === 'Gunner'),
                hasNegotiator: gameState.crew.some(c => c.role === 'Negotiator'),
                shipHealth: gameState.playerStats.shipHealth,
                weaponLevel: gameState.playerStats.weaponLevel,
                shieldLevel: gameState.playerStats.shieldLevel,
            });
            setEncounterResult(result);
            setGameState(prev => {
                if (!prev) return null;
                const newPlayerStats = { ...prev.playerStats };
                newPlayerStats.netWorth -= result.creditsLost;
                newPlayerStats.shipHealth = Math.max(0, newPlayerStats.shipHealth - result.damageTaken);
                return { ...prev, playerStats: newPlayerStats, pirateEncounter: null };
            });
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Encounter Resolution Failed", description: errorMessage });
        }
    });
  }, [gameState, setGameState, toast]);

  const handleCloseEncounterDialog = () => setEncounterResult(null);

  return {
    isResolvingEncounter,
    encounterResult,
    handlePirateAction,
    handleCloseEncounterDialog,
  };
}
