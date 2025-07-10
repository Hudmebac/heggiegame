
'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, Coins, ChevronsUp, DollarSign, Bot } from 'lucide-react';
import { commerceThemes } from '@/lib/commerce-themes';
import CommerceContracts from './commerce-contracts';
import type { SystemEconomy } from '@/lib/types';
import { PLANET_TYPE_MODIFIERS } from '@/lib/utils';
import { businessData } from '@/lib/business-data';

export default function CommerceClicker() {
    const { gameState, handleCommerceClick, handleUpgradeCommerce, handleUpgradeCommerceAutoClicker, handlePurchaseCommerce, handleExpandCommerce, handleSellCommerce } = useGame();
    const [feedbackMessages, setFeedbackMessages] = useState<{ id: number, x: number, y: number, amount: number }[]>([]);

    if (!gameState) {
        return null;
    }

    const { playerStats, currentSystem: systemName, difficulty } = gameState;
    const currentSystem = gameState.systems.find(s => s.name === systemName);
    const currentPlanet = currentSystem?.planets.find(p => p.name === gameState.currentPlanet);
    const zoneType = currentSystem?.zoneType;
    const theme = (zoneType && commerceThemes[zoneType]) ? commerceThemes[zoneType] : commerceThemes['Default'];
    const planetModifier = currentPlanet ? (PLANET_TYPE_MODIFIERS[currentPlanet.type] || 1.0) : 1.0;
    
    const totalPartnerShare = (playerStats.commerceContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);

    const rawIncomePerClick = theme.baseIncome * playerStats.commerceLevel;
    const incomePerClick = Math.round(rawIncomePerClick * (1 - totalPartnerShare) * planetModifier);

    const economyCostModifiers: Record<SystemEconomy, number> = { 'High-Tech': 1.15, 'Industrial': 0.90, 'Extraction': 1.00, 'Refinery': 0.95, 'Agricultural': 1.10 };
    const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;
    const difficultyModifiers = { 'Easy': 0.5, 'Medium': 1.0, 'Hard': 1.5, 'Hardcore': 1.5 };
    const difficultyModifier = difficultyModifiers[difficulty];
    
    const commerceData = businessData.find(b => b.id === 'commerce');
    if (!commerceData) return null;

    const calculateCost = (level: number, config: { starterPrice: number, growth: number }) => {
        let cost = config.starterPrice;
        for (let i = 1; i < level; i++) {
            cost *= (1 + config.growth);
        }
        return Math.round(cost * difficultyModifier * costModifier);
    };

    const upgradeConfig = commerceData.costs[0];
    const upgradeCost = calculateCost(playerStats.commerceLevel + 1, upgradeConfig);
    const isCommerceLevelMaxed = playerStats.commerceLevel >= 25;
    const canAffordUpgrade = playerStats.netWorth >= upgradeCost && !isCommerceLevelMaxed;

    const botConfig = commerceData.costs[1];
    const botCost = calculateCost(playerStats.commerceAutoClickerBots + 1, botConfig);
    const canAffordBot = playerStats.netWorth >= botCost;
    
    const rawIncomePerSecond = playerStats.commerceAutoClickerBots * rawIncomePerClick;
    const incomePerSecond = Math.round(rawIncomePerSecond * (1 - totalPartnerShare) * planetModifier);
    const isBotLimitReached = playerStats.commerceAutoClickerBots >= 25;

    // Establishment upgrade logic
    const establishmentConfig = commerceData.costs[2];
    const currentEstablishmentLevel = playerStats.commerceEstablishmentLevel;
    const nextExpansionTier = currentEstablishmentLevel < 5;

    let expansionCost = 0;
    let canAffordExpansion = false;
    let expansionButtonLabel = "Max Level Reached";
    let expansionHandler = () => {};

    if (nextExpansionTier) {
        const baseCost = establishmentConfig.starterPrice * Math.pow(1 + establishmentConfig.growth, currentEstablishmentLevel);
        expansionCost = Math.round(baseCost * costModifier * difficultyModifier);
        canAffordExpansion = playerStats.netWorth >= expansionCost;
        const tierLabel = currentEstablishmentLevel === 0 ? "Acquire Commerce License" : `Expand Commerce Hub (Tier ${currentEstablishmentLevel})`;
        expansionButtonLabel = `${tierLabel} (${expansionCost.toLocaleString()}¢)`;
        expansionHandler = currentEstablishmentLevel === 0 ? handlePurchaseCommerce : handleExpandCommerce;
    }

    const getEstablishmentLevelLabel = (level: number) => {
        if (level === 0) return 'Unlicensed';
        if (level === 1) return 'Licensed';
        if (level === 5) return 'Galactic Conglomerate';
        return `Expansion Tier ${level - 1}`;
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        handleCommerceClick();
        
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const newFeedback = { id: Date.now(), x, y, amount: incomePerClick };
        setFeedbackMessages(prev => [...prev, newFeedback]);
        
        setTimeout(() => {
            setFeedbackMessages(prev => prev.filter(msg => msg.id !== newFeedback.id));
        }, 900);
    };

    return (
        <div className="space-y-6">
            <Card className="bg-black/50 border-primary/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
                        <Landmark className="h-8 w-8" />
                        {theme.name(gameState.currentPlanet || '')}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        {theme.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-8 py-8">
                    <div className="relative w-full max-w-sm">
                        <Button 
                            onClick={handleClick}
                            className="w-full h-24 text-xl font-bold bg-black border-2 border-primary text-primary hover:bg-primary/10 hover:shadow-[0_0_25px] hover:shadow-primary/70 transition-all duration-300 relative overflow-hidden animate-pulse-glow"
                        >
                            {theme.buttonText} (+{incomePerClick.toLocaleString()}¢)
                            {feedbackMessages.map(msg => (
                                <span 
                                    key={msg.id}
                                    className="absolute font-mono text-lg text-amber-300 animate-ping-up"
                                    style={{ left: `${msg.x}px`, top: `${msg.y}px`, pointerEvents: 'none' }}
                                >
                                    +{msg.amount.toLocaleString()}¢
                                </span>
                            ))}
                        </Button>
                    </div>

                    <div className="text-center">
                        <p className="text-muted-foreground">Current Net Worth</p>
                        <p className="text-3xl font-mono text-amber-300 flex items-center justify-center gap-2">
                            <Coins />
                            {(playerStats.netWorth || 0).toLocaleString()} ¢
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                            <ChevronsUp className="text-primary"/>
                            Hub Upgrades
                        </CardTitle>
                        <CardDescription>Invest in your commerce hub to increase your earnings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Current Hub Level</span>
                            <span className="font-mono">{playerStats.commerceLevel} / 25</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-4 w-4"/> Income Per Transaction</span>
                            <span className="font-mono text-amber-300">{incomePerClick.toLocaleString()}¢</span>
                        </div>
                        <Button className="w-full" onClick={handleUpgradeCommerce} disabled={!canAffordUpgrade}>
                            {isCommerceLevelMaxed ? 'Max Hub Level' : `Upgrade Hub (${upgradeCost.toLocaleString()}¢)`}
                        </Button>
                        
                        <div className="pt-4 border-t border-border/50"></div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Trading Bots</span>
                            <span className="font-mono">{playerStats.commerceAutoClickerBots} / 25</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5"><Bot className="h-4 w-4"/> Income Per Second</span>
                            <span className="font-mono text-amber-300">{incomePerSecond.toLocaleString()}¢</span>
                        </div>
                        
                        {!isBotLimitReached ? (
                            <Button className="w-full" onClick={handleUpgradeCommerceAutoClicker} disabled={!canAffordBot}>
                                Deploy Bot ({botCost.toLocaleString()}¢)
                            </Button>
                        ) : (
                            <div className="pt-4 border-t border-border/50"></div>
                        )}
                        
                        {isBotLimitReached && playerStats.commerceEstablishmentLevel === 0 && (
                            <Button className="w-full" onClick={expansionHandler} disabled={!canAffordExpansion}>
                                {expansionButtonLabel}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {playerStats.commerceEstablishmentLevel > 0 && playerStats.commerceContract && (
                    <CommerceContracts 
                        playerStats={playerStats} 
                        onSell={handleSellCommerce} 
                        onExpand={expansionHandler}
                        canAffordExpansion={canAffordExpansion}
                        expansionButtonLabel={expansionButtonLabel}
                        nextExpansionTier={nextExpansionTier}
                    />
                )}
            </div>
        </div>
    );
}
