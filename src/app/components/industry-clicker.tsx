
'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Factory, Coins, ChevronsUp, DollarSign, Bot } from 'lucide-react';
import { industryThemes } from '@/lib/industry-themes';
import IndustryContracts from './industry-contracts';
import type { SystemEconomy } from '@/lib/types';
import { PLANET_TYPE_MODIFIERS } from '@/lib/utils';

export default function IndustryClicker() {
    const { gameState, handleIndustryClick, handleUpgradeIndustry, handleUpgradeIndustryAutoClicker, handlePurchaseIndustry, handleExpandIndustry, handleSellIndustry } = useGame();
    const [feedbackMessages, setFeedbackMessages] = useState<{ id: number, x: number, y: number, amount: number }[]>([]);

    if (!gameState) {
        return null;
    }

    const { playerStats } = gameState;
    const currentSystem = gameState.systems.find(s => s.name === gameState.currentSystem);
    const currentPlanet = currentSystem?.planets.find(p => p.name === gameState.currentPlanet);
    const zoneType = currentSystem?.zoneType;
    const theme = (zoneType && industryThemes[zoneType]) ? industryThemes[zoneType] : industryThemes['Default'];
    const planetModifier = currentPlanet ? (PLANET_TYPE_MODIFIERS[currentPlanet.type] || 1.0) : 1.0;
    
    const totalPartnerShare = (playerStats.industryContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);

    const rawIncomePerClick = theme.baseIncome * playerStats.industryLevel;
    const incomePerClick = Math.round(rawIncomePerClick * (1 - totalPartnerShare) * planetModifier);

    const economyCostModifiers: Record<SystemEconomy, number> = {
        'High-Tech': 1.15,
        'Industrial': 0.90,
        'Extraction': 1.00,
        'Refinery': 0.95,
        'Agricultural': 1.10
    };
    const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;

    const upgradeCost = Math.round(1200 * Math.pow(playerStats.industryLevel, 2.5) * costModifier);
    const isIndustryLevelMaxed = playerStats.industryLevel >= 25;
    const canAffordUpgrade = playerStats.netWorth >= upgradeCost && !isIndustryLevelMaxed;

    const botCost = Math.round(40500 * Math.pow(1.15, playerStats.industryAutoClickerBots) * costModifier);
    const canAffordBot = playerStats.netWorth >= botCost;
    
    const rawIncomePerSecond = playerStats.industryAutoClickerBots * rawIncomePerClick;
    const incomePerSecond = Math.round(rawIncomePerSecond * (1 - totalPartnerShare) * planetModifier);
    const isBotLimitReached = playerStats.industryAutoClickerBots >= 25;

    // Establishment upgrade logic
    const expansionTiers = [
        { level: 1, costMultiplier: 4000, label: "Acquire Industrial Permit" },
        { level: 2, costMultiplier: 40000, label: "Expand Factory (Tier 1)" },
        { level: 3, costMultiplier: 400000, label: "Expand Factory (Tier 2)" },
        { level: 4, costMultiplier: 4000000, label: "Expand Factory (Tier 3)" },
        { level: 5, costMultiplier: 40000000, label: "Develop into Galactic Conglomerate" },
    ];
    
    const currentEstablishmentLevel = playerStats.industryEstablishmentLevel;
    const nextExpansionTier = currentEstablishmentLevel < expansionTiers.length ? expansionTiers[currentEstablishmentLevel] : null;

    let expansionCost = 0;
    let canAffordExpansion = false;
    let expansionButtonLabel = "Max Level Reached";
    let expansionHandler = () => {};

    if (nextExpansionTier) {
        expansionCost = Math.round(incomePerSecond * nextExpansionTier.costMultiplier * costModifier);
        canAffordExpansion = playerStats.netWorth >= expansionCost;
        expansionButtonLabel = `${nextExpansionTier.label} (${expansionCost.toLocaleString()}¢)`;
        expansionHandler = currentEstablishmentLevel === 0 ? handlePurchaseIndustry : handleExpandIndustry;
    }

    const getEstablishmentLevelLabel = (level: number) => {
        if (level === 0) return 'Unlicensed';
        if (level === 1) return 'Permitted';
        if (level === 5) return 'Galactic Conglomerate';
        return `Expansion Tier ${level - 1}`;
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        handleIndustryClick();
        
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
                        <Factory className="h-8 w-8" />
                        {theme.name(gameState.currentPlanet)}
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
                            {theme.buttonText} (+{incomePerClick}¢)
                            {feedbackMessages.map(msg => (
                                <span 
                                    key={msg.id}
                                    className="absolute font-mono text-lg text-amber-300 animate-ping-up"
                                    style={{ left: `${msg.x}px`, top: `${msg.y}px`, pointerEvents: 'none' }}
                                >
                                    +{msg.amount}¢
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
                            Factory Upgrades
                        </CardTitle>
                        <CardDescription>Invest in your industrial facility to increase your output.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Current Factory Level</span>
                            <span className="font-mono">{playerStats.industryLevel} / 25</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-4 w-4"/> Income Per Cycle</span>
                            <span className="font-mono text-amber-300">{incomePerClick}¢</span>
                        </div>
                        <Button className="w-full" onClick={handleUpgradeIndustry} disabled={!canAffordUpgrade}>
                            {isIndustryLevelMaxed ? 'Max Factory Level' : `Upgrade Factory (${upgradeCost.toLocaleString()}¢)`}
                        </Button>
                        
                        <div className="pt-4 border-t border-border/50"></div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Assembly Bots</span>
                            <span className="font-mono">{playerStats.industryAutoClickerBots} / 25</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5"><Bot className="h-4 w-4"/> Income Per Second</span>
                            <span className="font-mono text-amber-300">{incomePerSecond.toLocaleString()}¢</span>
                        </div>
                        
                        {!isBotLimitReached ? (
                            <Button className="w-full" onClick={handleUpgradeIndustryAutoClicker} disabled={!canAffordBot}>
                                Deploy Bot ({botCost.toLocaleString()}¢)
                            </Button>
                        ) : (
                            <div className="pt-4 border-t border-border/50"></div>
                        )}
                        
                        {isBotLimitReached && playerStats.industryEstablishmentLevel === 0 && (
                            <Button className="w-full" onClick={expansionHandler} disabled={!canAffordExpansion}>
                                {expansionButtonLabel}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {playerStats.industryEstablishmentLevel > 0 && playerStats.industryContract && (
                    <IndustryContracts 
                        playerStats={playerStats} 
                        onSell={handleSellIndustry} 
                        onExpand={expansionHandler}
                        canAffordExpansion={canAffordExpansion}
                        expansionButtonLabel={expansionButtonLabel}
                        nextExpansionTier={!!nextExpansionTier}
                    />
                )}
            </div>
        </div>
    );
}
