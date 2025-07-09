
'use client';

import { useCallback, useEffect } from 'react';
import type { GameState, PartnershipOffer, PlayerStats, QuestTask, ActiveObjective, BarContract, BarPartner, SystemEconomy } from '@/lib/types';
import { industryThemes } from '@/lib/industry-themes';
import { useToast } from '@/hooks/use-toast';
import { PLANET_TYPE_MODIFIERS } from '@/lib/utils';

export function useIndustry(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>,
    updateObjectiveProgress: (objectiveType: QuestTask['type'], state: GameState) => [GameState, ActiveObjective[]]
) {
  const { toast } = useToast();

  const handleIndustryClick = useCallback(() => {
    let completedToastMessages: { title: string, description: string }[] = [];
    setGameState(prev => {
        if (!prev) return null;

        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const currentPlanet = currentSystem?.planets.find(p => p.name === prev.currentPlanet);
        const zoneType = currentSystem?.zoneType;
        const theme = (zoneType && industryThemes[zoneType]) ? industryThemes[zoneType] : industryThemes['Default'];
        const planetModifier = currentPlanet ? (PLANET_TYPE_MODIFIERS[currentPlanet.type] || 1.0) : 1.0;

        const totalPartnerShare = (prev.playerStats.industryContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
        const rawIncomePerClick = theme.baseIncome * prev.playerStats.industryLevel;
        const income = Math.round(rawIncomePerClick * (1 - totalPartnerShare) * planetModifier);

        const baseState = { ...prev, playerStats: { ...prev.playerStats, netWorth: prev.playerStats.netWorth + income } };
        const [newState, completedObjectives] = updateObjectiveProgress('industry', baseState);
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
  }, [setGameState, updateObjectiveProgress, toast]);

  const handleUpgradeIndustry = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      const economyCostModifiers: Record<SystemEconomy, number> = { 'High-Tech': 1.15, 'Industrial': 0.90, 'Extraction': 1.00, 'Refinery': 0.95, 'Agricultural': 1.10 };
      const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
      const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;

      if (prev.playerStats.industryLevel >= 25) {
        setTimeout(() => toast({ variant: "destructive", title: "Upgrade Failed", description: "Facility level is already at maximum." }), 0);
        return prev;
      }

      const upgradeCost = Math.round(1800 * Math.pow(prev.playerStats.industryLevel, 2.5) * costModifier);

      if (prev.playerStats.netWorth < upgradeCost) {
        setTimeout(() => toast({ variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${upgradeCost.toLocaleString()}¢.` }), 0);
        return prev;
      }

      const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - upgradeCost, industryLevel: prev.playerStats.industryLevel + 1 };
      setTimeout(() => toast({ title: "Facility Upgraded!", description: `Your industrial facility is now at Level ${newPlayerStats.industryLevel}.` }), 0);
      return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast]);

  const handleUpgradeIndustryAutoClicker = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      const economyCostModifiers: Record<SystemEconomy, number> = { 'High-Tech': 1.15, 'Industrial': 0.90, 'Extraction': 1.00, 'Refinery': 0.95, 'Agricultural': 1.10 };
      const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
      const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;

      if (prev.playerStats.industryAutoClickerBots >= 25) {
        setTimeout(() => toast({ variant: "destructive", title: "Limit Reached", description: "You cannot deploy more than 25 bots." }), 0);
        return prev;
      }

      const botCost = Math.round(40500 * Math.pow(2.25, prev.playerStats.industryAutoClickerBots) * costModifier);

      if (prev.playerStats.netWorth < botCost) {
        setTimeout(() => toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits. You need ${botCost.toLocaleString()}¢.` }), 0);
        return prev;
      }

      const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - botCost, industryAutoClickerBots: prev.playerStats.industryAutoClickerBots + 1 };
      setTimeout(() => toast({ title: "Bot Deployed!", description: "A new assembly bot has been deployed." }), 0);
      return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast]);

  const handlePurchaseIndustry = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        if (prev.playerStats.industryEstablishmentLevel > 0) {
             setTimeout(() => toast({ variant: "destructive", title: "Already Owned", description: `You already own an industrial facility.` }), 0);
             return prev;
        }

        const cost = 4000 * 3;

        if (prev.playerStats.netWorth < cost) {
            setTimeout(() => toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` }), 0);
            return prev;
        }

        const initialValue = cost * (Math.random() * 0.4 + 0.8);
        const newPlayerStats: PlayerStats = { 
            ...prev.playerStats, 
            netWorth: prev.playerStats.netWorth - cost,
            industryEstablishmentLevel: 1,
            industryContract: { currentMarketValue: initialValue, valueHistory: [initialValue], partners: [], }
        };

        setTimeout(() => toast({ title: "Facility Acquired!", description: "You now manage this industrial facility." }), 0);
        return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast]);

  const handleExpandIndustry = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        const economyCostModifiers: Record<SystemEconomy, number> = { 'High-Tech': 1.15, 'Industrial': 0.90, 'Extraction': 1.00, 'Refinery': 0.95, 'Agricultural': 1.10 };
        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;
        const contract = prev.playerStats.industryContract;

        if (!contract || prev.playerStats.industryEstablishmentLevel < 1 || prev.playerStats.industryEstablishmentLevel > 4) {
             setTimeout(() => toast({ variant: "destructive", title: "Expansion Failed", description: "Cannot expand further or facility not owned." }), 0);
             return prev;
        }
        
        const expansionTiers = [40000, 400000, 4000000, 40000000].map(v => v * 3);
        const cost = Math.round(expansionTiers[prev.playerStats.industryEstablishmentLevel - 1] * costModifier);

        if (prev.playerStats.netWorth < cost) {
            setTimeout(() => toast({ variant: "destructive", title: "Expansion Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` }), 0);
            return prev;
        }

        const investmentValue = cost * (Math.random() * 0.2 + 0.7);
        const newMarketValue = Math.round(contract.currentMarketValue + investmentValue);

        const newPlayerStats: PlayerStats = { 
            ...prev.playerStats, 
            netWorth: prev.playerStats.netWorth - cost,
            industryEstablishmentLevel: prev.playerStats.industryEstablishmentLevel + 1,
            industryContract: { ...contract, currentMarketValue: newMarketValue, valueHistory: [...contract.valueHistory, newMarketValue].slice(-20) }
        };
        
        setTimeout(() => toast({ title: "Facility Expanded!", description: `Your industrial facility has grown to Tier ${newPlayerStats.industryEstablishmentLevel - 1}.` }), 0);
        return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast]);

  const handleSellIndustry = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        const contract = prev.playerStats.industryContract;
        if (!contract) {
            setTimeout(() => toast({ variant: "destructive", title: "Sale Failed", description: `You do not own an industrial facility to sell.` }), 0);
            return prev;
        }

        const salePrice = contract.currentMarketValue;
        const newPlayerStats: PlayerStats = { 
            ...prev.playerStats, 
            netWorth: prev.playerStats.netWorth + salePrice,
            industryLevel: 1,
            industryAutoClickerBots: 0,
            industryEstablishmentLevel: 0,
            industryContract: undefined,
        };
        
        setTimeout(() => toast({ title: "Facility Sold!", description: `You sold the industrial facility for ${salePrice.toLocaleString()}¢.` }), 0);
        return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast]);

  const handleAcceptIndustryPartnerOffer = useCallback((offer: PartnershipOffer) => {
    setGameState(prev => {
        if (!prev) return null;
        const contract = prev.playerStats.industryContract;
        if (!contract) return prev;

        const newPartner: BarPartner = { name: offer.partnerName, percentage: offer.stakePercentage, investment: offer.cashOffer };
        const updatedPartners = [...(contract.partners || []), newPartner];
        const totalPartnerShare = updatedPartners.reduce((acc, p) => acc + p.percentage, 0);

        if (totalPartnerShare > 1) {
             setTimeout(() => toast({ variant: "destructive", title: "Ownership Limit Reached", description: "You cannot sell more than 100% of your facility." }), 0);
             return prev;
        }

        const newPlayerStats = { 
            ...prev.playerStats, 
            netWorth: prev.playerStats.netWorth + offer.cashOffer,
            industryContract: { ...contract, partners: updatedPartners }
        };
        
        setTimeout(() => toast({ title: "Deal Struck!", description: `You sold a ${(offer.stakePercentage * 100).toFixed(0)}% stake to ${offer.partnerName} for ${offer.cashOffer.toLocaleString()}¢.` }), 0);
        return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast]);
  
  useEffect(() => {
    if (!gameState || (gameState.playerStats.industryAutoClickerBots || 0) === 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setGameState(prev => {
        if (!prev || (prev.playerStats.industryAutoClickerBots || 0) === 0) {
          clearInterval(intervalId);
          return prev;
        }

        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const currentPlanet = currentSystem?.planets.find(p => p.name === prev.currentPlanet);
        const zoneType = currentSystem?.zoneType;
        const theme = zoneType && industryThemes[zoneType] ? industryThemes[zoneType] : industryThemes['Default'];
        const planetModifier = currentPlanet ? (PLANET_TYPE_MODIFIERS[currentPlanet.type] || 1.0) : 1.0;

        const totalPartnerShare = (prev.playerStats.industryContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
        const incomePerClick = theme.baseIncome * prev.playerStats.industryLevel;
        const incomePerSecond = Math.round((prev.playerStats.industryAutoClickerBots || 0) * incomePerClick * (1 - totalPartnerShare) * planetModifier);

        const playerStatsWithIncome = { ...prev.playerStats, netWorth: prev.playerStats.netWorth + incomePerSecond };
        const [newState] = updateObjectiveProgress('industry', { ...prev, playerStats: playerStatsWithIncome });
        return newState;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameState?.playerStats.industryAutoClickerBots, gameState?.currentSystem, gameState?.currentPlanet, setGameState, updateObjectiveProgress]);

  return {
    handleIndustryClick,
    handleUpgradeIndustry,
    handleUpgradeIndustryAutoClicker,
    handlePurchaseIndustry,
    handleExpandIndustry,
    handleSellIndustry,
    handleAcceptIndustryPartnerOffer,
  };
}
