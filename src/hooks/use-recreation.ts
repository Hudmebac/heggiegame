import { useContext, useEffect, useCallback } from 'react';
import type { GameState, PlayerStats, ActiveObjective, QuestTask } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { recreationThemes } from '@/lib/recreation-themes';
import { useQuests } from './use-quests'; // Assuming useQuests is in the same directory

export function useRecreation(
  gameState: GameState | null,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>,
  updateObjectiveProgress: (objectiveType: QuestTask['type'], state: GameState) => [GameState, ActiveObjective[]] // Import and use the type
) {
  const { toast } = useToast();

  const handleRecreationClick = useCallback((income: number) => {
    let completedToastMessages: {title: string, description: string}[] = [];
    setGameState(prev => {
        if (!prev) return null;
        let baseState = { ...prev, playerStats: { ...prev.playerStats, netWorth: prev.playerStats.netWorth + income } };
        const [newState, completedObjectives] = updateObjectiveProgress('recreation', baseState);

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
    if (!gameState || (gameState.playerStats.recreationAutoClickerBots || 0) === 0) {
        return;
    }

    const intervalId = setInterval(() => {
        setGameState(prev => {
            if (!prev || (prev.playerStats.recreationAutoClickerBots || 0) === 0) {
                clearInterval(intervalId);
                return prev;
            }

            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const zoneType = currentSystem?.zoneType;
            const theme = (zoneType && recreationThemes[zoneType]) ? recreationThemes[zoneType] : recreationThemes['Default'];

            const totalPartnerShare = (prev.playerStats.recreationContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
            const incomePerClick = theme.baseIncome * prev.playerStats.recreationLevel;
            const incomePerSecond = (prev.playerStats.recreationAutoClickerBots || 0) * incomePerClick * (1 - totalPartnerShare);

            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + incomePerSecond,
            };

            const [newState, completedObjectives] = updateObjectiveProgress('recreation', { ...prev, playerStats: newPlayerStats });

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
  }, [gameState?.playerStats.recreationAutoClickerBots, gameState?.currentSystem, gameState?.playerStats.recreationLevel, gameState?.playerStats.recreationContract, updateObjectiveProgress, setGameState, toast]); // Add dependencies

  return {
    handleRecreationClick,
  };
}
