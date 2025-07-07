import { useContext, useEffect, useCallback } from 'react';
import type { GameState, PlayerStats, ActiveObjective, QuestTask } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { constructionThemes } from '@/lib/construction-themes';
import { useQuests } from './use-quests'; // Assuming useQuests is in the same directory

export function useConstruction(
  gameState: GameState | null,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>,
  updateObjectiveProgress: (objectiveType: QuestTask['type'], state: GameState) => [GameState, ActiveObjective[]] // Import and use the type
) {
  const { toast } = useToast();

  const handleConstructionClick = useCallback((income: number) => {
    let completedToastMessages: {title: string, description: string}[] = [];
    setGameState(prev => {
        if (!prev) return null;
        let baseState = { ...prev, playerStats: { ...prev.playerStats, netWorth: prev.playerStats.netWorth + income } };
        const [newState, completedObjectives] = updateObjectiveProgress('construction', baseState);

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
    if (!gameState || (gameState.playerStats.constructionAutoClickerBots || 0) === 0) {
        return;
    }

    const intervalId = setInterval(() => {
        setGameState(prev => {
            if (!prev || (prev.playerStats.constructionAutoClickerBots || 0) === 0) {
                clearInterval(intervalId);
                return prev;
            }

            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const zoneType = currentSystem?.zoneType;
            const theme = (zoneType && constructionThemes[zoneType]) ? constructionThemes[zoneType] : constructionThemes['Default'];

            const totalPartnerShare = (prev.playerStats.constructionContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
            const incomePerClick = theme.baseIncome * prev.playerStats.constructionLevel;
            const incomePerSecond = (prev.playerStats.constructionAutoClickerBots || 0) * incomePerClick * (1 - totalPartnerShare);

            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + incomePerSecond,
            };

            const [newState, completedObjectives] = updateObjectiveProgress('construction', { ...prev, playerStats: newPlayerStats });

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
  }, [gameState?.playerStats.constructionAutoClickerBots, gameState?.currentSystem, gameState?.playerStats.constructionLevel, gameState?.playerStats.constructionContract, updateObjectiveProgress, setGameState, toast]); // Add dependencies

  return {
    handleConstructionClick,
  };
}
