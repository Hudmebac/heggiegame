
'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Coins, ChevronsUp, DollarSign, Bot } from 'lucide-react';
import { constructionThemes } from '@/lib/construction-themes';
import ConstructionContracts from './construction-contracts';
import type { SystemEconomy } from '@/lib/types';
import { PLANET_TYPE_MODIFIERS } from '@/lib/utils';
import { businessData, calculateCost } from '@/lib/business-data';

export default function ConstructionClicker() {
    const { gameState, handleConstructionClick, handleUpgradeConstruction, handleUpgradeConstructionAutoClicker, handlePurchaseConstruction, handleExpandConstruction, handleSellConstruction } = useGame();
    const [feedbackMessages, setFeedbackMessages] = useState<{ id: number, x: number, y: number, amount: number }[]>([]);

    if (!gameState) {
        return null;
    }

    const { playerStats, currentSystem: systemName, difficulty } = gameState;
    const currentSystem = gameState.systems.find(s => s.name === systemName);
    const currentPlanet = currentSystem?.planets.find(p => p.name === gameState.currentPlanet);
    const zoneType = currentSystem?.zoneType;
    const theme = (zoneType && constructionThemes[zoneType]) ? constructionThemes[zoneType] : constructionThemes['Default'];
    const planetModifier = currentPlanet ? (PLANET_TYPE_MODIFIERS[currentPlanet.type] || 1.0) : 1.0;
    
    const totalPartnerShare = (playerStats.constructionContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);

    const rawIncomePerClick = theme.baseIncome * playerStats.constructionLevel;
    const incomePerClick = Math.round(rawIncomePerClick * (1 - totalPartnerShare) * planetModifier);

    const economyCostModifiers: Record<SystemEconomy, number> = { 'High-Tech': 1.15, 'Industrial': 0.90, 'Extraction': 1.00, 'Refinery': 0.95, 'Agricultural': 1.10 };
    const costModifier = currentSystem ? economyCostModifiers[currentSystem.economy] : 1.0;
    const difficultyModifiers = { 'Easy': 0.5, 'Medium': 1.0, 'Hard': 1.5, 'Hardcore': 1.5 };
    const difficultyModifier = difficultyModifiers[difficulty];

    const constructionData = businessData.find(b => b.id === 'construction');
    if (!constructionData) return null;

    const upgradeConfig = constructionData.costs[0];
    const upgradeCost = calculateCost(playerStats.constructionLevel, upgradeConfig.starterPrice, upgradeConfig.growth, difficultyModifier * costModifier);
    const isConstructionLevelMaxed = playerStats.constructionLevel >= 25;
    const canAffordUpgrade = playerStats.netWorth >= upgradeCost && !isConstructionLevelMaxed;

    const botConfig = constructionData.costs[1];
    const botCost = calculateCost(playerStats.constructionAutoClickerBots, botConfig.starterPrice, botConfig.growth, difficultyModifier * costModifier);
    const canAffordBot = playerStats.netWorth >= botCost;
    
    const rawIncomePerSecond = playerStats.constructionAutoClickerBots * rawIncomePerClick;
    const incomePerSecond = Math.round(rawIncomePerSecond * (1 - totalPartnerShare) * planetModifier);
    const isBotLimitReached = playerStats.constructionAutoClickerBots >= 25;

    // Establishment upgrade logic
    const establishmentConfig = constructionData.costs[2];
    const currentEstablishmentLevel = playerStats.constructionEstablishmentLevel;
    const nextExpansionTier = currentEstablishmentLevel < 5;

    let expansionCost = 0;
    let canAffordExpansion = false;
    let expansionButtonLabel = "Max Level Reached";
    let expansionHandler = () => {};

    if (nextExpansionTier) {
        expansionCost = calculateCost(currentEstablishmentLevel, establishmentConfig.starterPrice, establishmentConfig.growth, difficultyModifier * costModifier);
        canAffordExpansion = playerStats.netWorth >= expansionCost;
        const tierLabel = currentEstablishmentLevel === 0 ? "Acquire Land Deed" : `Expand Project (Phase ${currentEstablishmentLevel})`;
        expansionButtonLabel = `${tierLabel} (${expansionCost.toLocaleString()}¢)`;
        expansionHandler = currentEstablishmentLevel === 0 ? handlePurchaseConstruction : handleExpandConstruction;
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        handleConstructionClick();
        
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
                        <Building2 className="h-8 w-8" />
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
                            Project Upgrades
                        </CardTitle>
                        <CardDescription>Invest in your construction project to increase your output.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Current Project Level</span>
                            <span className="font-mono">{playerStats.constructionLevel} / 25</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-4 w-4"/> Income Per Cycle</span>
                            <span className="font-mono text-amber-300">{incomePerClick.toLocaleString()}¢</span>
                        </div>
                        <Button className="w-full" onClick={handleUpgradeConstruction} disabled={!canAffordUpgrade}>
                            {isConstructionLevelMaxed ? 'Max Project Level' : `Upgrade Project (${upgradeCost.toLocaleString()}¢)`}
                        </Button>
                        
                        <div className="pt-4 border-t border-border/50"></div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Construction Bots</span>
                            <span className="font-mono">{playerStats.constructionAutoClickerBots} / 25</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5"><Bot className="h-4 w-4"/> Income Per Second</span>
                            <span className="font-mono text-amber-300">{incomePerSecond.toLocaleString()}¢</span>
                        </div>
                        
                        {!isBotLimitReached ? (
                            <Button className="w-full" onClick={handleUpgradeConstructionAutoClicker} disabled={!canAffordBot}>
                                Deploy Bot ({botCost.toLocaleString()}¢)
                            </Button>
                        ) : (
                            <div className="pt-4 border-t border-border/50"></div>
                        )}
                        
                        {isBotLimitReached && playerStats.constructionEstablishmentLevel === 0 && (
                            <Button className="w-full" onClick={expansionHandler} disabled={!canAffordExpansion}>
                                {expansionButtonLabel}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {playerStats.constructionEstablishmentLevel > 0 && playerStats.constructionContract && (
                    <ConstructionContracts 
                        playerStats={playerStats} 
                        onSell={handleSellConstruction} 
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
