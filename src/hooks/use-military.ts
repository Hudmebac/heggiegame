
'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import type { GameState, Pirate, MilitaryMission } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { pirateNames, shipTypes } from '@/lib/pirates';
import { STATIC_MILITARY_MISSIONS } from '@/lib/military-missions';
import { SYSTEMS } from '@/lib/systems';


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


export function useMilitary(
  gameState: GameState | null,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
  const { toast } = useToast();
  const [isGeneratingMissions, startMissionGeneration] = useTransition();

  const handleGenerateMilitaryMissions = useCallback(() => {
    if (!gameState) return;
    const { playerStats } = gameState;

    startMissionGeneration(() => {
        const shuffledMissions = [...STATIC_MILITARY_MISSIONS].sort(() => 0.5 - Math.random());
        const missionCount = 4 + Math.floor(Math.random() * 2); // 4 or 5 missions
        
        const newMissions: MilitaryMission[] = shuffledMissions.slice(0, missionCount).map((missionTemplate, index) => {
            // Adjust payout based on reputation
            const repModifier = 1 + (playerStats.reputation / 150); // up to ~66% bonus at 100 rep
            const payout = Math.round(missionTemplate.payout * repModifier);
            const targetSystem = SYSTEMS[Math.floor(Math.random() * SYSTEMS.length)].name;

            return {
                ...missionTemplate,
                id: `${Date.now()}-${index}`,
                system: targetSystem,
                status: 'Available',
                payout,
            };
        });
        
        setGameState(prev => {
          if (!prev) return null;
          const activeMissions = (prev.playerStats.militaryMissions || []).filter(m => m.status !== 'Available');
          return {
            ...prev,
            playerStats: {
              ...prev.playerStats,
              militaryMissions: [...activeMissions, ...newMissions]
            }
          };
        });
        toast({ title: 'New Directives Received', description: 'High-command has issued new strike missions.' });
    });
  }, [gameState, setGameState, toast]);

  const handleAcceptMilitaryMission = useCallback((missionId: string) => {
    setGameState(prev => {
        if(!prev) return null;

        const mission = prev.playerStats.militaryMissions.find(m => m.id === missionId);
        if (!mission) {
            setTimeout(() => toast({ variant: "destructive", title: "Mission Unavailable", description: "This directive is no longer active." }), 0);
            return prev;
        }

        const activeMission = prev.playerStats.militaryMissions.find(m => m.status === 'Active');
        if (activeMission) {
            setTimeout(() => toast({ variant: "destructive", title: "Mission Conflict", description: `You are already on an active mission: "${activeMission.title}".` }), 0);
            return prev;
        }

        const updatedMissions = prev.playerStats.militaryMissions.map(m =>
            m.id === missionId ? { ...m, status: 'Active' as const, startTime: Date.now(), progress: 0 } : m
        );

        setTimeout(() => toast({ title: "Mission Accepted!", description: `You are now en route to strike ${mission.target} in the ${mission.system} system.` }), 0);

        return {
            ...prev,
            playerStats: {
              ...prev.playerStats,
              militaryMissions: updatedMissions,
            }
        };
    });
  }, [setGameState, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        if (!prev || prev.isGameOver) return prev;
      
        const activeMission = (prev.playerStats.militaryMissions || []).find(m => m.status === 'Active');
        if (!activeMission) return prev;

        let stateChanged = false;
        const now = Date.now();
        const updatedMissions = [...prev.playerStats.militaryMissions];
        let newPlayerStats = { ...prev.playerStats };
        const index = updatedMissions.findIndex(m => m.id === activeMission.id);

        const elapsed = (now - (activeMission.startTime || now)) / 1000;
        const progress = Math.min(100, (elapsed / activeMission.duration) * 100);
        
        if (updatedMissions[index].progress !== progress) {
            updatedMissions[index].progress = progress;
            stateChanged = true;
        }
        
        if (progress >= 100) {
            updatedMissions[index].status = 'Completed';
            newPlayerStats.netWorth += activeMission.payout;
            newPlayerStats.reputation += 5; // Fighters get more rep
            setTimeout(() => toast({ title: "Mission Success!", description: `Target neutralized. You earned ${activeMission.payout.toLocaleString()}¢ and gained reputation.` }), 0);
        } else {
            const riskValue = { 'Low': 0.003, 'Medium': 0.008, 'High': 0.015, 'Critical': 0.03 }[activeMission.riskLevel];
            if (!newPlayerStats.pirateEncounter && Math.random() < riskValue) {
                newPlayerStats.pirateEncounter = {
                    ...generateRandomPirate(prev.crew.some(c => c.role === 'Navigator')),
                    missionId: activeMission.id,
                    missionType: 'military',
                };
                stateChanged = true;
                setTimeout(() => toast({ variant: "destructive", title: "Enemy Contact!", description: `Hostile forces intercepted en route to ${activeMission.system}!` }), 0);
            }
        }

        if (stateChanged) {
          return { ...prev, playerStats: { ...newPlayerStats, militaryMissions: updatedMissions }};
        }

        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setGameState, toast]);

  return {
    handleGenerateMilitaryMissions,
    handleAcceptMilitaryMission,
    isGeneratingMissions,
  };
}
