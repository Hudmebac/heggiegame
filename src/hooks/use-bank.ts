
'use client';

import { useCallback, useEffect } from 'react';
import type { GameState, PartnershipOffer, PlayerStats } from '@/lib/types';
import { bankThemes } from '@/lib/bank-themes';
import { useToast } from '@/hooks/use-toast';
import { PLANET_TYPE_MODIFIERS } from '@/lib/utils';

export function useBank(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>,
) {
  const { toast } = useToast();

  const handleOpenAccount = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        const cost = 1000;
        if (prev.playerStats.netWorth < cost) {
            toast({ variant: "destructive", title: "Cannot Open Account", description: "Insufficient funds." });
            return prev;
        }
        toast({ title: "Account Opened", description: "You are now a client of the Galactic Bank." });
        return {
            ...prev,
            playerStats: {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
                bankAccount: { balance: 0 }
            }
        };
    });
  }, [setGameState, toast]);

  const handleDeposit = useCallback((amount: number) => {
    setGameState(prev => {
        if (!prev || !prev.playerStats.bankAccount) return prev;
        if (amount <= 0 || prev.playerStats.netWorth < amount) {
            toast({ variant: "destructive", title: "Deposit Failed", description: "Invalid amount or insufficient funds." });
            return prev;
        }
        return {
            ...prev,
            playerStats: {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - amount,
                bankAccount: { balance: prev.playerStats.bankAccount.balance + amount }
            }
        };
    });
  }, [setGameState, toast]);

  const handleWithdraw = useCallback((amount: number) => {
    setGameState(prev => {
        if (!prev || !prev.playerStats.bankAccount) return prev;
        if (amount <= 0 || prev.playerStats.bankAccount.balance < amount) {
            toast({ variant: "destructive", title: "Withdrawal Failed", description: "Invalid amount or insufficient balance." });
            return prev;
        }
        return {
            ...prev,
            playerStats: {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + amount,
                bankAccount: { balance: prev.playerStats.bankAccount.balance - amount }
            }
        };
    });
  }, [setGameState, toast]);

  const handlePurchaseShare = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        const cost = 1000000;
        if (prev.playerStats.netWorth < cost) {
            toast({ variant: "destructive", title: "Purchase Failed", description: "Insufficient funds to buy a bank share." });
            return prev;
        }
        toast({ title: "Share Purchased", description: "You have acquired one share of the Galactic Bank." });
        return {
            ...prev,
            playerStats: {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
                bankShares: (prev.playerStats.bankShares || 0) + 1,
            }
        };
    });
  }, [setGameState, toast]);
  
  const handleAcquireBank = useCallback(() => {
    setGameState(prev => {
        if (!prev || (prev.playerStats.bankShares || 0) < 100) return prev;
        const cost = 50000000; // Final acquisition cost
        if (prev.playerStats.netWorth < cost) {
            toast({ variant: "destructive", title: "Acquisition Failed", description: "Insufficient funds for the final acquisition." });
            return prev;
        }
        const initialValue = cost * 1.5;
        toast({ title: "Bank Acquired!", description: "You are now the owner of the Galactic Bank!" });
        return {
            ...prev,
            playerStats: {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
                bankEstablishmentLevel: 1,
                bankContract: {
                    currentMarketValue: initialValue,
                    valueHistory: [initialValue],
                    partners: [],
                }
            }
        }
    });
  }, [setGameState, toast]);
  
  const handleBankClick = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        const { playerStats } = prev;
        const zoneType = prev.systems.find(s => s.name === prev.currentSystem)?.zoneType;
        const theme = (zoneType && bankThemes[zoneType]) ? bankThemes[zoneType] : bankThemes['Default'];
        const totalPartnerShare = (playerStats.bankContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
        const income = Math.round((theme.baseIncome * playerStats.bankLevel) * (1 - totalPartnerShare));

        return {
            ...prev,
            playerStats: { ...playerStats, netWorth: playerStats.netWorth + income }
        };
    });
  }, [setGameState]);

  const handleUpgradeBank = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        const { playerStats } = prev;
        if (playerStats.bankLevel >= 25) {
            toast({ variant: "destructive", title: "Upgrade Failed", description: "Bank level is already at maximum." });
            return prev;
        }
        const upgradeCost = Math.round(500000 * Math.pow(playerStats.bankLevel, 2.8));
        if (playerStats.netWorth < upgradeCost) {
            toast({ variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${upgradeCost.toLocaleString()}¢.` });
            return prev;
        }
        toast({ title: "Bank Upgraded!", description: `Your bank is now Level ${playerStats.bankLevel + 1}.` });
        return {
            ...prev,
            playerStats: { ...playerStats, netWorth: playerStats.netWorth - upgradeCost, bankLevel: playerStats.bankLevel + 1 }
        };
    });
  }, [setGameState, toast]);

  const handleUpgradeBankAutoClicker = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        const { playerStats } = prev;
        if (playerStats.bankAutoClickerBots >= 25) {
            toast({ variant: "destructive", title: "Limit Reached", description: "You cannot purchase more bots." });
            return prev;
        }
        const botCost = Math.round(1000000 * Math.pow(2.5, playerStats.bankAutoClickerBots));
        if (playerStats.netWorth < botCost) {
            toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits. You need ${botCost.toLocaleString()}¢.` });
            return prev;
        }
        toast({ title: "Bot Purchased!", description: "A new financial bot has been activated." });
        return {
            ...prev,
            playerStats: { ...playerStats, netWorth: playerStats.netWorth - botCost, bankAutoClickerBots: playerStats.bankAutoClickerBots + 1 }
        };
    });
  }, [setGameState, toast]);

  const handleAcceptBankPartnerOffer = useCallback((offer: PartnershipOffer) => {
    setGameState(prev => {
        if (!prev || !prev.playerStats.bankContract) return prev;
        const { playerStats } = prev;
        const newPartners = [...(playerStats.bankContract.partners || []), { name: offer.partnerName, percentage: offer.stakePercentage, investment: offer.cashOffer }];
        const totalPartnerShare = newPartners.reduce((acc, p) => acc + p.percentage, 0);

        if (totalPartnerShare > 1) {
            toast({ variant: "destructive", title: "Deal Failed", description: "Cannot sell more than 100% of the bank." });
            return prev;
        }
        toast({ title: "Deal Struck!", description: `You sold a ${(offer.stakePercentage * 100).toFixed(0)}% stake to ${offer.partnerName}.` });
        return {
            ...prev,
            playerStats: {
                ...playerStats,
                netWorth: playerStats.netWorth + offer.cashOffer,
                bankContract: { ...playerStats.bankContract, partners: newPartners }
            }
        };
    });
  }, [setGameState, toast]);
  
  useEffect(() => {
    if (!gameState || (gameState.playerStats.bankAutoClickerBots || 0) === 0) return;
    const interval = setInterval(() => {
        setGameState(prev => {
            if (!prev || (prev.playerStats.bankAutoClickerBots || 0) === 0) return prev;
            const { playerStats } = prev;
            const zoneType = prev.systems.find(s => s.name === prev.currentSystem)?.zoneType;
            const theme = (zoneType && bankThemes[zoneType]) ? bankThemes[zoneType] : bankThemes['Default'];
            const totalPartnerShare = (playerStats.bankContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
            const incomePerSecond = (playerStats.bankAutoClickerBots || 0) * (theme.baseIncome * playerStats.bankLevel) * (1 - totalPartnerShare);

            return { ...prev, playerStats: { ...playerStats, netWorth: playerStats.netWorth + incomePerSecond }};
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState?.playerStats.bankAutoClickerBots, setGameState]);


  return {
    handleOpenAccount,
    handleDeposit,
    handleWithdraw,
    handlePurchaseShare,
    handleAcquireBank,
    handleBankClick,
    handleUpgradeBank,
    handleUpgradeBankAutoClicker,
    handleAcceptBankPartnerOffer,
  };
}
