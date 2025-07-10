
'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, Coins, ChevronsUp, DollarSign, Bot } from 'lucide-react';
import { bankThemes } from '@/lib/bank-themes';
import BankContracts from './bank-contracts';
import type { SystemEconomy } from '@/lib/types';
import { PLANET_TYPE_MODIFIERS } from '@/lib/utils';
import { businessData, calculateCost } from '@/lib/business-data';
import VaultBreachMinigame from './vault-breach-minigame';

export default function BankClicker() {
    const { gameState, handleBankClick, handleUpgradeBank, handleUpgradeBankAutoClicker, handleAcceptBankPartnerOffer } = useGame();
    const [feedbackMessages, setFeedbackMessages] = useState<{ id: number, x: number, y: number, amount: number }[]>([]);

    if (!gameState || !gameState.playerStats.bankContract) {
        return null;
    }

    const { playerStats, difficulty, currentSystem: systemName } = gameState;
    const currentSystem = gameState.systems.find(s => s.name === systemName);
    const currentPlanet = currentSystem?.planets.find(p => p.name === gameState.currentPlanet);
    const zoneType = currentSystem?.zoneType;
    const theme = (zoneType && bankThemes[zoneType]) ? bankThemes[zoneType] : bankThemes['Default'];
    const planetModifier = currentPlanet ? (PLANET_TYPE_MODIFIERS[currentPlanet.type] || 1.0) : 1.0;
    
    const totalPartnerShare = (playerStats.bankContract?.partners || []).reduce((acc, p) => acc + p.percentage, 0);

    const rawIncomePerClick = theme.baseIncome * playerStats.bankLevel;
    const incomePerClick = Math.round(rawIncomePerClick * (1 - totalPartnerShare) * planetModifier);

    const difficultyModifiers = { 'Easy': 0.5, 'Medium': 1.0, 'Hard': 1.5, 'Hardcore': 1.5 };
    const difficultyModifier = difficultyModifiers[difficulty];

    const bankData = businessData.find(b => b.id === 'bank');
    if (!bankData) return null;

    const upgradeConfig = bankData.costs[0];
    const upgradeCost = calculateCost(playerStats.bankLevel, upgradeConfig.starterPrice, upgradeConfig.growth, difficultyModifier);
    const isBankLevelMaxed = playerStats.bankLevel >= 25;
    const canAffordUpgrade = playerStats.netWorth >= upgradeCost && !isBankLevelMaxed;

    const botConfig = bankData.costs[1];
    const botCost = calculateCost(playerStats.bankAutoClickerBots, botConfig.starterPrice, botConfig.growth, difficultyModifier);
    const canAffordBot = playerStats.netWorth >= botCost;
    
    const rawIncomePerSecond = playerStats.bankAutoClickerBots * rawIncomePerClick;
    const incomePerSecond = Math.round(rawIncomePerSecond * (1 - totalPartnerShare) * planetModifier);
    const isBotLimitReached = playerStats.bankAutoClickerBots >= 25;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        handleBankClick();
        
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
                            Bank Infrastructure
                        </CardTitle>
                        <CardDescription>Invest in your bank to increase transaction volume and profits.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Current Bank Level</span>
                            <span className="font-mono">{playerStats.bankLevel} / 25</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-4 w-4"/> Income Per Transaction</span>
                            <span className="font-mono text-amber-300">{incomePerClick.toLocaleString()}¢</span>
                        </div>
                        <Button className="w-full" onClick={handleUpgradeBank} disabled={!canAffordUpgrade}>
                            {isBankLevelMaxed ? 'Max Bank Level' : `Upgrade Bank (${upgradeCost.toLocaleString()}¢)`}
                        </Button>
                        
                        <div className="pt-4 border-t border-border/50"></div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Financial Bots</span>
                            <span className="font-mono">{playerStats.bankAutoClickerBots} / 25</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-1.5"><Bot className="h-4 w-4"/> Income Per Second</span>
                            <span className="font-mono text-amber-300">{incomePerSecond.toLocaleString()}¢</span>
                        </div>
                        
                        {!isBotLimitReached && (
                            <Button className="w-full" onClick={handleUpgradeBankAutoClicker} disabled={!canAffordBot}>
                                Deploy Bot ({botCost.toLocaleString()}¢)
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <BankContracts />

            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Landmark className="text-primary"/>
                        Security Simulations
                    </CardTitle>
                    <CardDescription>Hone your defense skills and earn extra credits.</CardDescription>
                </CardHeader>
                <CardContent>
                    <VaultBreachMinigame />
                </CardContent>
            </Card>
        </div>
    );
}
