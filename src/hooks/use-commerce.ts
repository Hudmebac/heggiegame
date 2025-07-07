import { useContext, useEffect, useCallback } from 'react';
import type { GameState, PlayerStats, ActiveObjective, QuestTask } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { commerceThemes } from '@/lib/commerce-themes';
import { useQuests } from './use-quests'; // Assuming useQuests is in the same directory

export function useCommerce(
  gameState: GameState | null,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>,
  updateObjectiveProgress: (objectiveType: QuestTask['type'], state: GameState) => [GameState, ActiveObjective[]] // Import and use the type
) {
  const { toast } = useToast();

  const handleCommerceClick = useCallback((income: number) => {
    let completedToastMessages: {title: string, description: string}[] = [];
    setGameState(prev => {
        if (!prev) return null;
        let baseState = { ...prev, playerStats: { ...prev.playerStats, netWorth: prev.playerStats.netWorth + income } };
        const [newState, completedObjectives] = updateObjectiveProgress('commerce', baseState);

        completedObjectives.forEach(obj => {
            completedToastMessages.push({ title: "Objective Complete!", description: `You earned ${obj.reward} for completing "${obj.title}".` });
        });

        return newState;
    });

    if (completedToastMessages.length > 0) {
        setTimeout(() => {
            completedToastMessages.forEach(msg => toast(msg));
        }, 0);
    }
  }, [setGameState, updateObjectiveProgress, toast]); // Add dependencies

  useEffect(() => {
    if (!gameState || (gameState.playerStats.commerceAutoClickerBots || 0) === 0) {
        return;
    }

    const intervalId = setInterval(() => {
        setGameState(prev => {
            if (!prev || (prev.playerStats.commerceAutoClickerBots || 0) === 0) {
                clearInterval(intervalId);
                return prev;
            }

            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const zoneType = currentSystem?.zoneType;
            const theme = (zoneType && commerceThemes[zoneType]) ? commerceThemes[zoneType] : commerceThemes['Default'];

            const totalPartnerShare = (prev.playerStats.commerceContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
            const incomePerClick = theme.baseIncome * prev.playerStats.commerceLevel;
            const incomePerSecond = (prev.playerStats.commerceAutoClickerBots || 0) * incomePerClick * (1 - totalPartnerShare);

            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + incomePerSecond,
            };

            const [newState, completedObjectives] = updateObjectiveProgress('commerce', { ...prev, playerStats: newPlayerStats });

            if (completedObjectives.length > 0) {
                setTimeout(() => {
                    completedObjectives.forEach(obj => {
                        toast({ title: "Objective Complete!", description: `You earned ${obj.reward} for completing "${obj.title}".` });
                    });
                }, 0);
            }

            return newState;
        });
    }, 1000); // every second

    return () => clearInterval(intervalId);
  }, [gameState?.playerStats.commerceAutoClickerBots, gameState?.currentSystem, gameState?.playerStats.commerceLevel, gameState?.playerStats.commerceContract, updateObjectiveProgress, setGameState, toast]); // Add dependencies

  return {
    handleCommerceClick,
  };
}
