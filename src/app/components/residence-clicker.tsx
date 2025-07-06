
'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Coins, ChevronsUp, DollarSign, Bot, Building2 } from 'lucide-react';
import { residenceThemes } from '@/lib/residence-themes';
import ResidenceContracts from './residence-contracts';

export default function ResidenceClicker() {
    const { gameState, handleResidenceClick, handleUpgradeResidence, handleUpgradeResidenceAutoClicker, handlePurchaseResidence, handleExpandResidence, handleSellResidence } = useGame();
    const [feedbackMessages, setFeedbackMessages] = useState<{ id: number, x: number, y: number, amount: number }[]>([]);

    if (!gameState) {
        return null;
    }

    const { playerStats } = gameState;
    const currentSystem = gameState.systems.find(s => s.name === gameState.currentSystem);
    const zoneType = currentSystem?.zoneType;
    const theme = (zoneType && residenceThemes[zoneType]) ? residenceThemes[zoneType] : residenceThemes['Default'];
    
    const totalPartnerShare = (playerStats.residenceContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);

    const rawIncomePerClick = theme.baseIncome * playerStats.residenceLevel;
    const incomePerClick = Math.round(rawIncomePerClick * (1 - totalPartnerShare));

    const upgradeCost = Math.round(50 * Math.pow(playerStats.residenceLevel, 2.5));
    const isResidenceLevelMaxed = playerStats.residenceLevel >= 25;
    const canAffordUpgrade = playerStats.netWorth >= upgradeCost && !isResidenceLevelMaxed;

    const botCost = Math.round(500 * Math.pow(1.15, playerStats.residenceAutoClickerBots));
    const canAffordBot = playerStats.netWorth >= botCost;
    
    const rawIncomePerSecond = playerStats.residenceAutoClickerBots * rawIncomePerClick;
    const incomePerSecond = Math.round(rawIncomePerSecond * (1 - totalPartnerShare));
    const isBotLimitReached = playerStats.residenceAutoClickerBots >= 25;

    // Establishment upgrade logic
    const expansionTiers = [
        { level: 1, costMultiplier: 1000, label: "Purchase Property Deed" },
        { level: 2, costMultiplier: 10000, label: "Expand Property (Level 1)" },
        { level: 3, costMultiplier: 100000, label: "Expand Property (Level 2)" },
        { level: 4, costMultiplier: 1000000, label: "Expand Property (Level 3)" },
        { level: 5, costMultiplier: 10000000, label: "Develop into Galactic Estate" },
    ];
    
    const currentEstablishmentLevel = playerStats.residenceEstablishmentLevel;
    const nextExpansionTier = currentEstablishmentLevel < expansionTiers.length ? expansionTiers[currentEstablishmentLevel] : null;

    let expansionCost = 0;
    let canAffordExpansion = false;
    let expansionButtonLabel = "Max Level Reached";
    let expansionHandler = () => {};

    if (nextExpansionTier) {
        expansionCost = incomePerSecond * nextExpansionTier.costMultiplier;
        canAffordExpansion = playerStats.netWorth >= expansionCost;
        expansionButtonLabel = `${nextExpansionTier.label} (${expansionCost.toLocaleString()}¢)`;
        expansionHandler = currentEstablishmentLevel === 0 ? handlePurchaseResidence : handleExpandResidence;
    }

    const getEstablishmentLevelLabel = (level: number) => {
        if (level === 0) return 'Not Purchased';
        if (level === 1) return 'Purchased';
        if (level === 5) return 'Galactic Estate';
        return `Expansion Level ${level - 1}`;
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        handleResidenceClick(incomePerClick);
        
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
                        <Home className="h-8 w-8" />
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
                            Property Upgrades
                        </CardTitle>
                        <CardDescription>Invest in your residence to increase your earnings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Current Residence Level</span>
                            <span className="font-mono">{playerStats.residenceLevel} / 25</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-4 w-4"/> Income Per Collection</span>
                            <span className="font-mono text-amber-300">{incomePerClick}¢</span>
                        </div>
                        <Button className="w-full" onClick={handleUpgradeResidence} disabled={!canAffordUpgrade}>
                            {isResidenceLevelMaxed ? 'Max Residence Level' : `Upgrade Residence (${upgradeCost.toLocaleString()}¢)`}
                        </Button>
                        
                        <div className="pt-4 border-t border-border/50"></div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Service Bots</span>
                            <span className="font-mono">{playerStats.residenceAutoClickerBots} / 25</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5"><Bot className="h-4 w-4"/> Income Per Second</span>
                            <span className="font-mono text-amber-300">{incomePerSecond.toLocaleString()}¢</span>
                        </div>
                        
                        {!isBotLimitReached ? (
                            <Button className="w-full" onClick={handleUpgradeResidenceAutoClicker} disabled={!canAffordBot}>
                                Hire Bot ({botCost.toLocaleString()}¢)
                            </Button>
                        ) : (
                            <div className="pt-4 border-t border-border/50"></div>
                        )}
                        
                        {isBotLimitReached && playerStats.residenceEstablishmentLevel === 0 && (
                            <Button className="w-full" onClick={expansionHandler} disabled={!canAffordExpansion}>
                                {expansionButtonLabel}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {playerStats.residenceEstablishmentLevel > 0 && playerStats.residenceContract && (
                    <ResidenceContracts 
                        playerStats={playerStats} 
                        onSell={handleSellResidence} 
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
