'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Martini, Coins, ChevronsUp, DollarSign } from 'lucide-react';
import type { ZoneType } from '@/lib/types';

// Add baseIncome to themes to make them economically distinct
const barThemes: Record<ZoneType | 'Default', { name: (planetName: string) => string; description: string; buttonText: string; baseIncome: number; }> = {
    'Core World': {
        name: () => "The Gilded Orbit Lounge",
        description: "Serve high-end cocktails to diplomats and corporate executives in this luxurious, high-security establishment. The payouts are substantial, but discretion is paramount.",
        buttonText: "Mix Hyper-Gin Martini",
        baseIncome: 25
    },
    'Trade Hub': {
        name: () => "The Drifting Bazaar Cantina",
        description: "This chaotic bar is always packed with traders from a hundred worlds. The work is fast-paced, but the tips are good and the rumors are better.",
        buttonText: "Pour Spiced Ale",
        baseIncome: 15
    },
    'Frontier Outpost': {
        name: () => "The Dusty Mug",
        description: "A gritty outpost bar where prospectors and smugglers share stories over cheap synth-ale. Listen closely for valuable intel.",
        buttonText: "Serve Synth-Ale",
        baseIncome: 8
    },
    'Mining Colony': {
        name: () => "The Quarry Inn",
        description: "Serve hardworking miners after a long shift in this no-frills watering hole. They aren't picky, but they drink a lot.",
        buttonText: "Pour Asteroid Brew",
        baseIncome: 12
    },
    'Ancient Ruins': {
        name: () => "The Whispering Echo",
        description: "A strange, silent establishment built into the ruins. Patrons are few, but they pay in strange and valuable currency for even stranger drinks.",
        buttonText: "Dispense Relic Elixir",
        baseIncome: 5
    },
    'Corporate Zone': {
        name: () => "The Executive Retreat",
        description: "A pristine, exclusive bar for corporate bigwigs. Discretion is key, and the rewards for good service reflect it.",
        buttonText: "Serve Vintage Nectar",
        baseIncome: 22
    },
    'Diplomatic Station': {
        name: () => "The Ambassador's Respite",
        description: "A sophisticated lounge where galactic treaties are made and broken over glasses of aged brandy. Every drink served could influence galactic policy.",
        buttonText: "Pour Aldebaran Brandy",
        baseIncome: 20
    },
    'Default': {
        name: (planetName) => `The Cantina on ${planetName}`,
        description: "A typical spaceport bar. Serve drinks, earn credits, and listen for whispers of opportunity.",
        buttonText: "Serve Drink",
        baseIncome: 10
    }
};


export default function BarClicker() {
    const { gameState, handleBarClick, handleUpgradeBar } = useGame();
    const [feedbackMessages, setFeedbackMessages] = useState<{ id: number, x: number, y: number, amount: number }[]>([]);

    if (!gameState) {
        return null;
    }

    const currentSystem = gameState.systems.find(s => s.name === gameState.currentSystem);
    const zoneType = currentSystem?.zoneType;
    const theme = (zoneType && barThemes[zoneType]) ? barThemes[zoneType] : barThemes['Default'];
    
    // Update income calculation to use theme's base income
    const incomePerClick = theme.baseIncome * gameState.playerStats.barLevel;
    const upgradeCost = Math.round(100 * Math.pow(gameState.playerStats.barLevel, 2.5));
    const canAffordUpgrade = gameState.playerStats.netWorth >= upgradeCost;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        handleBarClick(incomePerClick);
        
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
                        <Martini className="h-8 w-8" />
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
                            className="w-full h-24 text-xl font-bold bg-black border-2 border-primary text-primary shadow-[0_0_15px] shadow-primary/50 hover:bg-primary/10 hover:shadow-[0_0_25px] hover:shadow-primary/70 transition-all duration-300 relative overflow-hidden"
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
                            {(gameState.playerStats.netWorth || 0).toLocaleString()} ¢
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <ChevronsUp className="text-primary"/>
                        Bar Upgrades
                    </CardTitle>
                    <CardDescription>Invest in your establishment to increase your earnings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Current Bar Level</span>
                        <span className="font-mono">{gameState.playerStats.barLevel}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-4 w-4"/> Income Per Serve</span>
                        <span className="font-mono text-amber-300">{incomePerClick}¢</span>
                    </div>
                     <Button className="w-full" onClick={handleUpgradeBar} disabled={!canAffordUpgrade}>
                        Upgrade Bar ({upgradeCost.toLocaleString()}¢)
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
