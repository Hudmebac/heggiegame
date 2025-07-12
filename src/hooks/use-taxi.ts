

'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import type { GameState, TaxiMission, PlayerShip } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { STATIC_TAXI_MISSIONS } from '@/lib/taxi-missions';
import { ROUTES } from '@/lib/systems';
import { hullUpgrades } from '@/lib/upgrades';

const getConnectedSystems = (systemName: string): string[] => {
    const connected = new Set<string>();
    ROUTES.forEach(route => {
        if (route.from === systemName) connected.add(route.to);
        if (route.to === systemName) connected.add(route.from);
    });
    return Array.from(connected);
}

export function useTaxi(
  gameState: GameState | null,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
  const { toast } = useToast();
  const [isGeneratingMissions, startMissionGeneration] = useTransition();

  const handleGenerateTaxiMissions = useCallback(() => {
    if (!gameState) return;
    const { currentSystem, playerStats } = gameState;

    startMissionGeneration(() => {
        const connectedSystems = getConnectedSystems(currentSystem);
        if (connectedSystems.length === 0) {
            toast({ variant: "destructive", title: "Isolation", description: "No outbound routes from this system to generate fares for." });
            return;
        }

        const shuffledMissions = [...STATIC_TAXI_MISSIONS].sort(() => 0.5 - Math.random());
        const missionCount = 4 + Math.floor(Math.random() * 2); // 4 or 5 missions
        
        const newMissions: TaxiMission[] = shuffledMissions.slice(0, missionCount).map((missionTemplate, index) => {
            const repModifier = 1 + (playerStats.reputation / 200); // up to 50% bonus at 100 rep
            const fare = Math.round(missionTemplate.fare * repModifier);
            const bonus = Math.round(missionTemplate.bonus * repModifier);

            return {
                ...missionTemplate,
                id: `${Date.now()}-${index}`,
                fromSystem: currentSystem,
                toSystem: connectedSystems[Math.floor(Math.random() * connectedSystems.length)],
                status: 'Available',
                fare,
                bonus,
            };
        });
        
        setGameState(prev => {
          if (!prev) return null;
          const activeMissions = (prev.playerStats.taxiMissions || []).filter(m => m.status !== 'Available');
          return {
            ...prev,
            playerStats: {
              ...prev.playerStats,
              taxiMissions: [...activeMissions, ...newMissions],
              lastTaxiMissionGeneration: Date.now(),
            }
          };
        });
        toast({ title: 'Dispatch Updated', description: 'New fares are available on the network.' });
    });
  }, [gameState, setGameState, toast]);
  
  const handleAcceptTaxiMission = useCallback((missionId: string, assignedShipId?: number) => {
    setGameState(prev => {
        if(!prev) return null;
        
        const mission = prev.playerStats.taxiMissions.find(m => m.id === missionId);
        if (!mission) {
            setTimeout(() => toast({ variant: "destructive", title: "Mission Not Found", description: "This fare is no longer available." }), 0);
            return prev;
        }

        const shipToAssign = assignedShipId ? prev.playerStats.fleet.find(s => s.instanceId === assignedShipId) : null;
        if (!shipToAssign) {
            setTimeout(() => toast({ variant: "destructive", title: "Assignment Failed", description: "Could not find a suitable ship to assign." }), 0);
            return prev;
        }

        const updatedMissions = prev.playerStats.taxiMissions.map(m => 
            m.id === missionId ? { 
                ...m, 
                status: 'Active' as const, 
                startTime: Date.now(), 
                progress: 0,
                assignedShipInstanceId: shipToAssign.instanceId,
                assignedShipName: shipToAssign.name,
            } : m
        );
        
        setTimeout(() => toast({ title: "Fare Accepted!", description: `Route to ${mission.toSystem} for ${mission.passengerName} is now active.` }), 0);

        return {
            ...prev,
            playerStats: {
              ...prev.playerStats,
              taxiMissions: updatedMissions,
            }
        };
    });
  }, [setGameState, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        if (!prev || prev.isGameOver) return prev;
      
        const activeMissions = (prev.playerStats.taxiMissions || []).filter(m => m.status === 'Active');
        if (activeMissions.length === 0) return prev;

        let stateChanged = false;
        const now = Date.now();
        const updatedMissions = [...(prev.playerStats.taxiMissions || [])];
        let newPlayerStats = { ...prev.playerStats };
        let newEvents = [...prev.playerStats.events];
        let newFleet = [...prev.playerStats.fleet];

        activeMissions.forEach(mission => {
          const index = updatedMissions.findIndex(m => m.id === mission.id);
          const shipIndex = newFleet.findIndex(s => s.instanceId === mission.assignedShipInstanceId);
          if (index === -1 || shipIndex === -1) return;

          const assignedShip = newFleet[shipIndex];
          
          const powerCoreBonus = 1 + ((assignedShip.powerCoreLevel - 1) * 0.05);
          const overdriveBonus = assignedShip.overdriveEngine ? 1.1 : 1;
          const stabilizerBonus = assignedShip.warpStabilizer ? 1.05 : 1;
          const timeModifier = powerCoreBonus * overdriveBonus * stabilizerBonus;

          const elapsed = (now - (mission.startTime || now)) / 1000;
          const progress = Math.min(100, (elapsed / (mission.duration / timeModifier)) * 100);
          
          if (updatedMissions[index].progress !== progress) {
            updatedMissions[index].progress = progress;
            stateChanged = true;
          }
          
          if (progress >= 100) {
            updatedMissions[index].status = 'Completed';
            updatedMissions[index].assignedShipInstanceId = null;
            
            const earnedBonus = elapsed < mission.duration;
            const totalPayout = mission.fare + (earnedBonus ? mission.bonus : 0);
            const repChange = 1;
            newPlayerStats.netWorth += totalPayout;
            newPlayerStats.reputation += repChange;

            const fuelConsumed = mission.requiredFuel || 0;
            const maxHealth = hullUpgrades[assignedShip.hullLevel - 1]?.health || 100;
            const wearAndTear = Math.max(1, Math.round(maxHealth * (Math.random() * 0.02 + 0.01)));

            newFleet[shipIndex].fuel = Math.max(0, (newFleet[shipIndex].fuel || 0) - fuelConsumed);
            const newHealth = Math.max(0, newFleet[shipIndex].health - wearAndTear);
            if(newHealth <= 0) {
                newFleet[shipIndex].health = 0;
                newFleet[shipIndex].status = 'destroyed';
            } else {
                newFleet[shipIndex].health = newHealth;
                if(newHealth < maxHealth / 2 && newFleet[shipIndex].status === 'operational') {
                    newFleet[shipIndex].status = 'repair_needed';
                }
            }
            
            newEvents.push({
                id: `evt_${Date.now()}_${mission.id}`,
                timestamp: Date.now(),
                type: 'Mission',
                description: `Completed Taxi fare for ${mission.passengerName}.`,
                value: totalPayout,
                reputationChange: repChange,
                isMilestone: false,
            });

            const toastDescription = earnedBonus 
                ? `Dropped off ${mission.passengerName} in ${mission.toSystem}. You earned ${totalPayout.toLocaleString()}¢, including a time bonus!`
                : `Dropped off ${mission.passengerName} in ${mission.toSystem}. You earned ${mission.fare.toLocaleString()}¢.`;
            
            setTimeout(() => toast({ title: "Fare Complete!", description: toastDescription }), 0);
          }
        });

        if (stateChanged) {
          return { ...prev, playerStats: { ...newPlayerStats, taxiMissions: updatedMissions, events: newEvents, fleet: newFleet }};
        }

        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setGameState, toast]);

  return {
    handleGenerateTaxiMissions,
    handleAcceptTaxiMission,
    isGeneratingMissions,
  };
}
