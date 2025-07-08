
'use client';

import { useState, useTransition, useCallback } from 'react';
import type { GameState, Pirate, EncounterResult, PlayerStats } from '@/lib/types';
import { resolveEncounter } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { hullUpgrades } from '@/lib/upgrades';

function syncActiveShipStats(playerStats: PlayerStats): PlayerStats {
    if (!playerStats.fleet || playerStats.fleet.length === 0) return playerStats;

    const activeShip = playerStats.fleet[0];
    const newStats = { ...playerStats };

    const hullTier = hullUpgrades[activeShip.hullLevel - 1];
    newStats.maxShipHealth = hullTier ? hullTier.health : 100;
    newStats.shipHealth = activeShip.health;
    
    return newStats;
}


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
    
    const activeShip = gameState.playerStats.fleet[0];

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
                shipHealth: activeShip.health,
                weaponLevel: activeShip.weaponLevel,
                shieldLevel: activeShip.shieldLevel,
            });

            setEncounterResult(result);

            setGameState(prev => {
                if (!prev) return null;
                
                let newPlayerStats = { ...prev.playerStats };
                newPlayerStats.netWorth -= result.creditsLost;
                let isGameOver = false;

                // Determine which ship was in the encounter
                let shipInstanceId = activeShip.instanceId;
                if (pirate.missionId && pirate.missionType) {
                    const mission = (prev.playerStats as any)[`${pirate.missionType}Missions`]?.find((m: any) => m.id === pirate.missionId);
                    if(mission?.assignedShipInstanceId) {
                        shipInstanceId = mission.assignedShipInstanceId;
                    }
                }
                
                const fleet = [...newPlayerStats.fleet];
                const shipIndex = fleet.findIndex(s => s.instanceId === shipInstanceId);

                if (shipIndex !== -1) {
                    const ship = { ...fleet[shipIndex] };
                    const maxHealth = hullUpgrades[ship.hullLevel - 1]?.health || 100;

                    ship.health = Math.max(0, ship.health - result.damageTaken);

                    if (ship.health <= 0) {
                        fleet.splice(shipIndex, 1); // Remove ship from fleet
                        setTimeout(() => toast({ variant: "destructive", title: "Ship Destroyed!", description: `Your ${ship.name} has been lost to the void.` }), 0);
                        if (fleet.length === 0) {
                           isGameOver = true;
                        }
                    } else if (ship.health < maxHealth / 2) {
                        ship.status = 'repair_needed';
                        setTimeout(() => toast({ variant: "destructive", title: "Ship Damaged", description: `Your ${ship.name} needs critical repairs and is unavailable for missions.` }), 0);
                    }
                    
                    if (ship.health > 0) {
                        fleet[shipIndex] = ship;
                    }
                }

                newPlayerStats.fleet = fleet;

                // Handle mission failure
                if (pirate.missionId && pirate.missionType) {
                    if (result.outcome === 'failure') {
                         const missionsKey = `${pirate.missionType}Missions` as keyof PlayerStats;
                         const missions = [...(newPlayerStats as any)[missionsKey]];
                         const missionIndex = missions.findIndex((m: any) => m.id === pirate.missionId);

                        if (missionIndex > -1) {
                            missions[missionIndex] = { ...missions[missionIndex], status: 'Failed', assignedShipInstanceId: null };
                            (newPlayerStats as any)[missionsKey] = missions;
                            setTimeout(() => toast({ variant: "destructive", title: `${pirate.missionType.charAt(0).toUpperCase() + pirate.missionType.slice(1)} Failed`, description: `You failed to complete your mission due to the ambush.` }), 0);
                        }
                    } else {
                        setTimeout(() => toast({ title: "Threat Neutralized", description: "You've dealt with the ambush and can continue your mission." }), 0);
                    }
                }

                if (isGameOver) {
                    return { ...prev, isGameOver: true };
                }

                newPlayerStats = syncActiveShipStats(newPlayerStats);

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
