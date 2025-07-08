
'use client';

import { useCallback } from 'react';
import type { GameState, CasinoGameType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { casinoNarratives } from '@/lib/casino-narratives';

const gameConfig: Record<
  CasinoGameType,
  {
    winChance: number;
    payoutMax: number;
    bonusChance: number;
  }
> = {
  slots:      { winChance: 0.75, payoutMax: 3,  bonusChance: 0 },
  table:      { winChance: 0.5,  payoutMax: 10, bonusChance: 0 },
  poker:      { winChance: 0.5,  payoutMax: 15, bonusChance: 0.1 },
  vip:        { winChance: 0.3,  payoutMax: 10, bonusChance: 0.5 },
  sportsbook: { winChance: 0.45, payoutMax: 3,  bonusChance: 0.05 },
  lottery:    { winChance: 0.02, payoutMax: 1000, bonusChance: 0.15 },
};

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

    setGameState(prev => {
      if (!prev) return null;

      const config = gameConfig[gameType];
      const narratives = casinoNarratives[gameType];
      
      const reputationBonus = Math.max(0, (prev.playerStats.reputation / 1000)); // Max 10% bonus for 100 rep
      const didWin = Math.random() < (config.winChance + reputationBonus);
      
      let winnings = 0;
      let bonusAmount = 0;
      let bonusWin = false;
      let narrative = "";

      if (didWin) {
        if (gameType === 'lottery') {
          winnings = stake * config.payoutMax;
        } else {
          const payoutMultiplier = 1.1 + (Math.random() * (config.payoutMax - 1.1));
          winnings = Math.round(stake * payoutMultiplier);
        }
        narrative = narratives.win[Math.floor(Math.random() * narratives.win.length)];

        if (config.bonusChance > 0 && Math.random() < config.bonusChance) {
          bonusWin = true;
          bonusAmount = Math.round(5000 + Math.random() * 45000);
          narrative += ` ${narratives.bonus[Math.floor(Math.random() * narratives.bonus.length)]}`;
        }
      } else {
        winnings = 0;
        narrative = narratives.loss[Math.floor(Math.random() * narratives.loss.length)];
      }

      const netChange = winnings - stake + bonusAmount;
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

      const toastTitle = didWin ? `You Won ${winnings.toLocaleString()}¢!` : `You Lost ${stake.toLocaleString()}¢`;
      
      let toastDescription = narrative;
      if(bonusWin) {
          toastDescription += ` You also won a bonus of ${bonusAmount.toLocaleString()}¢!`;
      }
      
      setTimeout(() => {
           toast({
              variant: didWin ? 'default' : 'destructive',
              title: toastTitle,
              description: toastDescription,
           });
      }, 0);

      return {
        ...prev,
        playerStats: newPlayerStats,
      };
    });
  }, [gameState, setGameState, toast]);

  return { handlePlayCasinoGame };
}
