'use client';

import { useCallback, useTransition } from 'react';
import type { GameState, CasinoGameType } from '@/lib/types';
import { runCasinoGame } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function useCasino(
  gameState: GameState | null,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
  const { toast } = useToast();

  const handlePlayCasinoGame = useCallback(async (gameType: CasinoGameType, stake: number) => {
    if (!gameState) return;

    // Client-side validation
    if (gameState.playerStats.netWorth < stake) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Funds',
        description: `You need ${stake.toLocaleString()}¢ to play.`,
      });
      return;
    }

    try {
      const result = await runCasinoGame({
        gameType,
        stake,
        playerReputation: gameState.playerStats.reputation,
      });

      setGameState(prev => {
        if (!prev) return null;

        const netChange = result.winnings - stake + result.bonusAmount;
        const newNetWorth = prev.playerStats.netWorth + netChange;

        const newCasinoState = {
            ...prev.playerStats.casino,
            lastPlayed: {
                ...prev.playerStats.casino.lastPlayed,
                [gameType]: Date.now(),
            },
            dailyLotteryTicketPurchased: gameType === 'lottery' ? true : prev.playerStats.casino.dailyLotteryTicketPurchased,
        };
        
        const newPlayerStats = {
          ...prev.playerStats,
          netWorth: newNetWorth,
          casino: newCasinoState
        };

        const toastTitle = result.didWin ? `You Won ${result.winnings.toLocaleString()}¢!` : `You Lost ${stake.toLocaleString()}¢`;
        
        let toastDescription = result.narrative;
        if(result.bonusWin) {
            toastDescription += ` You also won a bonus of ${result.bonusAmount.toLocaleString()}¢!`;
        }
        
        setTimeout(() => {
             toast({
                variant: result.didWin ? 'default' : 'destructive',
                title: toastTitle,
                description: toastDescription,
             });
        }, 0);

        return {
          ...prev,
          playerStats: newPlayerStats,
        };
      });

    } catch (error) {
      console.error('Casino game error:', error);
      toast({
        variant: 'destructive',
        title: 'Casino Error',
        description: 'The game machine malfunctioned. Please try again later.',
      });
    }
  }, [gameState, setGameState, toast]);

  return { handlePlayCasinoGame };
}
