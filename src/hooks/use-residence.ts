
'use client';

import { useCallback, useEffect } from 'react';
import type { GameState, PartnershipOffer, PlayerStats, QuestTask, ActiveObjective, BarContract, BarPartner, SystemEconomy } from '@/lib/types';
import { residenceThemes } from '@/lib/residence-themes';
import { useToast } from '@/hooks/use-toast';
import { PLANET_TYPE_MODIFIERS } from '@/lib/utils';

export function useResidence(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>,
    updateObjectiveProgress: (objectiveType: QuestTask['type'], state: GameState) => [GameState, ActiveObjective[]]
) {
  const { toast } = useToast();

  const handleResidenceClick = useCallback(() => {
    let completedToastMessages: { title: string, description: string }[] = [];
    setGameState(prev => {
        if (!prev) return null;

        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const currentPlanet = currentSystem?.planets.find(p => p.name === prev.currentPlanet);
        const zoneType = currentSystem?.zoneType;
        const theme = (zoneType && residenceThemes[zoneType]) ? residenceThemes[zoneType] : residenceThemes['Default'];
        const planetModifier = currentPlanet ? (PLANET_TYPE_MODIFIERS[currentPlanet.type] || 1.0) : 1.0;

        const totalPartnerShare = (prev.playerStats.residenceContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
        const rawIncomePerClick = theme.baseIncome * prev.playerStats.residenceLevel;
        const income = Math.round(rawIncomePerClick * (1 - totalPartnerShare) * planetModifier);

        const baseState = { ...prev, playerStats: { ...prev.playerStats, netWorth: prev.playerStats.netWorth + income } };
        const [newState, completedObjectives] = updateObjectiveProgress('residence', baseState);
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

  const handleUpgradeResidence = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      const economyCostModifiers: Record<SystemEconomy, number> = { 'High-Tech': 1.15, 'Industrial': 0.90, 'Extraction': 1.00, 'Refinery': 0.95, 'Agricultural': 1.10 };
      const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
      const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;

      if (prev.playerStats.residenceLevel >= 25) {
        setTimeout(() => toast({ variant: "destructive", title: "Upgrade Failed", description: "Residence level is already at maximum." }), 0);
        return prev;
      }

      const upgradeCost = Math.round(125 * Math.pow(prev.playerStats.residenceLevel, 2.5) * costModifier);

      if (prev.playerStats.netWorth < upgradeCost) {
        setTimeout(() => toast({ variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${upgradeCost.toLocaleString()}¢.` }), 0);
        return prev;
      }

      const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - upgradeCost, residenceLevel: prev.playerStats.residenceLevel + 1 };
      setTimeout(() => toast({ title: "Residence Upgraded!", description: `Your residence is now Level ${newPlayerStats.residenceLevel}.` }), 0);
      return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast]);

  const handleUpgradeResidenceAutoClicker = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      const economyCostModifiers: Record<SystemEconomy, number> = { 'High-Tech': 1.15, 'Industrial': 0.90, 'Extraction': 1.00, 'Refinery': 0.95, 'Agricultural': 1.10 };
      const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
      const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;

      if (prev.playerStats.residenceAutoClickerBots >= 25) {
        setTimeout(() => toast({ variant: "destructive", title: "Limit Reached", description: "You cannot hire more than 25 bots." }), 0);
        return prev;
      }

      const botCost = Math.round(4250 * Math.pow(1.15, prev.playerStats.residenceAutoClickerBots) * costModifier);

      if (prev.playerStats.netWorth < botCost) {
        setTimeout(() => toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits. You need ${botCost.toLocaleString()}¢.` }), 0);
        return prev;
      }

      const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - botCost, residenceAutoClickerBots: prev.playerStats.residenceAutoClickerBots + 1 };
      setTimeout(() => toast({ title: "Bot Hired!", description: "A new service bot has been hired." }), 0);
      return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast]);

  const handlePurchaseResidence = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        if (prev.playerStats.residenceEstablishmentLevel > 0) {
             setTimeout(() => toast({ variant: "destructive", title: "Already Owned", description: `You already own a residence.` }), 0);
             return prev;
        }

        const cost = 5000 * 4;

        if (prev.playerStats.netWorth < cost) {
            setTimeout(() => toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` }), 0);
            return prev;
        }

        const initialValue = cost * (Math.random() * 0.4 + 0.8);
        const newPlayerStats: PlayerStats = { 
            ...prev.playerStats, 
            netWorth: prev.playerStats.netWorth - cost,
            residenceEstablishmentLevel: 1,
            residenceContract: { currentMarketValue: initialValue, valueHistory: [initialValue], partners: [], }
        };

        setTimeout(() => toast({ title: "Property Acquired!", description: "You now own this residential property." }), 0);
        return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast]);

  const handleExpandResidence = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        const economyCostModifiers: Record<SystemEconomy, number> = { 'High-Tech': 1.15, 'Industrial': 0.90, 'Extraction': 1.00, 'Refinery': 0.95, 'Agricultural': 1.10 };
        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;
        const contract = prev.playerStats.residenceContract;

        if (!contract || prev.playerStats.residenceEstablishmentLevel < 1 || prev.playerStats.residenceEstablishmentLevel > 4) {
             setTimeout(() => toast({ variant: "destructive", title: "Expansion Failed", description: "Cannot expand further or property not owned." }), 0);
             return prev;
        }
        
        const expansionTiers = [50000, 500000, 5000000, 50000000].map(v => v * 4);
        const cost = Math.round(expansionTiers[prev.playerStats.residenceEstablishmentLevel - 1] * costModifier);

        if (prev.playerStats.netWorth < cost) {
            setTimeout(() => toast({ variant: "destructive", title: "Expansion Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` }), 0);
            return prev;
        }

        const investmentValue = cost * (Math.random() * 0.2 + 0.7);
        const newMarketValue = Math.round(contract.currentMarketValue + investmentValue);

        const newPlayerStats: PlayerStats = { 
            ...prev.playerStats, 
            netWorth: prev.playerStats.netWorth - cost,
            residenceEstablishmentLevel: prev.playerStats.residenceEstablishmentLevel + 1,
            residenceContract: { ...contract, currentMarketValue: newMarketValue, valueHistory: [...contract.valueHistory, newMarketValue].slice(-20) }
        };
        
        setTimeout(() => toast({ title: "Property Expanded!", description: `Your property has grown to Level ${newPlayerStats.residenceEstablishmentLevel - 1}.` }), 0);
        return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast]);

  const handleSellResidence = useCallback(() => {
    setGameState(prev => {
        if (!prev) return null;
        const contract = prev.playerStats.residenceContract;
        if (!contract) {
            setTimeout(() => toast({ variant: "destructive", title: "Sale Failed", description: `You do not own a residence to sell.` }), 0);
            return prev;
        }

        const salePrice = contract.currentMarketValue;
        const newPlayerStats: PlayerStats = { 
            ...prev.playerStats, 
            netWorth: prev.playerStats.netWorth + salePrice,
            residenceLevel: 1,
            residenceAutoClickerBots: 0,
            residenceEstablishmentLevel: 0,
            residenceContract: undefined,
        };
        
        setTimeout(() => toast({ title: "Property Sold!", description: `You sold the residence for ${salePrice.toLocaleString()}¢.` }), 0);
        return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast]);

  const handleAcceptResidencePartnerOffer = useCallback((offer: PartnershipOffer) => {
    setGameState(prev => {
        if (!prev) return null;
        const contract = prev.playerStats.residenceContract;
        if (!contract) return prev;

        const newPartner: BarPartner = { name: offer.partnerName, percentage: offer.stakePercentage, investment: offer.cashOffer };
        const updatedPartners = [...(contract.partners || []), newPartner];
        const totalPartnerShare = updatedPartners.reduce((acc, p) => acc + p.percentage, 0);

        if (totalPartnerShare > 1) {
             setTimeout(() => toast({ variant: "destructive", title: "Ownership Limit Reached", description: "You cannot sell more than 100% of your property." }), 0);
             return prev;
        }

        const newPlayerStats = { 
            ...prev.playerStats, 
            netWorth: prev.playerStats.netWorth + offer.cashOffer,
            residenceContract: { ...contract, partners: updatedPartners }
        };
        
        setTimeout(() => toast({ title: "Deal Struck!", description: `You sold a ${(offer.stakePercentage * 100).toFixed(0)}% stake to ${offer.partnerName} for ${offer.cashOffer.toLocaleString()}¢.` }), 0);
        return { ...prev, playerStats: newPlayerStats };
    });
  }, [setGameState, toast]);
  
  useEffect(() => {
    if (!gameState || (gameState.playerStats.residenceAutoClickerBots || 0) === 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setGameState(prev => {
        if (!prev || (prev.playerStats.residenceAutoClickerBots || 0) === 0) {
          clearInterval(intervalId);
          return prev;
        }

        const currentSystem = prev.systems.find(s => s.name === prev.currentSystem);
        const currentPlanet = currentSystem?.planets.find(p => p.name === prev.currentPlanet);
        const zoneType = currentSystem?.zoneType;
        const theme = zoneType && residenceThemes[zoneType] ? residenceThemes[zoneType] : residenceThemes['Default'];
        const planetModifier = currentPlanet ? (PLANET_TYPE_MODIFIERS[currentPlanet.type] || 1.0) : 1.0;

        const totalPartnerShare = (prev.playerStats.residenceContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);
        const incomePerClick = theme.baseIncome * prev.playerStats.residenceLevel;
        const incomePerSecond = (prev.playerStats.residenceAutoClickerBots || 0) * incomePerClick * (1 - totalPartnerShare) * planetModifier;

        const playerStatsWithIncome = { ...prev.playerStats, netWorth: prev.playerStats.netWorth + incomePerSecond };
        const [newState] = updateObjectiveProgress('residence', { ...prev, playerStats: playerStatsWithIncome });
        return newState;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameState?.playerStats.residenceAutoClickerBots, gameState?.currentSystem, gameState?.currentPlanet, setGameState, updateObjectiveProgress]);

  return {
    handleResidenceClick,
    handleUpgradeResidence,
    handleUpgradeResidenceAutoClicker,
    handlePurchaseResidence,
    handleExpandResidence,
    handleSellResidence,
    handleAcceptResidencePartnerOffer,
  };
}
