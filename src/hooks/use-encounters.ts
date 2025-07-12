

'use client';

import { useState, useTransition, useCallback } from 'react';
import type { GameState, Pirate, EncounterResult, PlayerStats, PlayerShip, Difficulty, TradeRouteContract } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { hullUpgrades, weaponUpgrades, shieldUpgrades } from '@/lib/upgrades';
import { runPirateScan } from '@/app/actions';
import { initialShip } from '@/lib/ships';
import { syncActiveShipStats, calculateCargoValue } from '@/lib/utils';
import { STATIC_ITEMS } from '@/lib/items';

// Simulated resolveEncounter logic
async function resolveEncounter(input: {
    action: 'fight' | 'evade' | 'bribe';
    playerNetWorth: number;
    playerCargo: number;
    pirateName: string;
    pirateThreatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    hasGunner: boolean;
    hasNegotiator: boolean;
    ship: PlayerShip;
    contract?: TradeRouteContract;
}): Promise<EncounterResult> {
    const { action, playerNetWorth, pirateThreatLevel, hasGunner, hasNegotiator, ship, contract } = input;
    
    let success = false;
    let outcome: EncounterResult['outcome'] = 'failure';
    let narrative = "";
    let cargoLost = 0;
    let creditsLost = 0;
    let damageTaken = 0;

    const threatModifier = { 'Low': 0.8, 'Medium': 1, 'High': 1.25, 'Critical': 1.6 }[pirateThreatLevel];

    if (action === 'fight') {
        const combatScore = (ship.health / 100) * (ship.weaponLevel + ship.shieldLevel) * (hasGunner ? 1.5 : 1);
        const pirateScore = 15 * threatModifier;
        success = combatScore > pirateScore * (Math.random() + 0.5);

        if (success) {
            outcome = 'success';
            narrative = `With a brilliant maneuver, you outgunned ${input.pirateName}, sending them retreating into the void.`;
            damageTaken = Math.round((Math.random() * 20) / (ship.shieldLevel * 0.5));
        } else {
            outcome = 'failure';
            narrative = `The battle was fierce, but ${input.pirateName}'s vessel was too strong. You were forced to jettison some cargo to escape.`;
            
            // Intensify damage if under-equipped
            let damageMultiplier = 1;
            if (contract?.minWeaponLevel && ship.weaponLevel < contract.minWeaponLevel) damageMultiplier += 0.5;
            if (contract?.minHullLevel && ship.hullLevel < contract.minHullLevel) damageMultiplier += 0.5;
            if (contract?.minShieldLevel && ship.shieldLevel < contract.minShieldLevel) damageMultiplier += 0.5;

            damageTaken = Math.round((20 + Math.random() * 30 * threatModifier) * damageMultiplier);
            cargoLost = Math.round(input.playerCargo * (0.1 + Math.random() * 0.2));
            
            if (contract?.riskLevel === 'Critical' && damageMultiplier > 1) {
                damageTaken = 999; // Destroy ship
            }
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

function handleRebirth(stats: PlayerStats, difficulty: Difficulty): PlayerStats {
    if (difficulty === 'Hardcore') return { ...stats }; // Should be handled by gameOver, but as a safeguard.
    
    let newNetWorth = stats.netWorth;
    let newInventory = [...stats.inventory];
    let newShip = { ...initialShip, instanceId: Date.now() };

    // Apply Health Insurance
    if(stats.insurance.health) {
        newNetWorth = stats.netWorth * 0.5;
    } else {
        newNetWorth = 10000; // Base rebirth cash
    }

    // Apply Ship Insurance
    if(stats.insurance.ship && stats.fleet.length > 0) {
        // Find most valuable ship that was lost and restore it, but damaged
        const restoredShip = [...stats.fleet].sort((a,b) => calculateShipValue(b) - calculateShipValue(a))[0];
        if(restoredShip) {
            const maxHealth = hullUpgrades[restoredShip.hullLevel - 1]?.health || 100;
            newShip = { ...restoredShip, health: maxHealth * 0.25, status: 'repair_needed' };
        }
    }
    
    // Apply Cargo Insurance
    if(stats.insurance.cargo) {
        // Keep 25% of cargo value by converting it to cash
        const cargoValue = calculateCargoValue(stats.inventory, []); // Using base prices
        newNetWorth += cargoValue * 0.25;
        newInventory = [];
    } else {
        newInventory = [];
    }

    return {
        ...stats,
        netWorth: Math.round(newNetWorth),
        fleet: [newShip],
        inventory: newInventory,
    };
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
             // Determine which ship is actually on the mission
            let shipForEncounter: PlayerShip | undefined = activeShip;
            let contractForEncounter: TradeRouteContract | undefined = undefined;

            if (pirate.missionId && pirate.missionType === 'trade') {
                const mission = gameState.playerStats.tradeContracts.find(m => m.id === pirate.missionId);
                if (mission?.assignedShipInstanceId) {
                    shipForEncounter = gameState.playerStats.fleet.find(s => s.instanceId === mission.assignedShipInstanceId);
                    contractForEncounter = mission;
                }
            } else if (pirate.missionId && pirate.missionType === 'escort') {
                // ... handle other mission types ...
            }

            if (!shipForEncounter) {
                console.error("Encounter occurred but could not find the assigned ship.");
                return;
            }


            const result = await resolveEncounter({
                action,
                playerNetWorth: gameState.playerStats.netWorth,
                playerCargo: gameState.playerStats.cargo,
                pirateName: pirate.name,
                pirateThreatLevel: pirate.threatLevel,
                hasGunner: gameState.crew.some(c => c.role === 'Gunner'),
                hasNegotiator: gameState.crew.some(c => c.role === 'Negotiator'),
                ship: shipForEncounter,
                contract: contractForEncounter,
            });

            // This state update will happen in the background
            setEncounterResult(result);
            
            // The main logic now happens inside this state update
            setGameState(prev => {
                if (!prev || !prev.pirateEncounter) return prev;
                
                let newPlayerStats = { ...prev.playerStats };
                
                newPlayerStats.netWorth -= result.creditsLost;
                
                let shipInstanceId = shipForEncounter!.instanceId;
                
                const fleet = [...newPlayerStats.fleet];
                const shipIndex = fleet.findIndex(s => s.instanceId === shipInstanceId);

                if (shipIndex !== -1) {
                    const ship = { ...fleet[shipIndex] };
                    ship.health = Math.max(0, ship.health - result.damageTaken);

                    if (ship.health <= 0) {
                        if(prev.difficulty === 'Hardcore') {
                            setTimeout(() => toast({ variant: "destructive", title: "Game Over", description: "Your ship has been destroyed. Your journey ends here." }), 0);
                            return { ...prev, isGameOver: true };
                        } else {
                            setTimeout(() => toast({ variant: "destructive", title: "Ship Destroyed!", description: "You have been reborn in the Sol system with a new vessel." }), 0);
                            // handle rebirth for that specific ship, maybe remove it from fleet
                            const newFleet = prev.playerStats.fleet.filter(s => s.instanceId !== ship.instanceId);
                            newPlayerStats.fleet = newFleet.length > 0 ? newFleet : [initialShip]; // Ensure player always has a ship
                        }
                    } else {
                        ship.status = ship.health < (hullUpgrades[ship.hullLevel - 1]?.health || 100) / 2 ? 'repair_needed' : 'operational';
                        fleet[shipIndex] = ship;
                        newPlayerStats.fleet = fleet;
                    }
                }
                
                if (pirate.missionId && pirate.missionType) {
                     const missionsKey = `${pirate.missionType}s` as 'escortMissions' | 'tradeContracts' | 'taxiMissions' | 'militaryMissions';
                     const missions = [...((newPlayerStats as any)[missionsKey] || [])];
                     const missionIndex = missions.findIndex((m: any) => m.id === pirate.missionId);

                    if (result.outcome === 'failure' && missionIndex > -1) {
                        missions[missionIndex] = { ...missions[missionIndex], status: 'Failed', assignedShipInstanceId: null };
                        (newPlayerStats as any)[missionsKey] = missions;
                        newPlayerStats.reputation = Math.max(0, newPlayerStats.reputation - 5);
                        newPlayerStats.events.push({
                            id: `evt_${Date.now()}_mission_fail`,
                            timestamp: Date.now(),
                            type: 'Mission',
                            description: `Failed mission to ${missions[missionIndex].toSystem}.`,
                            value: 0,
                            reputationChange: -5,
                            isMilestone: false,
                        });
                    }
                }

                newPlayerStats = syncActiveShipStats(newPlayerStats);

                return { ...prev, playerStats: newPlayerStats, pirateEncounter: null };
            });
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Encounter Resolution Failed", description: errorMessage });
        }
    });
  }, [gameState, setGameState, toast]);

  const handleCloseEncounterDialog = () => {
    setEncounterResult(null);
  }

  return {
    isResolvingEncounter,
    encounterResult,
    handlePirateAction,
    handleCloseEncounterDialog,
  };
}
