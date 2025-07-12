
'use client';

import { useCallback } from 'react';
import type { GameState, CasinoGameType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { casinoNarratives } from '@/lib/casino-narratives';

const gameConfig: Record<
  CasinoGameType,
  {
    winChance: number;
    payoutMin: number;
    payoutMax: number;
    bonusChance: number;
    bonusPayoutMin: number;
    bonusPayoutMax: number;
  }
> = {
  slots:      { winChance: 0.75, payoutMin: 2,    payoutMax: 5,    bonusChance: 0,    bonusPayoutMin: 0,          bonusPayoutMax: 0 },
  table:      { winChance: 0.5,  payoutMin: 1.5,  payoutMax: 15,   bonusChance: 0,    bonusPayoutMin: 0,          bonusPayoutMax: 0 },
  poker:      { winChance: 0.5,  payoutMin: 1.5,  payoutMax: 15,   bonusChance: 0.1,  bonusPayoutMin: 5000,      bonusPayoutMax: 50000 },
  vip:        { winChance: 0.3,  payoutMin: 1.5,  payoutMax: 20,   bonusChance: 0.5,  bonusPayoutMin: 5000,      bonusPayoutMax: 50000 },
  sportsbook: { winChance: 0.45, payoutMin: 1.5,  payoutMax: 30,   bonusChance: 0.05, bonusPayoutMin: 5000,      bonusPayoutMax: 50000 },
  lottery:    { winChance: 0.02, payoutMin: 10000,payoutMax: 10000,bonusChance: 0.15, bonusPayoutMin: 500000,    bonusPayoutMax: 1500000000 },
  droneRacing: { winChance: 0.4, payoutMin: 2, payoutMax: 25, bonusChance: 0.08, bonusPayoutMin: 10000, bonusPayoutMax: 75000 },
  spaceRoulette: { winChance: 0.48, payoutMin: 1.2, payoutMax: 35, bonusChance: 0.02, bonusPayoutMin: 20000, bonusPayoutMax: 100000 },
  gravityWorldCup: { winChance: 0.25, payoutMin: 5, payoutMax: 50, bonusChance: 0.01, bonusPayoutMin: 100000, bonusPayoutMax: 500000 },
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
          const payoutMultiplier = config.payoutMin + (Math.random() * (config.payoutMax - config.payoutMin));
          winnings = Math.round(stake * payoutMultiplier);
        }
        narrative = narratives.win[Math.floor(Math.random() * narratives.win.length)];

        if (config.bonusChance > 0 && Math.random() < config.bonusChance) {
          bonusWin = true;
          bonusAmount = Math.round(config.bonusPayoutMin + Math.random() * (config.bonusPayoutMax - config.bonusPayoutMin));
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
