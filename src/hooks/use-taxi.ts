
'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import type { GameState, TaxiMission } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { STATIC_TAXI_MISSIONS } from '@/lib/taxi-missions';
import { ROUTES } from '@/lib/systems';

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
              taxiMissions: [...activeMissions, ...newMissions]
            }
          };
        });
        toast({ title: 'Dispatch Updated', description: 'New fares are available on the network.' });
    });
  }, [gameState, setGameState, toast]);
  
  const handleAcceptTaxiMission = useCallback((missionId: string) => {
    if (!gameState) return;
      
    const mission = gameState.playerStats.taxiMissions.find(m => m.id === missionId);
    if (!mission) {
      toast({ variant: "destructive", title: "Mission Not Found", description: "This fare is no longer available." });
      return;
    }

    setGameState(prev => {
      if(!prev) return null;
      const updatedMissions = prev.playerStats.taxiMissions.map(m => 
          m.id === missionId ? { ...m, status: 'Active' as const, startTime: Date.now(), progress: 0 } : m
      );
      return {
          ...prev,
          playerStats: {
            ...prev.playerStats,
            taxiMissions: updatedMissions,
          }
      };
    });

    toast({ title: "Fare Accepted!", description: `Route to ${mission.toSystem} for ${mission.passengerName} is now active.` });

  }, [gameState, setGameState, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        if (!prev || prev.isGameOver) return prev;
      
        const activeMissions = prev.playerStats.taxiMissions.filter(m => m.status === 'Active');
        if (activeMissions.length === 0) return prev;

        let stateChanged = false;
        const now = Date.now();
        const updatedMissions = [...prev.playerStats.taxiMissions];
        let newPlayerStats = { ...prev.playerStats };

        activeMissions.forEach(mission => {
          const index = updatedMissions.findIndex(m => m.id === mission.id);
          if (index === -1) return;

          const elapsed = (now - (mission.startTime || now)) / 1000;
          const progress = Math.min(100, (elapsed / mission.duration) * 100);
          updatedMissions[index].progress = progress;
          stateChanged = true;
          
          if (progress >= 100) {
            updatedMissions[index].status = 'Completed';
            const totalPayout = mission.fare + mission.bonus;
            newPlayerStats.netWorth += totalPayout;
            newPlayerStats.reputation += 1; // Base reputation gain
            setTimeout(() => toast({ title: "Fare Complete!", description: `Dropped off ${mission.passengerName} in ${mission.toSystem}. You earned ${totalPayout.toLocaleString()}¢.` }), 0);
          }
        });

        if (stateChanged) {
          return { ...prev, playerStats: { ...newPlayerStats, taxiMissions: updatedMissions }};
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
