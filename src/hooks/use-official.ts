
'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import type { GameState, DiplomaticMission } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { STATIC_DIPLOMATIC_MISSIONS } from '@/lib/diplomatic-missions';

export function useOfficial(
  gameState: GameState | null,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
  const { toast } = useToast();
  const [isGeneratingMissions, startMissionGeneration] = useTransition();

  const handleGenerateDiplomaticMissions = useCallback(() => {
    if (!gameState) return;
    const { playerStats } = gameState;

    startMissionGeneration(() => {
      const shuffledMissions = [...STATIC_DIPLOMATIC_MISSIONS].sort(() => 0.5 - Math.random());
      const missionCount = 4 + Math.floor(Math.random() * 2);

      const newMissions: DiplomaticMission[] = shuffledMissions.slice(0, missionCount).map((missionTemplate, index) => {
        const influenceModifier = 1 + ((playerStats.influence || 0) / 500); // Up to 20% bonus at 100 influence
        const payoutCredits = Math.round(missionTemplate.payoutCredits * influenceModifier);
        const payoutInfluence = Math.round(missionTemplate.payoutInfluence * influenceModifier);

        return {
          ...missionTemplate,
          id: `${Date.now()}-${index}`,
          status: 'Available',
          payoutCredits,
          payoutInfluence,
        };
      });

      setGameState(prev => {
        if (!prev) return null;
        const activeMissions = (prev.playerStats.diplomaticMissions || []).filter(m => m.status !== 'Available');
        return {
          ...prev,
          playerStats: {
            ...prev.playerStats,
            diplomaticMissions: [...activeMissions, ...newMissions]
          }
        };
      });
      toast({ title: 'New Mandates Received', description: 'Your office has received new diplomatic directives.' });
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
        let newEvents = [...prev.playerStats.events];
        const index = updatedMissions.findIndex(m => m.id === activeMission.id);

        const elapsed = (now - (activeMission.startTime || now)) / 1000;
        const progress = Math.min(100, (elapsed / activeMission.duration) * 100);
        
        if (updatedMissions[index].progress !== progress) {
            updatedMissions[index].progress = progress;
            stateChanged = true;
        }
        
        if (progress >= 100) {
            updatedMissions[index].status = 'Completed';
            
            const repChange = 3;
            newPlayerStats.netWorth += activeMission.payoutCredits;
            newPlayerStats.influence = (newPlayerStats.influence || 0) + activeMission.payoutInfluence;
            newPlayerStats.reputation += repChange;

            newEvents.push({
                id: `evt_${Date.now()}_${activeMission.id}`,
                timestamp: Date.now(),
                type: 'Mission',
                description: `Resolved diplomatic mission: ${activeMission.title}.`,
                value: activeMission.payoutCredits,
                reputationChange: repChange,
                isMilestone: true,
            });

            setTimeout(() => toast({ title: "Mission Success!", description: `"${activeMission.title}" has been successfully resolved. You gained ${activeMission.payoutInfluence} influence.` }), 0);
        }

        if (stateChanged) {
          return { ...prev, playerStats: { ...newPlayerStats, diplomaticMissions: updatedMissions, events: newEvents }};
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
