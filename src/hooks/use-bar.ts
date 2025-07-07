'use client';

import { useCallback, useEffect } from 'react';
import type { GameState } from '@/lib/types';
import { barThemes } from '@/lib/bar-themes';
import { useQuests } from '@/hooks/use-quests'; // Assuming useQuests is at this path
import { useToast } from '@/hooks/use-toast';

type UseBarProps = {
  gameState: GameState | null;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
};

export function useBar({ gameState, setGameState }: UseBarProps) {
  const { updateObjectiveProgress } = useQuests({ gameState, setGameState }); // Get updateObjectiveProgress from useQuests
  const { toast } = useToast(); // Use toast here for click completion messages

  const handleBarClick = useCallback(
    (income: number) => {
      let completedToastMessages: { title: string; description: string }[] = [];
      setGameState(prev => {
        if (!prev) return null;
        const baseState = {
          ...prev,
          playerStats: { ...prev.playerStats, netWorth: prev.playerStats.netWorth + income },
        };
        const [newState, completedObjectives] = updateObjectiveProgress('bar', baseState);

        completedObjectives.forEach(obj => {
          completedToastMessages.push({
            title: 'Objective Complete!',
            description: `You earned ${obj.reward} for completing "${obj.title}".`,
          });
        });

        return newState;
      });

      if (completedToastMessages.length > 0) {
        setTimeout(() => {
          completedToastMessages.forEach(msg => toast(msg));
        }, 0);
      }
    },
    [setGameState, updateObjectiveProgress, toast]
  );

  useEffect(() => {
    if (!gameState || (gameState.playerStats.autoClickerBots || 0) === 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setGameState(prev => {
        if (!prev || (prev.playerStats.autoClickerBots || 0) === 0) {
          clearInterval(intervalId);
          return prev;
        }

        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const zoneType = currentSystem?.zoneType;
        const theme = zoneType && barThemes[zoneType] ? barThemes[zoneType] : barThemes['Default'];

        const totalPartnerShare = (prev.playerStats.barContract?.partners || []).reduce(
          (acc, p) => acc + p.percentage,
          0
        );
        const incomePerClick = theme.baseIncome * prev.playerStats.barLevel;
        const incomePerSecond =
          (prev.playerStats.autoClickerBots || 0) * incomePerClick * (1 - totalPartnerShare);

        const newPlayerStats = {
          ...prev.playerStats,
          netWorth: prev.playerStats.netWorth + incomePerSecond,
        };

        let postObjectiveState = { ...prev, playerStats: newPlayerStats };
        const [newState, completedObjectives] = updateObjectiveProgress('bar', postObjectiveState);

        if (completedObjectives.length > 0) {
          setTimeout(() => {
            completedObjectives.forEach(obj => {
              toast({
                title: 'Objective Complete!',
                description: `You earned ${obj.reward} for completing "${obj.title}".`,
              });
            });
          }, 0);
        }

        return newState;
      });
    }, 1000); // every second

    return () => clearInterval(intervalId);
  }, [
    gameState?.playerStats.autoClickerBots,
    gameState?.currentSystem,
    gameState?.playerStats.barLevel,
    gameState?.playerStats.barContract,
    setGameState,
    updateObjectiveProgress,
    toast,
  ]);

  return {
    handleBarClick,
  };
}