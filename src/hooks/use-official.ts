'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import type { GameState, DiplomaticMission } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { runDiplomaticMissionGeneration } from '@/app/actions';

export function useOfficial(
  gameState: GameState | null,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
  const { toast } = useToast();
  const [isGeneratingMissions, startMissionGeneration] = useTransition();

  const handleGenerateDiplomaticMissions = useCallback(() => {
    if (!gameState) return;
    const { currentSystem, playerStats } = gameState;

    startMissionGeneration(async () => {
      try {
        const result = await runDiplomaticMissionGeneration({
          influence: playerStats.influence || 0,
          currentSystem,
        });

        setGameState(prev => {
          if (!prev) return null;
          const activeMissions = (prev.playerStats.diplomaticMissions || []).filter(m => m.status !== 'Available');
          return {
            ...prev,
            playerStats: {
              ...prev.playerStats,
              diplomaticMissions: [...activeMissions, ...result.missions]
            }
          };
        });
        toast({ title: 'New Mandates Received', description: 'Your office has received new diplomatic directives.' });

      } catch (error) {
        console.error("Failed to generate diplomatic missions", error);
        toast({ variant: "destructive", title: "Communication Error", description: "Could not retrieve new mandates from the Galactic Council." });
      }
    });
  }, [gameState, setGameState, toast]);

  const handleAcceptDiplomaticMission = useCallback((missionId: string) => {
    setGameState(prev => {
        if(!prev) return null;

        const mission = prev.playerStats.diplomaticMissions.find(m => m.id === missionId);
        if (!mission) {
            setTimeout(() => toast({ variant: "destructive", title: "Mandate Unavailable", description: "This directive is no longer active." }), 0);
            return prev;
        }
        
        const activeMission = prev.playerStats.diplomaticMissions.find(m => m.status === 'Active');
        if (activeMission) {
            setTimeout(() => toast({ variant: "destructive", title: "Mission Conflict", description: `You are already undertaking: "${activeMission.title}".` }), 0);
            return prev;
        }

        const updatedMissions = prev.playerStats.diplomaticMissions.map(m =>
            m.id === missionId ? { ...m, status: 'Active' as const, startTime: Date.now(), progress: 0 } : m
        );
        
        setTimeout(() => toast({ title: "Mandate Accepted", description: `You are now working on "${mission.title}".` }), 0);
        
        return {
            ...prev,
            playerStats: {
              ...prev.playerStats,
              diplomaticMissions: updatedMissions,
            }
        };
    });
  }, [setGameState, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        if (!prev || prev.isGameOver) return prev;
      
        const activeMission = (prev.playerStats.diplomaticMissions || []).find(m => m.status === 'Active');
        if (!activeMission) return prev;

        let stateChanged = false;
        const now = Date.now();
        const updatedMissions = [...(prev.playerStats.diplomaticMissions || [])];
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
            newPlayerStats.netWorth += activeMission.payoutCredits;
            newPlayerStats.influence = (newPlayerStats.influence || 0) + activeMission.payoutInfluence;
            newPlayerStats.reputation += 3;
            setTimeout(() => toast({ title: "Mission Success!", description: `"${activeMission.title}" has been successfully resolved. You gained ${activeMission.payoutInfluence} influence.` }), 0);
        }

        if (stateChanged) {
          return { ...prev, playerStats: { ...newPlayerStats, diplomaticMissions: updatedMissions }};
        }

        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setGameState, toast]);

  return {
    handleGenerateDiplomaticMissions,
    handleAcceptDiplomaticMission,
    isGeneratingMissions,
  };
}
