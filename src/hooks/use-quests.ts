
'use client';

import { useState, useTransition, useCallback } from 'react';
import type { GameState, Quest, ActiveObjective, QuestTask } from '@/lib/types';
import { runQuestGeneration } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

export function useQuests(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
    const [isGeneratingQuests, startQuestGenerationTransition] = useTransition();
    const { toast } = useToast();

    const updateObjectiveProgress = useCallback((objectiveType: QuestTask['type'], state: GameState): [GameState, ActiveObjective[]] => {
        let newPlayerStats = { ...state.playerStats };
        const completedObjectives: ActiveObjective[] = [];

        const newActiveObjectives = (state.activeObjectives || []).map(obj => {
            if ((Date.now() - obj.startTime) / 1000 > (obj.timeLimit || Infinity)) {
                return null; // Objective expired
            }

            let updatedObj = { ...obj };
            let progressMade = false;

            if (updatedObj.tasks?.some(t => t.type === objectiveType)) {
                const newProgress = { ...updatedObj.progress };
                newProgress[objectiveType] = (newProgress[objectiveType] || 0) + 1;
                updatedObj = { ...updatedObj, progress: newProgress };
                progressMade = true;
            }

            if (progressMade) {
                const isComplete = updatedObj.tasks?.every(task => (updatedObj.progress[task.type] || 0) >= task.target);
                if (isComplete) {
                    completedObjectives.push(updatedObj);
                    return null;
                }
            }
            return updatedObj;
        }).filter(Boolean) as ActiveObjective[];

        if (completedObjectives.length > 0) {
            completedObjectives.forEach(obj => {
                const rewardAmount = parseInt(obj.reward.replace(/[^0-9]/g, ''), 10);
                if (!isNaN(rewardAmount)) {
                    newPlayerStats.netWorth += rewardAmount;
                }
            });
        }

        return [{ ...state, playerStats: newPlayerStats, activeObjectives: newActiveObjectives }, completedObjectives];
    }, []);

    const handleGenerateQuests = useCallback(() => {
        startQuestGenerationTransition(async () => {
            try {
                const result = await runQuestGeneration();
                setGameState(prev => {
                    if (!prev) return null;
                    return { ...prev, quests: result.quests };
                });
                toast({ title: "New Bounties Posted", description: "The quest board has been updated with new missions." });
            } catch (error) {
                console.error(error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({ variant: "destructive", title: "Quest Generation Failed", description: errorMessage });
            }
        });
    }, [setGameState, toast]);

    const handleAcceptObjective = useCallback((quest: Quest) => {
        setGameState(prev => {
            if (!prev || quest.type !== 'Objective' || !quest.timeLimit) return prev;

            const newObjective: ActiveObjective = {
                ...quest,
                progress: {},
                startTime: Date.now(),
            };

            setTimeout(() => {
                toast({ title: "Objective Started!", description: `You have ${quest.timeLimit} seconds to complete "${quest.title}".` });
            }, 0);

            return {
                ...prev,
                quests: prev.quests.filter(q => q.title !== quest.title),
                activeObjectives: [...(prev.activeObjectives || []), newObjective],
            };
        });
    }, [setGameState, toast]);

    return {
        isGeneratingQuests,
        handleGenerateQuests,
        handleAcceptObjective,
        updateObjectiveProgress,
    };
}
