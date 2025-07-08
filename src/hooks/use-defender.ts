
'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import type { GameState, Pirate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { runGenerateEscortMissions } from '@/app/actions';
import { pirateNames, shipTypes } from '@/lib/pirates';

const generateRandomPirate = (hasNavigator: boolean): Pirate => {
    const weightedThreats: Pirate['threatLevel'][] = hasNavigator
        ? ['Low', 'Low', 'Low', 'Medium', 'Medium', 'Medium', 'High', 'High', 'Critical']
        : ['Low', 'Medium', 'High', 'Critical'];
    const threat = weightedThreats[Math.floor(Math.random() * weightedThreats.length)];
    return {
        name: pirateNames[Math.floor(Math.random() * pirateNames.length)],
        shipType: shipTypes[Math.floor(Math.random() * shipTypes.length)],
        threatLevel: threat,
    };
}


export function useDefender(
  gameState: GameState | null,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
  const { toast } = useToast();
  const [isGeneratingMissions, startMissionGeneration] = useTransition();

  const handleGenerateEscortMissions = useCallback(() => {
    if (!gameState) return;

    startMissionGeneration(async () => {
      try {
        const result = await runGenerateEscortMissions({
          reputation: gameState.playerStats.reputation,
          currentSystem: gameState.currentSystem,
        });
        setGameState(prev => {
          if (!prev) return null;
          // Filter out old "Available" missions and add new ones
          const activeMissions = (prev.playerStats.escortMissions || []).filter(m => m.status !== 'Available');
          const newMissions = result.missions.map(m => ({...m, status: 'Available' as const}));
          return {
            ...prev,
            playerStats: {
              ...prev.playerStats,
              escortMissions: [...activeMissions, ...newMissions]
            }
          };
        });
        toast({ title: 'Security Channel Updated', description: 'New escort contracts are available.' });
      } catch (error) {
        console.error("Failed to generate escort missions:", error);
        toast({ variant: "destructive", title: "Network Error", description: "Could not retrieve new missions at this time." });
      }
    });
  }, [gameState, setGameState, toast]);

  const handleAcceptEscortMission = useCallback((missionId: string) => {
    setGameState(prev => {
        if(!prev) return null;

        const mission = prev.playerStats.escortMissions.find(m => m.id === missionId);
        if (!mission) {
            setTimeout(() => toast({ variant: "destructive", title: "Mission Not Found", description: "This contract is no longer available." }), 0);
            return prev;
        }

        const assignedShipIds = new Set(prev.playerStats.escortMissions.filter(m => m.status === 'Active' && m.assignedShipInstanceId).map(m => m.assignedShipInstanceId));
        const availableShip = prev.playerStats.fleet.find(s => !assignedShipIds.has(s.instanceId));

        if (!availableShip) {
            setTimeout(() => toast({ variant: "destructive", title: "No Ships Available", description: "All your ships are currently on other missions." }), 0);
            return prev;
        }

        const updatedMissions = prev.playerStats.escortMissions.map(m =>
            m.id === missionId ? {
                ...m,
                status: 'Active' as const,
                startTime: Date.now(),
                progress: 0,
                assignedShipInstanceId: availableShip.instanceId,
                assignedShipName: availableShip.name,
            } : m
        );

        setTimeout(() => toast({ title: "Contract Accepted!", description: `${availableShip.name} is now escorting ${mission.clientName} to ${mission.toSystem}.` }), 0);

        return {
            ...prev,
            playerStats: {
              ...prev.playerStats,
              escortMissions: updatedMissions,
            }
        };
    });
  }, [setGameState, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        if (!prev || prev.isGameOver) return prev;
      
        const activeMissions = (prev.playerStats.escortMissions || []).filter(m => m.status === 'Active');
        if (activeMissions.length === 0) return prev;

        let stateChanged = false;
        const now = Date.now();
        const updatedMissions = [...prev.playerStats.escortMissions];
        let newPlayerStats = { ...prev.playerStats };

        activeMissions.forEach(mission => {
          const index = updatedMissions.findIndex(m => m.id === mission.id);
          if (index === -1) return;

          const elapsed = (now - (mission.startTime || now)) / 1000;
          const progress = Math.min(100, (elapsed / mission.duration) * 100);
          
          if (updatedMissions[index].progress !== progress) {
              updatedMissions[index].progress = progress;
              stateChanged = true;
          }
          
          if (progress >= 100) {
            updatedMissions[index].status = 'Completed';
            updatedMissions[index].assignedShipInstanceId = null;
            newPlayerStats.netWorth += mission.payout;
            newPlayerStats.reputation += 2; // Defenders get more rep
            setTimeout(() => toast({ title: "Escort Complete!", description: `Safely escorted ${mission.clientName} to ${mission.toSystem}. You earned ${mission.payout.toLocaleString()}¢.` }), 0);
          } else {
            // Pirate risk check - higher for defenders
            const riskValue = { 'Low': 0.01, 'Medium': 0.03, 'High': 0.06, 'Critical': 0.1 }[mission.riskLevel];
            if (!newPlayerStats.pirateEncounter && Math.random() < riskValue) {
                newPlayerStats.pirateEncounter = {
                    ...generateRandomPirate(prev.crew.some(c => c.role === 'Navigator')),
                    missionId: mission.id,
                    missionType: 'escort',
                };
                stateChanged = true;
                setTimeout(() => toast({ variant: "destructive", title: "Ambush!", description: `Your escort convoy is under attack en route to ${mission.toSystem}!` }), 0);
            }
          }
        });

        if (stateChanged) {
          return { ...prev, playerStats: { ...newPlayerStats, escortMissions: updatedMissions }};
        }

        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setGameState, toast]);

  return {
    handleGenerateEscortMissions,
    handleAcceptEscortMission,
    isGeneratingMissions,
  };
}
