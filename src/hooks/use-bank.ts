
'use client';

import { useCallback, useEffect } from 'react';
import type { GameState, PartnershipOffer, PlayerStats, Loan, CreditCard, BankAccount, SystemEconomy } from '@/lib/types';
import { bankThemes } from '@/lib/bank-themes';
import { useToast } from '@/hooks/use-toast';
import { PLANET_TYPE_MODIFIERS } from '@/lib/utils';
import { businessData, calculateCost } from '@/lib/business-data';

const TOTAL_BANK_SHARES = 10000;

export function useBank(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>,
) {
  const { toast } = useToast();
  const bankData = businessData.find(b => b.id === 'bank');

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
                bankShares: 0, // Shares are converted to full ownership
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

    const handleTakeLoan = useCallback((amount: number) => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.bankAccount || prev.playerStats.loan) return prev;

            const maxLoan = prev.playerStats.netWorth * 100;
            if (amount <= 0 || amount > maxLoan) {
                setTimeout(() => toast({ variant: "destructive", title: "Loan Denied", description: "Invalid loan amount requested." }), 0);
                return prev;
            }

            const newLoan: Loan = {
                principal: amount,
                interestRate: 0.10,
                totalRepayments: 12,
                repaymentsMade: 0,
                repaymentAmount: Math.ceil((amount * 1.10) / 12),
                nextDueDate: Date.now() + 5 * 60 * 1000, // 5 minutes from now
            };

            setTimeout(() => toast({ title: "Loan Approved", description: `You have received ${amount.toLocaleString()}¢. Repayments will begin soon.` }), 0);

            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth + amount,
                    loan: newLoan,
                }
            };
        });
    }, [setGameState, toast]);

  // Bank clicker logic (for when player OWNS the bank)
  const handleBankClick = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;

        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const currentPlanet = currentSystem?.planets.find(p => p.name === prev.currentPlanet);
        const zoneType = currentSystem?.zoneType;
        const theme = (zoneType && bankThemes[zoneType]) ? bankThemes[zoneType] : bankThemes['Default'];
        const planetModifier = currentPlanet ? (PLANET_TYPE_MODIFIERS[currentPlanet.type] || 1.0) : 1.0;

        const totalPartnerShare = (prev.playerStats.bankContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
        const rawIncomePerClick = theme.baseIncome * prev.playerStats.bankLevel;
        const income = Math.round(rawIncomePerClick * (1 - totalPartnerShare) * planetModifier);

        return { ...prev, playerStats: { ...prev.playerStats, netWorth: prev.playerStats.netWorth + income } };
    });
  }, [setGameState]);

  const handleUpgradeBank = useCallback(() => {
    setGameState(prev => {
      if (!prev || !bankData) return null;
      const { playerStats, difficulty } = prev;

      const difficultyModifiers = { 'Easy': 0.5, 'Medium': 1.0, 'Hard': 1.5, 'Hardcore': 1.5 };
      const difficultyModifier = difficultyModifiers[difficulty];
      
      const upgradeConfig = bankData.costs[0];
      if (playerStats.bankLevel >= 25) {
        setTimeout(() => toast({ variant: "destructive", title: "Upgrade Failed", description: "Bank level is already at maximum." }), 0);
        return prev;
      }
      
      const upgradeCost = calculateCost(playerStats.bankLevel, upgradeConfig.starterPrice, upgradeConfig.growth, difficultyModifier);
      if (playerStats.netWorth < upgradeCost) {
        setTimeout(() => toast({ variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${upgradeCost.toLocaleString()}¢.` }), 0);
        return prev;
      }

      const newPlayerStats = { ...playerStats, netWorth: playerStats.netWorth - upgradeCost, bankLevel: playerStats.bankLevel + 1 };
      setTimeout(() => toast({ title: "Bank Upgraded!", description: `Your bank is now Level ${newPlayerStats.bankLevel}.` }), 0);
      return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast, bankData]);

  const handleUpgradeBankAutoClicker = useCallback(() => {
    setGameState(prev => {
      if (!prev || !bankData) return null;
      const { playerStats, difficulty } = prev;

      const difficultyModifiers = { 'Easy': 0.5, 'Medium': 1.0, 'Hard': 1.5, 'Hardcore': 1.5 };
      const difficultyModifier = difficultyModifiers[difficulty];
      
      const botConfig = bankData.costs[1];
      if (playerStats.bankAutoClickerBots >= 25) {
        setTimeout(() => toast({ variant: "destructive", title: "Limit Reached", description: "You cannot deploy more than 25 bots." }), 0);
        return prev;
      }

      const botCost = calculateCost(playerStats.bankAutoClickerBots, botConfig.starterPrice, botConfig.growth, difficultyModifier);
      if (playerStats.netWorth < botCost) {
        setTimeout(() => toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits. You need ${botCost.toLocaleString()}¢.` }), 0);
        return prev;
      }

      const newPlayerStats = { ...playerStats, netWorth: playerStats.netWorth - botCost, bankAutoClickerBots: playerStats.bankAutoClickerBots + 1 };
      setTimeout(() => toast({ title: "Bot Deployed!", description: "A new financial bot has been deployed." }), 0);
      return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast, bankData]);
  
  const handleAcceptBankPartnerOffer = useCallback((offer: PartnershipOffer) => { /* ... */ }, []);
  
  // Timer for share price fluctuation and interest
  useEffect(() => {
    const interval = setInterval(() => {
        setGameState(prev => {
            if (!prev || prev.isGameOver) return prev;

            let newPlayerStats = { ...prev.playerStats };
            let stateChanged = false;
            
            // --- Bank Share Price & Interest ---
            if (newPlayerStats.bankAccount && newPlayerStats.bankEstablishmentLevel === 0) {
                const now = Date.now();
                const timeSinceLastUpdate = now - (newPlayerStats.bankAccount.lastFluctuation || now);

                if (timeSinceLastUpdate >= (5 * 60 * 1000)) { // 5 minutes
                    let newBankAccount = { ...newPlayerStats.bankAccount };
                    let newNetWorth = newPlayerStats.netWorth;

                    // 1. Share Price Fluctuation
                    const hasMajority = (newPlayerStats.bankShares || 0) >= 5001;
                    const interestRateFactor = hasMajority ? 1 - (newBankAccount.interestRate / 10) : 1; 
                    const volatility = (Math.random() * 0.04) + 0.01;
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
                    const shareHoldingIncome = Math.round((newPlayerStats.bankShares || 0) * 0.1);
                    newNetWorth += shareHoldingIncome;
                    if(shareHoldingIncome > 0) {
                         setTimeout(() => toast({title: "Dividends Paid", description: `You earned ${shareHoldingIncome.toLocaleString()}¢ from your bank shares.`}), 0);
                    }

                    newBankAccount.lastFluctuation = now;
                    newPlayerStats.netWorth = newNetWorth;
                    newPlayerStats.bankAccount = newBankAccount;
                    stateChanged = true;
                }
            }

            // --- Passive Income from Owned Bank ---
            if (newPlayerStats.bankEstablishmentLevel > 0 && newPlayerStats.bankAutoClickerBots > 0) {
                const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
                const currentPlanet = currentSystem?.planets.find(p => p.name === prev.currentPlanet);
                const zoneType = currentSystem?.zoneType;
                const theme = (zoneType && bankThemes[zoneType]) ? bankThemes[zoneType] : bankThemes['Default'];
                const planetModifier = currentPlanet ? (PLANET_TYPE_MODIFIERS[currentPlanet.type] || 1.0) : 1.0;
                
                const totalPartnerShare = (newPlayerStats.bankContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
                const rawIncomePerClick = theme.baseIncome * newPlayerStats.bankLevel;
                const incomePerSecond = Math.round(newPlayerStats.bankAutoClickerBots * rawIncomePerClick * (1 - totalPartnerShare) * planetModifier);
                newPlayerStats.netWorth += incomePerSecond;
                stateChanged = true;
            }

            return stateChanged ? { ...prev, playerStats: newPlayerStats } : prev;
        });
    }, 1000); // Check every second for owned bank, 5-min logic is handled internally

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
    handleTakeLoan,
    handleBankClick,
    handleUpgradeBank,
    handleUpgradeBankAutoClicker,
    handleAcceptBankPartnerOffer,
  };
}
