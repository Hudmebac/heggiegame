

'use client';

import { useCallback, useEffect } from 'react';
import type { GameState, PartnershipOffer, PlayerStats, Loan, CreditCard } from '@/lib/types';
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
        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const currentPlanet = currentSystem?.planets.find(p => p.name === prev.currentPlanet);
        const zoneType = currentSystem?.zoneType;
        const theme = (zoneType && bankThemes[zoneType]) ? bankThemes[zoneType] : bankThemes['Default'];
        const planetModifier = currentPlanet ? (PLANET_TYPE_MODIFIERS[currentPlanet.type] || 1.0) : 1.0;

        const totalPartnerShare = (playerStats.bankContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
        const income = Math.round((theme.baseIncome * playerStats.bankLevel) * (1 - totalPartnerShare) * planetModifier);

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
            playerStats: { ...playerStats, netWorth: prev.playerStats.netWorth - botCost, bankAutoClickerBots: playerStats.bankAutoClickerBots + 1 }
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

  const handleApplyForLoan = useCallback((amount: number, repaymentCount: number) => {
    setGameState(prev => {
        if (!prev) return prev;
        const { playerStats } = prev;
        if (playerStats.loan) {
            toast({ variant: "destructive", title: "Loan Rejected", description: "You already have an outstanding loan." });
            return prev;
        }
        const maxLoan = playerStats.netWorth * 100;
        if (amount <= 0 || amount > maxLoan) {
            toast({ variant: "destructive", title: "Loan Rejected", description: `Invalid amount. Maximum loan is ${maxLoan.toLocaleString()}¢.` });
            return prev;
        }

        const interestRate = 0.10;
        const totalOwed = amount * (1 + interestRate);
        const repaymentAmount = Math.ceil(totalOwed / repaymentCount);
        
        const newLoan: Loan = {
            principal: amount,
            interestRate,
            totalRepayments: repaymentCount,
            repaymentsMade: 0,
            repaymentAmount,
            nextDueDate: Date.now() + 5 * 60 * 1000, // 5 minutes
        };

        toast({ title: "Loan Approved!", description: `You have received ${amount.toLocaleString()}¢. Your first payment of ${repaymentAmount.toLocaleString()}¢ is due soon.` });

        return {
            ...prev,
            playerStats: {
                ...playerStats,
                netWorth: playerStats.netWorth + amount,
                loan: newLoan,
            }
        };
    });
  }, [setGameState, toast]);

  const handleMakeLoanRepayment = useCallback(() => {
    setGameState(prev => {
        if (!prev || !prev.playerStats.loan) return prev;
        const { playerStats } = prev;
        const { loan } = playerStats;

        if (playerStats.netWorth < loan.repaymentAmount) {
            toast({ variant: "destructive", title: "Payment Failed", description: "Insufficient funds to make a repayment." });
            return prev;
        }
        
        const newLoan = { ...loan, repaymentsMade: loan.repaymentsMade + 1, nextDueDate: Date.now() + 5 * 60 * 1000 };
        const isPaidOff = newLoan.repaymentsMade >= newLoan.totalRepayments;

        toast({ title: "Payment Successful", description: `You paid ${loan.repaymentAmount.toLocaleString()}¢. ${isPaidOff ? 'Your loan is now fully paid off!' : ''}` });
        
        return {
            ...prev,
            playerStats: {
                ...playerStats,
                netWorth: playerStats.netWorth - loan.repaymentAmount,
                loan: isPaidOff ? undefined : newLoan,
            }
        };
    });
  }, [setGameState, toast]);

  const handleRepayLoanEarly = useCallback(() => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.loan) return prev;
            const { playerStats } = prev;
            const { loan } = playerStats;
            
            const remainingPrincipal = loan.principal * (1 - (loan.repaymentsMade / loan.totalRepayments));
            const totalInterest = loan.principal * loan.interestRate;
            const remainingInterest = totalInterest * (1 - (loan.repaymentsMade / loan.totalRepayments));
            const preferentialInterest = remainingInterest * 0.5; // 50% discount on remaining interest
            const payoffAmount = Math.ceil(remainingPrincipal + preferentialInterest);

            if (playerStats.netWorth < payoffAmount) {
                toast({ variant: "destructive", title: "Payoff Failed", description: `Insufficient funds. You need ${payoffAmount.toLocaleString()}¢.` });
                return prev;
            }

            toast({ title: "Loan Repaid!", description: `You paid off your loan early for ${payoffAmount.toLocaleString()}¢, saving on interest.` });

            return {
                ...prev,
                playerStats: {
                    ...playerStats,
                    netWorth: playerStats.netWorth - payoffAmount,
                    loan: undefined,
                }
            };
        });
    }, [setGameState, toast]);

    const handleApplyForCreditCard = useCallback(() => {
        setGameState(prev => {
            if (!prev) return prev;
            const { playerStats } = prev;
            if (playerStats.creditCard) {
                toast({ variant: "destructive", title: "Application Rejected", description: "You already have an active credit line." });
                return prev;
            }
            const fee = 5000;
            if (playerStats.netWorth < fee) {
                 toast({ variant: "destructive", title: "Application Failed", description: `You need ${fee.toLocaleString()}¢ to open a credit line.` });
                return prev;
            }

            const newCreditCard: CreditCard = {
                limit: playerStats.netWorth * 50,
                balance: 0,
            };

            toast({ title: "Credit Line Approved!", description: `You have secured a credit line of ${newCreditCard.limit.toLocaleString()}¢.` });

            return {
                ...prev,
                playerStats: {
                    ...playerStats,
                    netWorth: playerStats.netWorth - fee,
                    creditCard: newCreditCard,
                }
            };
        });
    }, [setGameState, toast]);

    const handleDrawFromCreditCard = useCallback((amount: number) => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.creditCard) return prev;
            const { playerStats } = prev;
            const { creditCard } = playerStats;

            if (amount <= 0 || amount > (creditCard.limit - creditCard.balance)) {
                 toast({ variant: "destructive", title: "Draw Failed", description: "Invalid amount or exceeds available credit." });
                return prev;
            }

            toast({ title: "Funds Drawn", description: `You have added ${amount.toLocaleString()}¢ to your wallet from your credit line.` });

            return {
                ...prev,
                playerStats: {
                    ...playerStats,
                    netWorth: playerStats.netWorth + amount,
                    creditCard: { 
                        ...creditCard, 
                        balance: creditCard.balance + amount,
                        dueDate: creditCard.dueDate ?? Date.now() + 10 * 60 * 1000,
                    },
                }
            };
        });
    }, [setGameState, toast]);

    const handlePayCreditCard = useCallback((amount: number) => {
        setGameState(prev => {
            if (!prev || !prev.playerStats.creditCard) return prev;
            const { playerStats } = prev;
            const { creditCard } = playerStats;
            const payAmount = Math.min(amount, creditCard.balance);
            
            if (payAmount <= 0) return prev;
            if (playerStats.netWorth < payAmount) {
                toast({ variant: "destructive", title: "Payment Failed", description: "Insufficient funds." });
                return prev;
            }

            toast({ title: "Payment Successful", description: `You have paid ${payAmount.toLocaleString()}¢ towards your credit balance.` });

            return {
                ...prev,
                playerStats: {
                    ...playerStats,
                    netWorth: playerStats.netWorth - payAmount,
                    creditCard: { ...creditCard, balance: creditCard.balance - payAmount },
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
            const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
            const currentPlanet = currentSystem?.planets.find(p => p.name === prev.currentPlanet);
            const zoneType = currentSystem?.zoneType;
            const theme = (zoneType && bankThemes[zoneType]) ? bankThemes[zoneType] : bankThemes['Default'];
            const planetModifier = currentPlanet ? (PLANET_TYPE_MODIFIERS[currentPlanet.type] || 1.0) : 1.0;
            const totalPartnerShare = (playerStats.bankContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
            const incomePerClick = theme.baseIncome * playerStats.bankLevel;
            const incomePerSecond = Math.round((playerStats.bankAutoClickerBots || 0) * incomePerClick * (1 - totalPartnerShare) * planetModifier);

            return { ...prev, playerStats: { ...playerStats, netWorth: playerStats.netWorth + incomePerSecond }};
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState?.playerStats.bankAutoClickerBots, gameState?.currentSystem, gameState?.currentPlanet, setGameState]);


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
    handleApplyForLoan,
    handleMakeLoanRepayment,
    handleRepayLoanEarly,
    handleApplyForCreditCard,
    handleDrawFromCreditCard,
    handlePayCreditCard,
  };
}
