
'use client';

import { useCallback, useEffect } from 'react';
import type { GameState, PartnershipOffer, PlayerStats, QuestTask, ActiveObjective, BarContract, BarPartner, SystemEconomy } from '@/lib/types';
import { commerceThemes } from '@/lib/commerce-themes';
import { useToast } from '@/hooks/use-toast';
import { PLANET_TYPE_MODIFIERS } from '@/lib/utils';
import { businessData, calculateCost } from '@/lib/business-data';

export function useCommerce(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>,
    updateObjectiveProgress: (objectiveType: QuestTask['type'], state: GameState) => [GameState, ActiveObjective[]]
) {
  const { toast } = useToast();
  const commerceData = businessData.find(b => b.id === 'commerce');
  if (!commerceData) throw new Error("Commerce data not found in business data.");

  const handleCommerceClick = useCallback(() => {
    let completedToastMessages: { title: string, description: string }[] = [];
    setGameState(prev => {
        if (!prev) return null;

        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const currentPlanet = currentSystem?.planets.find(p => p.name === prev.currentPlanet);
        const zoneType = currentSystem?.zoneType;
        const theme = (zoneType && commerceThemes[zoneType]) ? commerceThemes[zoneType] : commerceThemes['Default'];
        const planetModifier = currentPlanet ? (PLANET_TYPE_MODIFIERS[currentPlanet.type] || 1.0) : 1.0;

        const totalPartnerShare = (prev.playerStats.commerceContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
        const rawIncomePerClick = theme.baseIncome * prev.playerStats.commerceLevel;
        const income = Math.round(rawIncomePerClick * (1 - totalPartnerShare) * planetModifier);
        
        const baseState = { ...prev, playerStats: { ...prev.playerStats, netWorth: prev.playerStats.netWorth + income } };
        const [newState, completedObjectives] = updateObjectiveProgress('commerce', baseState);
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

  const handleUpgradeCommerce = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      const { playerStats, currentSystem: systemName, difficulty } = prev;
      const currentSystem = prev.systems.find(s => s.name === systemName);

      const economyCostModifiers: Record<SystemEconomy, number> = { 'High-Tech': 1.15, 'Industrial': 0.90, 'Extraction': 1.00, 'Refinery': 0.95, 'Agricultural': 1.10 };
      const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;
      const difficultyModifiers = { 'Easy': 0.5, 'Medium': 1.0, 'Hard': 1.5, 'Hardcore': 1.5 };
      const difficultyModifier = difficultyModifiers[difficulty];

      const upgradeConfig = commerceData.costs[0];

      if (playerStats.commerceLevel >= 25) {
        setTimeout(() => toast({ variant: "destructive", title: "Upgrade Failed", description: "Commerce Hub level is already at maximum." }), 0);
        return prev;
      }
      
      const upgradeCost = calculateCost(playerStats.commerceLevel + 1, upgradeConfig.starterPrice, upgradeConfig.growth, difficultyModifier * costModifier);

      if (playerStats.netWorth < upgradeCost) {
        setTimeout(() => toast({ variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${upgradeCost.toLocaleString()}¢.` }), 0);
        return prev;
      }

      const newPlayerStats = { ...playerStats, netWorth: playerStats.netWorth - upgradeCost, commerceLevel: playerStats.commerceLevel + 1 };
      setTimeout(() => toast({ title: "Commerce Hub Upgraded!", description: `Your hub is now Level ${newPlayerStats.commerceLevel}.` }), 0);
      return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast, commerceData]);

  const handleUpgradeCommerceAutoClicker = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      const { playerStats, currentSystem: systemName, difficulty } = prev;
      const currentSystem = prev.systems.find(s => s.name === systemName);

      const economyCostModifiers: Record<SystemEconomy, number> = { 'High-Tech': 1.15, 'Industrial': 0.90, 'Extraction': 1.00, 'Refinery': 0.95, 'Agricultural': 1.10 };
      const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;
      const difficultyModifiers = { 'Easy': 0.5, 'Medium': 1.0, 'Hard': 1.5, 'Hardcore': 1.5 };
      const difficultyModifier = difficultyModifiers[difficulty];

      const botConfig = commerceData.costs[1];

      if (playerStats.commerceAutoClickerBots >= 25) {
        setTimeout(() => toast({ variant: "destructive", title: "Limit Reached", description: "You cannot deploy more than 25 bots." }), 0);
        return prev;
      }

      const botCost = calculateCost(playerStats.commerceAutoClickerBots + 1, botConfig.starterPrice, botConfig.growth, difficultyModifier * costModifier);

      if (playerStats.netWorth < botCost) {
        setTimeout(() => toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits. You need ${botCost.toLocaleString()}¢.` }), 0);
        return prev;
      }

      const newPlayerStats = { ...playerStats, netWorth: playerStats.netWorth - botCost, commerceAutoClickerBots: playerStats.commerceAutoClickerBots + 1 };
      setTimeout(() => toast({ title: "Bot Deployed!", description: "A new trading bot has been deployed." }), 0);
      return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast, commerceData]);

  const handlePurchaseCommerce = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        if (prev.playerStats.commerceEstablishmentLevel > 0) {
             setTimeout(() => toast({ variant: "destructive", title: "Already Owned", description: `You already own a commerce hub.` }), 0);
             return prev;
        }
        
        const establishmentConfig = commerceData.costs[2];
        const difficultyModifiers = { 'Easy': 0.5, 'Medium': 1.0, 'Hard': 1.5, 'Hardcore': 1.5 };
        const difficultyModifier = difficultyModifiers[prev.difficulty];
        const cost = establishmentConfig.starterPrice * difficultyModifier;

        if (prev.playerStats.netWorth < cost) {
            setTimeout(() => toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` }), 0);
            return prev;
        }

        const initialValue = cost * (Math.random() * 0.4 + 0.8);
        const newPlayerStats: PlayerStats = { 
            ...prev.playerStats, 
            netWorth: prev.playerStats.netWorth - cost,
            commerceEstablishmentLevel: 1,
            commerceContract: { currentMarketValue: initialValue, valueHistory: [initialValue], partners: [], }
        };

        setTimeout(() => toast({ title: "Commerce Hub Acquired!", description: "You now manage this commercial hub." }), 0);
        return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast, commerceData]);

  const handleExpandCommerce = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        const { playerStats, currentSystem: systemName, difficulty } = prev;
        const currentSystem = prev.systems.find(s => s.name === systemName);

        const economyCostModifiers: Record<SystemEconomy, number> = { 'High-Tech': 1.15, 'Industrial': 0.90, 'Extraction': 1.00, 'Refinery': 0.95, 'Agricultural': 1.10 };
        const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;
        const difficultyModifiers = { 'Easy': 0.5, 'Medium': 1.0, 'Hard': 1.5, 'Hardcore': 1.5 };
        const difficultyModifier = difficultyModifiers[difficulty];
        const contract = playerStats.commerceContract;
        
        const establishmentConfig = commerceData.costs[2];

        if (!contract || playerStats.commerceEstablishmentLevel < 1 || playerStats.commerceEstablishmentLevel >= 5) {
             setTimeout(() => toast({ variant: "destructive", title: "Expansion Failed", description: "Cannot expand further or hub not owned." }), 0);
             return prev;
        }
        
        const cost = calculateCost(playerStats.commerceEstablishmentLevel, establishmentConfig.starterPrice, establishmentConfig.growth, difficultyModifier * costModifier);

        if (playerStats.netWorth < cost) {
            setTimeout(() => toast({ variant: "destructive", title: "Expansion Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` }), 0);
            return prev;
        }

        const investmentValue = cost * (Math.random() * 0.2 + 0.7);
        const newMarketValue = Math.round(contract.currentMarketValue + investmentValue);

        const newPlayerStats: PlayerStats = { 
            ...playerStats, 
            netWorth: playerStats.netWorth - cost,
            commerceEstablishmentLevel: playerStats.commerceEstablishmentLevel + 1,
            commerceContract: { ...contract, currentMarketValue: newMarketValue, valueHistory: [...contract.valueHistory, newMarketValue].slice(-20) }
        };
        
        setTimeout(() => toast({ title: "Hub Expanded!", description: `Your commerce hub has grown to Tier ${newPlayerStats.commerceEstablishmentLevel - 1}.` }), 0);
        return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast, commerceData]);

  const handleSellCommerce = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        const contract = prev.playerStats.commerceContract;
        if (!contract) {
            setTimeout(() => toast({ variant: "destructive", title: "Sale Failed", description: `You do not own a commerce hub to sell.` }), 0);
            return prev;
        }

        const salePrice = contract.currentMarketValue;
        const newPlayerStats: PlayerStats = { 
            ...prev.playerStats, 
            netWorth: prev.playerStats.netWorth + salePrice,
            commerceLevel: 1,
            commerceAutoClickerBots: 0,
            commerceEstablishmentLevel: 0,
            commerceContract: undefined,
        };
        
        setTimeout(() => toast({ title: "Hub Sold!", description: `You sold the commerce hub for ${salePrice.toLocaleString()}¢.` }), 0);
        return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast]);

  const handleAcceptCommercePartnerOffer = useCallback((offer: PartnershipOffer) => {
    setGameState(prev => {
        if (!prev) return null;
        const contract = prev.playerStats.commerceContract;
        if (!contract) return prev;

        const newPartner: BarPartner = { name: offer.partnerName, percentage: offer.stakePercentage, investment: offer.cashOffer };
        const updatedPartners = [...(contract.partners || []), newPartner];
        const totalPartnerShare = updatedPartners.reduce((acc, p) => acc + p.percentage, 0);

        if (totalPartnerShare > 1) {
             setTimeout(() => toast({ variant: "destructive", title: "Ownership Limit Reached", description: "You cannot sell more than 100% of your hub." }), 0);
             return prev;
        }

        const newPlayerStats = { 
            ...prev.playerStats, 
            netWorth: prev.playerStats.netWorth + offer.cashOffer,
            commerceContract: { ...contract, partners: updatedPartners }
        };
        
        setTimeout(() => toast({ title: "Deal Struck!", description: `You sold a ${(offer.stakePercentage * 100).toFixed(0)}% stake to ${offer.partnerName} for ${offer.cashOffer.toLocaleString()}¢.` }), 0);
        return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast]);
  
  useEffect(() => {
    if (!gameState || (gameState.playerStats.commerceAutoClickerBots || 0) === 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setGameState(prev => {
        if (!prev || (prev.playerStats.commerceAutoClickerBots || 0) === 0) {
          clearInterval(intervalId);
          return prev;
        }

        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const currentPlanet = currentSystem?.planets.find(p => p.name === prev.currentPlanet);
        const zoneType = currentSystem?.zoneType;
        const theme = zoneType && commerceThemes[zoneType] ? commerceThemes[zoneType] : commerceThemes['Default'];
        const planetModifier = currentPlanet ? (PLANET_TYPE_MODIFIERS[currentPlanet.type] || 1.0) : 1.0;

        const totalPartnerShare = (prev.playerStats.commerceContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
        const incomePerClick = theme.baseIncome * prev.playerStats.commerceLevel;
        const incomePerSecond = Math.round((prev.playerStats.commerceAutoClickerBots || 0) * incomePerClick * (1 - totalPartnerShare) * planetModifier);

        const playerStatsWithIncome = { ...prev.playerStats, netWorth: prev.playerStats.netWorth + incomePerSecond };
        const [newState] = updateObjectiveProgress('commerce', { ...prev, playerStats: playerStatsWithIncome });
        return newState;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameState?.playerStats.commerceAutoClickerBots, gameState?.currentSystem, gameState?.currentPlanet, setGameState, updateObjectiveProgress]);

  return {
    handleCommerceClick,
    handleUpgradeCommerce,
    handleUpgradeCommerceAutoClicker,
    handlePurchaseCommerce,
    handleExpandCommerce,
    handleSellCommerce,
    handleAcceptCommercePartnerOffer,
  };
}
