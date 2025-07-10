
'use client';

import { useState, useTransition, useCallback } from 'react';
import type { GameState, Pirate, EncounterResult, PlayerStats } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { hullUpgrades } from '@/lib/upgrades';
import { runPirateScan } from '@/app/actions';

function syncActiveShipStats(playerStats: PlayerStats): PlayerStats {
    if (!playerStats.fleet || playerStats.fleet.length === 0) return playerStats;

    const activeShip = playerStats.fleet[0];
    const newStats = { ...playerStats };

    const hullTier = hullUpgrades[activeShip.hullLevel - 1];
    newStats.maxShipHealth = hullTier ? hullTier.health : 100;
    newStats.shipHealth = activeShip.health;
    
    return newStats;
}

// Simulated resolveEncounter logic
async function resolveEncounter(input: {
    action: 'fight' | 'evade' | 'bribe';
    playerNetWorth: number;
    playerCargo: number;
    pirateName: string;
    pirateThreatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    hasGunner: boolean;
    hasNegotiator: boolean;
    shipHealth: number;
    weaponLevel: number;
    shieldLevel: number;
}): Promise<EncounterResult> {
    const { action, playerNetWorth, pirateThreatLevel, hasGunner, hasNegotiator, shipHealth, weaponLevel, shieldLevel } = input;
    
    let success = false;
    let outcome: EncounterResult['outcome'] = 'failure';
    let narrative = "";
    let cargoLost = 0;
    let creditsLost = 0;
    let damageTaken = 0;

    const threatModifier = { 'Low': 0.8, 'Medium': 1, 'High': 1.25, 'Critical': 1.6 }[pirateThreatLevel];

    if (action === 'fight') {
        const combatScore = (shipHealth / 100) * (weaponLevel + shieldLevel) * (hasGunner ? 1.5 : 1);
        const pirateScore = 15 * threatModifier;
        success = combatScore > pirateScore * (Math.random() + 0.5);

        if (success) {
            outcome = 'success';
            narrative = `With a brilliant maneuver, you outgunned ${input.pirateName}, sending them retreating into the void.`;
            damageTaken = Math.round((Math.random() * 20) / (shieldLevel * 0.5));
        } else {
            outcome = 'failure';
            narrative = `The battle was fierce, but ${input.pirateName}'s vessel was too strong. You were forced to jettison some cargo to escape.`;
            damageTaken = Math.round(20 + Math.random() * 30 * threatModifier);
            cargoLost = Math.round(input.playerCargo * (0.1 + Math.random() * 0.2));
        }
    } else if (action === 'evade') {
        success = Math.random() > (0.4 * threatModifier);
        if (success) {
            outcome = 'success';
            narrative = `You pushed your engines to the limit and successfully evaded the pirates!`;
        } else {
            outcome = 'failure';
            narrative = `The pirates outmaneuvered you, landing a few solid hits before you could warp away.`;
            damageTaken = Math.round(10 + Math.random() * 20);
        }
    } else if (action === 'bribe') {
        const bribeAmount = Math.round(playerNetWorth * (0.05 + Math.random() * 0.1) * threatModifier * (hasNegotiator ? 0.75 : 1));
        if (playerNetWorth >= bribeAmount) {
            outcome = 'success';
            creditsLost = bribeAmount;
            narrative = `${input.pirateName} accepted your bribe of ${creditsLost.toLocaleString()}¢ and let you pass.`;
        } else {
            outcome = 'failure';
            narrative = `Your paltry offer insulted ${input.pirateName}. They attacked out of spite before you managed to escape.`;
            damageTaken = Math.round(15 + Math.random() * 15);
        }
    }
    
    return { outcome, narrative, cargoLost, creditsLost, damageTaken };
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

            // Apply the results of the encounter
            setGameState(prev => {
                if (!prev) return null;
                
                let newPlayerStats = { ...prev.playerStats };
                newPlayerStats.netWorth -= result.creditsLost;
                newPlayerStats.pirateEncounter = null;
                let isGameOver = false;

                // Determine which ship was in the encounter
                let shipInstanceId = activeShip.instanceId;
                if (pirate.missionId && pirate.missionType && pirate.missionType !== 'trade') {
                    const missionsKey = `${pirate.missionType}s` as 'escortMissions' | 'tradeContracts' | 'taxiMissions' | 'militaryMissions';
                    const mission = (prev.playerStats as any)[missionsKey]?.find((m: any) => m.id === pirate.missionId);
                    if(mission?.assignedShipInstanceId) {
                        shipInstanceId = mission.assignedShipInstanceId;
                    }
                } else if (pirate.missionId && pirate.missionType === 'trade') {
                     const mission = (prev.playerStats.tradeContracts || []).find(m => m.id === pirate.missionId);
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
                     const missionsKey = `${pirate.missionType}s` as 'escortMissions' | 'tradeContracts' | 'taxiMissions' | 'militaryMissions';
                     const missions = [...((newPlayerStats as any)[missionsKey] || [])];
                     const missionIndex = missions.findIndex((m: any) => m.id === pirate.missionId);

                    if (result.outcome === 'failure' && missionIndex > -1) {
                        missions[missionIndex] = { ...missions[missionIndex], status: 'Failed', assignedShipInstanceId: null };
                        (newPlayerStats as any)[missionsKey] = missions;
                        newPlayerStats.reputation = Math.max(0, newPlayerStats.reputation - 5);
                        setTimeout(() => toast({ variant: "destructive", title: `${pirate.missionType.charAt(0).toUpperCase() + pirate.missionType.slice(1)} Failed`, description: `You failed to complete your mission due to the ambush. Your reputation has suffered.` }), 0);
                    } else {
                        setTimeout(() => toast({ title: "Threat Neutralized", description: "You've dealt with the ambush and can continue your mission, but you have lost time." }), 0);
                    }
                }

                if (isGameOver) {
                    return { ...prev, isGameOver: true };
                }

                newPlayerStats = syncActiveShipStats(newPlayerStats);

                // Show the result dialog *after* state has been updated
                setEncounterResult(result);
                
                return { ...prev, playerStats: newPlayerStats };
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
