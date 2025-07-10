
'use client';

import { useCallback, useEffect } from 'react';
import type { GameState, PartnershipOffer, PlayerStats, Loan, CreditCard, BankAccount } from '@/lib/types';
import { bankThemes } from '@/lib/bank-themes';
import { useToast } from '@/hooks/use-toast';
import { PLANET_TYPE_MODIFIERS } from '@/lib/utils';

const TOTAL_BANK_SHARES = 10000;

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
            setTimeout(() => toast({ variant: "destructive", title: "Cannot Open Account", description: "Insufficient funds." }), 0);
            return prev;
        }
        
        const newBankAccount: BankAccount = {
            balance: 0,
            interestRate: 0.1,
            sharePrice: 1000000,
            sharePriceHistory: [1000000],
            lastFluctuation: Date.now(),
        };

        setTimeout(() => toast({ title: "Account Opened", description: "You are now a client of the Galactic Bank." }), 0);
        return {
            ...prev,
            playerStats: {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
                bankAccount: newBankAccount,
                bankShares: 0,
            }
        };
    });
  }, [setGameState, toast]);

  const handleDeposit = useCallback((amount: number) => {
    setGameState(prev => {
        if (!prev || !prev.playerStats.bankAccount) return prev;
        if (amount <= 0 || prev.playerStats.netWorth < amount) {
            setTimeout(() => toast({ variant: "destructive", title: "Deposit Failed", description: "Invalid amount or insufficient funds." }), 0);
            return prev;
        }
        return {
            ...prev,
            playerStats: {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - amount,
                bankAccount: { ...prev.playerStats.bankAccount, balance: prev.playerStats.bankAccount.balance + amount }
            }
        };
    });
  }, [setGameState, toast]);

  const handleWithdraw = useCallback((amount: number) => {
    setGameState(prev => {
        if (!prev || !prev.playerStats.bankAccount) return prev;
        if (amount <= 0 || prev.playerStats.bankAccount.balance < amount) {
            setTimeout(() => toast({ variant: "destructive", title: "Withdrawal Failed", description: "Invalid amount or insufficient balance." }), 0);
            return prev;
        }
        return {
            ...prev,
            playerStats: {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + amount,
                bankAccount: { ...prev.playerStats.bankAccount, balance: prev.playerStats.bankAccount.balance - amount }
            }
        };
    });
  }, [setGameState, toast]);

  const handlePurchaseShare = useCallback((amount: number) => {
    setGameState(prev => {
        if (!prev || !prev.playerStats.bankAccount) return null;
        const cost = prev.playerStats.bankAccount.sharePrice * amount;
        if (prev.playerStats.netWorth < cost) {
            setTimeout(() => toast({ variant: "destructive", title: "Purchase Failed", description: "Insufficient funds to buy shares." }), 0);
            return prev;
        }
        if ((prev.playerStats.bankShares || 0) + amount > TOTAL_BANK_SHARES) {
             setTimeout(() => toast({ variant: "destructive", title: "Purchase Failed", description: "Not enough shares available on the market." }), 0);
            return prev;
        }
        setTimeout(() => toast({ title: "Shares Purchased", description: `You have acquired ${amount} share(s) of the Galactic Bank.` }), 0);
        return {
            ...prev,
            playerStats: {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
                bankShares: (prev.playerStats.bankShares || 0) + amount,
            }
        };
    });
  }, [setGameState, toast]);

  const handleSellShare = useCallback((amount: number) => {
    setGameState(prev => {
        if (!prev || !prev.playerStats.bankAccount) return null;
        if (amount > (prev.playerStats.bankShares || 0)) {
            setTimeout(() => toast({ variant: "destructive", title: "Sale Failed", description: "You do not own enough shares." }), 0);
            return prev;
        }
        const income = prev.playerStats.bankAccount.sharePrice * amount;
        setTimeout(() => toast({ title: "Shares Sold", description: `You have sold ${amount} share(s) for ${income.toLocaleString()}¢.` }), 0);
        return {
            ...prev,
            playerStats: {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + income,
                bankShares: (prev.playerStats.bankShares || 0) - amount,
            }
        };
    });
  }, [setGameState, toast]);
  
  const handleAcquireBank = useCallback(() => {
    setGameState(prev => {
        if (!prev || (prev.playerStats.bankShares || 0) < TOTAL_BANK_SHARES) return prev;
        const cost = 50000000;
        if (prev.playerStats.netWorth < cost) {
            setTimeout(() => toast({ variant: "destructive", title: "Acquisition Failed", description: "Insufficient funds for the final acquisition." }), 0);
            return prev;
        }
        const initialValue = cost * 1.5;
        setTimeout(() => toast({ title: "Bank Acquired!", description: "You are now the owner of the Galactic Bank!" }), 0);
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
                },
                bankAccount: undefined, // Player now owns the bank, no longer a client
                bankShares: 0,
            }
        }
    });
  }, [setGameState, toast]);

    const handleSetInterestRate = useCallback((rate: number) => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.bankAccount || (prev.playerStats.bankShares || 0) < 5001) return prev;
            setTimeout(() => toast({ title: "Policy Updated", description: `Bank interest rate set to ${rate.toFixed(2)}%` }), 0);
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    bankAccount: {
                        ...prev.playerStats.bankAccount,
                        interestRate: rate
                    }
                }
            }
        });
    }, [setGameState, toast]);

  // Bank clicker logic (for when player OWNS the bank)
  const handleBankClick = useCallback(() => { /* ... */ }, []);
  const handleUpgradeBank = useCallback(() => { /* ... */ }, []);
  const handleUpgradeBankAutoClicker = useCallback(() => { /* ... */ }, []);
  const handleAcceptBankPartnerOffer = useCallback((offer: PartnershipOffer) => { /* ... */ }, []);
  
  // Timer for share price fluctuation and interest
  useEffect(() => {
    const interval = setInterval(() => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.bankAccount || prev.playerStats.bankEstablishmentLevel > 0) return prev;

            const now = Date.now();
            const timeSinceLastUpdate = now - (prev.playerStats.bankAccount.lastFluctuation || now);

            if (timeSinceLastUpdate < (5 * 60 * 1000)) return prev; // 5 minutes

            let newBankAccount = { ...prev.playerStats.bankAccount };
            let newNetWorth = prev.playerStats.netWorth;

            // 1. Share Price Fluctuation
            const hasMajority = (prev.playerStats.bankShares || 0) >= 5001;
            const interestRateFactor = hasMajority ? 1 - (newBankAccount.interestRate / 10) : 1; // High interest slightly lowers price
            const volatility = (Math.random() * 0.04) + 0.01; // 1% to 5%
            const direction = Math.random() > (0.5 - (1-interestRateFactor)*0.5) ? 1 : -1;
            const newSharePrice = Math.max(10000, Math.round(newBankAccount.sharePrice * (1 + (volatility * direction))));
            
            newBankAccount.sharePrice = newSharePrice;
            newBankAccount.sharePriceHistory = [...newBankAccount.sharePriceHistory, newSharePrice].slice(-50);
            
            // 2. Apply Interest to player's deposit
            if (newBankAccount.balance > 0) {
                const interestEarned = Math.round(newBankAccount.balance * (newBankAccount.interestRate / 100));
                newBankAccount.balance += interestEarned;
                if(interestEarned > 0) {
                    setTimeout(() => toast({title: "Interest Accrued", description: `You earned ${interestEarned.toLocaleString()}¢ in interest.`}), 0);
                }
            }

            // 3. Nominal return for shareholders
            const shareHoldingIncome = Math.round((prev.playerStats.bankShares || 0) * 0.1);
            newNetWorth += shareHoldingIncome;
            if(shareHoldingIncome > 0) {
                 setTimeout(() => toast({title: "Dividends Paid", description: `You earned ${shareHoldingIncome.toLocaleString()}¢ from your bank shares.`}), 0);
            }

            newBankAccount.lastFluctuation = now;

            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: newNetWorth,
                    bankAccount: newBankAccount,
                }
            };
        });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [setGameState, toast]);


  return {
    handleOpenAccount,
    handleDeposit,
    handleWithdraw,
    handlePurchaseShare,
    handleSellShare,
    handleAcquireBank,
    handleSetInterestRate,
    handleBankClick,
    handleUpgradeBank,
    handleUpgradeBankAutoClicker,
    handleAcceptBankPartnerOffer,
  };
}
