'use client';

import { useContext, useState, useEffect, useTransition, ReactNode, useCallback } from 'react';
import type { GameState, MarketItem, PriceHistory, EncounterResult, System, Route, Pirate, PlayerStats, Quest, CargoUpgrade, WeaponUpgrade, ShieldUpgrade, LeaderboardEntry, InventoryItem, SystemEconomy, ItemCategory, CrewMember, ShipForSale, ZoneType, StaticItem, HullUpgrade, FuelUpgrade, SensorUpgrade, Planet, BarContract, BarPartner, PartnershipOffer, ActiveObjective, QuestTask, PlayerShip, CommerceContract, IndustryContract, ConstructionContract, RecreationContract, ResidenceContract } from '@/lib/lib/types'; // Assuming types are in lib/types
import { useToast } from "@/hooks/use-toast";

export type EstablishmentType = 'bar' | 'residence' | 'commerce' | 'industry' | 'construction' | 'recreation';

// Helper function to get establishment-specific data from playerStats
const getEstablishmentStats = (stats: PlayerStats, type: EstablishmentType) => {
    switch (type) {
        case 'bar': return {
            level: stats.barLevel,
            autoClickerBots: stats.autoClickerBots,
            establishmentLevel: stats.establishmentLevel,
            contract: stats.barContract,
        };
        case 'residence': return {
            level: stats.residenceLevel,
            autoClickerBots: stats.residenceAutoClickerBots,
            establishmentLevel: stats.residenceEstablishmentLevel,
            contract: stats.residenceContract,
        };
        case 'commerce': return {
            level: stats.commerceLevel,
            autoClickerBots: stats.commerceAutoClickerBots,
            establishmentLevel: stats.commerceEstablishmentLevel,
            contract: stats.commerceContract,
        };
        case 'industry': return {
            level: stats.industryLevel,
            autoClickerBots: stats.industryAutoClickerBots,
            establishmentLevel: stats.industryEstablishmentLevel,
            contract: stats.industryContract,
        };
        case 'construction': return {
            level: stats.constructionLevel,
            autoClickerBots: stats.constructionAutoClickerBots,
            establishmentLevel: stats.constructionEstablishmentLevel,
            contract: stats.constructionContract,
        };
        case 'recreation': return {
            level: stats.recreationLevel,
            autoClickerBots: stats.recreationAutoClickerBots,
            establishmentLevel: stats.recreationEstablishmentLevel,
            contract: stats.recreationContract,
        };
    }
};

// Helper function to update establishment-specific data in playerStats
const updateEstablishmentStats = (stats: PlayerStats, type: EstablishmentType, updates: Partial<ReturnType<typeof getEstablishmentStats>>) => {
    const newStats = { ...stats };
    switch (type) {
        case 'bar': return {
            ...newStats,
            barLevel: updates.level ?? newStats.barLevel,
            autoClickerBots: updates.autoClickerBots ?? newStats.autoClickerBots,
            establishmentLevel: updates.establishmentLevel ?? newStats.establishmentLevel,
            barContract: updates.contract === undefined ? newStats.barContract : updates.contract as BarContract,
        };
        case 'residence': return {
            ...newStats,
            residenceLevel: updates.level ?? newStats.residenceLevel,
            residenceAutoClickerBots: updates.autoClickerBots ?? newStats.residenceAutoClickerBots,
            residenceEstablishmentLevel: updates.establishmentLevel ?? newStats.residenceEstablishmentLevel,
            residenceContract: updates.contract === undefined ? newStats.residenceContract : updates.contract as ResidenceContract,
        };
        case 'commerce': return {
            ...newStats,
            commerceLevel: updates.level ?? newStats.commerceLevel,
            commerceAutoClickerBots: updates.autoClickerBots ?? newStats.commerceAutoClickerBots,
            commerceEstablishmentLevel: updates.establishmentLevel ?? newStats.commerceEstablishmentLevel,
            commerceContract: updates.contract === undefined ? newStats.commerceContract : updates.contract as CommerceContract,
        };
        case 'industry': return {
            ...newStats,
            industryLevel: updates.level ?? newStats.industryLevel,
            industryAutoClickerBots: updates.autoClickerBots ?? newStats.industryAutoClickerBots,
            industryEstablishmentLevel: updates.establishmentLevel ?? newStats.establishmentLevel,
            industryContract: updates.contract === undefined ? newStats.industryContract : updates.contract as IndustryContract,
        };
        case 'construction': return {
            ...newStats,
            constructionLevel: updates.level ?? newStats.constructionLevel,
            constructionAutoClickerBots: updates.autoClickerBots ?? newStats.constructionAutoClickerBots,
            constructionEstablishmentLevel: updates.establishmentLevel ?? newStats.establishmentLevel,
            constructionContract: updates.contract === undefined ? newStats.constructionContract : updates.contract as ConstructionContract,
        };
        case 'recreation': return {
            ...newStats,
            recreationLevel: updates.level ?? newStats.recreationLevel,
            recreationAutoClickerBots: updates.autoClickerBots ?? newStats.recreationAutoClickerBots,
            recreationEstablishmentLevel: updates.establishmentLevel ?? newStats.establishmentLevel,
            recreationContract: updates.contract === undefined ? newStats.recreationContract : updates.contract as RecreationContract,
        };
    }
};


interface UseEstablishmentManagerProps {
    gameState: GameState | null;
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
}

export function useEstablishmentManager({ gameState, setGameState }: UseEstablishmentManagerProps) {
    const { toast } = useToast();

    const handleUpgradeEstablishmentLevel = (type: EstablishmentType) => {
        setGameState(prev => {
            if (!prev) return null;

            const stats = getEstablishmentStats(prev.playerStats, type);
            const levelKey = `${type}Level` as keyof PlayerStats;

            if ((prev.playerStats[levelKey] as number) >= 25) { // Assuming max level is 25 for all
                toast({ variant: "destructive", title: "Upgrade Failed", description: `${type.charAt(0).toUpperCase() + type.slice(1)} level is already at maximum.` });
                return prev;
            }

            // Base cost and multiplier - adjust as needed per establishment type if they differ
            const baseCost = type === 'bar' ? 100 : type === 'residence' ? 50 : type === 'commerce' ? 150 : type === 'industry' ? 300 : type === 'construction' ? 200 : 125;
            const upgradeCost = Math.round(baseCost * Math.pow((prev.playerStats[levelKey] as number), 2.5));

            if (prev.playerStats.netWorth < upgradeCost) {
                toast({ variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${upgradeCost.toLocaleString()}¢.` });
                return prev;
            }

            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - upgradeCost,
            };
            (newPlayerStats as any)[levelKey] = (prev.playerStats[levelKey] as number) + 1;


            toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Upgraded!`, description: `Your ${type} is now Level ${newPlayerStats[levelKey] as number}.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handleUpgradeEstablishmentAutoClicker = (type: EstablishmentType) => {
        setGameState(prev => {
            if (!prev) return null;

            const autoClickerKey = `${type}AutoClickerBots` as keyof PlayerStats;

            if ((prev.playerStats[autoClickerKey] as number || 0) >= 25) { // Assuming max bots is 25 for all
                toast({ variant: "destructive", title: "Limit Reached", description: `You cannot purchase more than 25 bots for this ${type}.` });
                return prev;
            }

            // Base cost - adjust as needed per establishment type
            const baseCost = type === 'bar' ? 1000 : type === 'residence' ? 500 : type === 'commerce' ? 1500 : type === 'industry' ? 3000 : type === 'construction' ? 2000 : 1250;
            const cost = Math.round(baseCost * Math.pow(1.15, (prev.playerStats[autoClickerKey] as number || 0)));

            if (prev.playerStats.netWorth < cost) {
                toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits to buy a bot. You need ${cost.toLocaleString()}¢.` });
                return prev;
            }

            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
            };
            (newPlayerStats as any)[autoClickerKey] = (prev.playerStats[autoClickerKey] as number || 0) + 1;

            toast({ title: "Auto-Clicker Bot Purchased!", description: `A new bot has been added to your ${type} staff.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handlePurchaseEstablishment = (type: EstablishmentType) => {
        setGameState(prev => {
            if (!prev) return null;

            const establishmentLevelKey = `${type}EstablishmentLevel` as keyof PlayerStats;
            const contractKey = `${type}Contract` as keyof PlayerStats;
            const levelKey = `${type}Level` as keyof PlayerStats;
            const autoClickerKey = `${type}AutoClickerBots` as keyof PlayerStats;

            // Prevent purchasing if already owned
            if ((prev.playerStats[establishmentLevelKey] as number) > 0) {
                 toast({ variant: "destructive", title: "Already Owned", description: `You already own a ${type} establishment.` });
                 return prev;
            }

            // This calculation might need refinement based on theme/zone type income logic
            // For simplicity, using a placeholder based on current income capability
            const incomePerClick = 10; // Placeholder - this should come from themes
            const incomePerSecond = (prev.playerStats[autoClickerKey] as number || 0) * incomePerClick;
            const cost = incomePerSecond * 1000; // Example cost based on income potential

             if (incomePerSecond === 0 || cost === 0) {
                  toast({ variant: "destructive", title: "Purchase Failed", description: `Requires auto-clicker bots and establishment level to determine purchase price.` });
                  return prev;
             }


            if (prev.playerStats.netWorth < cost) {
                toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` });
                return prev;
            }

            const initialValue = cost * (Math.random() * 0.4 + 0.8); // 80-120% of cost as initial market value

            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
            };
            (newPlayerStats as any)[establishmentLevelKey] = 1;
            (newPlayerStats as any)[contractKey] = {
                currentMarketValue: initialValue,
                valueHistory: [initialValue],
                partners: [],
            };


            toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Purchased!`, description: `You are now the proud owner of this ${type} establishment.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };


    const handleExpandEstablishment = (type: EstablishmentType) => {
        setGameState(prev => {
            if (!prev) return null;

            const establishmentLevelKey = `${type}EstablishmentLevel` as keyof PlayerStats;
            const contractKey = `${type}Contract` as keyof PlayerStats;
            const levelKey = `${type}Level` as keyof PlayerStats;
            const autoClickerKey = `${type}AutoClickerBots` as keyof PlayerStats;

            const currentLevel = (prev.playerStats[establishmentLevelKey] as number || 0);
            const contract = prev.playerStats[contractKey] as BarContract; // Assuming contract structure is similar

            if (!contract || currentLevel < 1 || currentLevel > 4) { // Assuming max expansion level 4
                 toast({ variant: "destructive", title: "Expansion Failed", description: `Cannot expand ${type} further or establishment not owned.` });
                 return prev;
            }

            // This calculation might also need refinement based on theme/zone type income logic
            const incomePerClick = 10; // Placeholder - this should come from themes
            const incomePerSecond = (prev.playerStats[autoClickerKey] as number || 0) * incomePerClick;

            const expansionTiers = [10000, 100000, 1000000, 10000000]; // Example tiers
            const cost = incomePerSecond * expansionTiers[currentLevel - 1];

             if (incomePerSecond === 0 || cost === 0) {
                  toast({ variant: "destructive", title: "Expansion Failed", description: `Requires auto-clicker bots and establishment level to determine expansion cost.` });
                  return prev;
             }

            if (prev.playerStats.netWorth < cost) {
                toast({ variant: "destructive", title: "Expansion Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` });
                return prev;
            }

            const investmentValue = cost * (Math.random() * 0.2 + 0.7); // 70-90% of cost adds to market value
            const newMarketValue = Math.round(contract.currentMarketValue + investmentValue);


            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
            };
            (newPlayerStats as any)[establishmentLevelKey] = currentLevel + 1;
            (newPlayerStats as any)[contractKey] = {
                 ...contract,
                 currentMarketValue: newMarketValue,
                 valueHistory: [...contract.valueHistory, newMarketValue].slice(-20), // Keep last 20
            };


            toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Expanded!`, description: `Your ${type} has grown to Expansion Level ${newPlayerStats[establishmentLevelKey] as number - 1}.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };


    const handleSellEstablishment = (type: EstablishmentType) => {
        setGameState(prev => {
            if (!prev) return null;

            const establishmentLevelKey = `${type}EstablishmentLevel` as keyof PlayerStats;
            const contractKey = `${type}Contract` as keyof PlayerStats;
            const levelKey = `${type}Level` as keyof PlayerStats;
            const autoClickerKey = `${type}AutoClickerBots` as keyof PlayerStats;

             const contract = prev.playerStats[contractKey] as BarContract;

            if (!contract) {
                toast({ variant: "destructive", title: "Sale Failed", description: `You do not own a ${type} establishment to sell.` });
                return prev;
            }

            const salePrice = contract.currentMarketValue;

            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + salePrice,
            };
            (newPlayerStats as any)[levelKey] = 1; // Reset level on sale
            (newPlayerStats as any)[autoClickerKey] = 0; // Reset bots on sale
            (newPlayerStats as any)[establishmentLevelKey] = 0; // Reset establishment level
            delete (newPlayerStats as any)[contractKey]; // Remove the contract

            toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Sold!`, description: `You sold the ${type} establishment for ${salePrice.toLocaleString()}¢.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };


     const handleAcceptEstablishmentPartnerOffer = (type: EstablishmentType, offer: PartnershipOffer) => {
        setGameState(prev => {
            if (!prev) return null;

            const contractKey = `${type}Contract` as keyof PlayerStats;
            const contract = prev.playerStats[contractKey] as BarContract;

            if (!contract) {
                toast({ variant: "destructive", title: "Partnership Failed", description: `You do not own a ${type} establishment to accept partnerships.` });
                return prev;
            }

            const newPartner: BarPartner = { // Assuming BarPartner structure is generic for all partnerships
                name: offer.partnerName,
                percentage: offer.stakePercentage,
                investment: offer.cashOffer,
            };

             const updatedPartners = [...(contract.partners || []), newPartner];
             const totalPartnerShare = updatedPartners.reduce((acc, p) => acc + p.percentage, 0);

             if (totalPartnerShare > 1) {
                 toast({ variant: "destructive", title: "Ownership Limit Reached", description: "You cannot sell more than 100% of your establishment." });
                 return prev;
             }


            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + offer.cashOffer,
            };
            (newPlayerStats as any)[contractKey] = {
                 ...contract,
                 partners: updatedPartners,
            };

            toast({ title: "Deal Struck!", description: `You sold a ${(offer.stakePercentage * 100).toFixed(0)}% stake to ${offer.partnerName} for ${offer.cashOffer.toLocaleString()}¢.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    };


    return {
        handleUpgradeEstablishmentLevel,
        handleUpgradeEstablishmentAutoClicker,
        handlePurchaseEstablishment,
        handleExpandEstablishment,
        handleSellEstablishment,
        handleAcceptEstablishmentPartnerOffer,
    };
}