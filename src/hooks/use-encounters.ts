
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

                if (pirate.missionId && pirate.missionType) {
                    if (result.outcome === 'failure') {
                        if (pirate.missionType === 'escort') {
                            const missions = [...newPlayerStats.escortMissions];
                            const missionIndex = missions.findIndex(m => m.id === pirate.missionId);
                            if (missionIndex > -1) {
                                missions[missionIndex] = { ...missions[missionIndex], status: 'Failed' };
                                newPlayerStats.escortMissions = missions;
                                setTimeout(() => {
                                    toast({ variant: "destructive", title: "Escort Failed", description: "You failed to protect your client from the ambush." })
                                }, 0);
                            }
                        } else if (pirate.missionType === 'trade') {
                            const contracts = [...newPlayerStats.tradeContracts];
                            const contractIndex = contracts.findIndex(c => c.id === pirate.missionId);
                            if (contractIndex > -1) {
                                contracts[contractIndex] = { ...contracts[contractIndex], status: 'Failed' };
                                newPlayerStats.tradeContracts = contracts;
                                setTimeout(() => {
                                    toast({ variant: "destructive", title: "Contract Failed", description: "You lost the cargo to pirates." })
                                }, 0);
                            }
                        }
                    } else {
                        setTimeout(() => {
                            toast({ title: "Threat Neutralized", description: "You've dealt with the ambush and can continue your mission." })
                        }, 0);
                    }
                }

                return { ...prev, playerStats: { ...newPlayerStats, pirateEncounter: null } };
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
