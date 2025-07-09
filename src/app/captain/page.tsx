
'use client';
import PlayerProfile from '@/app/components/player-profile';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins, Trophy, Handshake, Briefcase, Martini, Home, Landmark, Factory, Building2, Ticket, Heart, Shield, Package, LucideIcon } from 'lucide-react';
import { barThemes } from '@/lib/bar-themes';
import { residenceThemes } from '@/lib/residence-themes';
import { commerceThemes } from '@/lib/commerce-themes';
import { industryThemes } from '@/lib/industry-themes';
import { constructionThemes } from '@/lib/construction-themes';
import { recreationThemes } from '@/lib/recreation-themes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { calculateCargoValue, calculateShipValue } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CAREER_DATA } from '@/lib/careers';

const reputationTiers: Record<string, { label: string; color: string; progressColor: string }> = {
    Outcast: { label: 'Outcast', color: 'text-destructive', progressColor: 'from-red-600 to-destructive' },
    Rookie: { label: 'Rookie', color: 'text-muted-foreground', progressColor: 'from-gray-500 to-gray-400' },
    Spacer: { label: 'Spacer', color: 'text-sky-400', progressColor: 'from-sky-500 to-sky-400' },
    Broker: { label: 'Broker', color: 'text-blue-400', progressColor: 'from-blue-500 to-blue-400' },
    Strategist: { label: 'Strategist', color: 'text-indigo-400', progressColor: 'from-indigo-500 to-indigo-400' },
    Magnate: { label: 'Magnate', color: 'text-purple-400', progressColor: 'from-purple-500 to-purple-400' },
    'Galactic Syndicate': { label: 'Galactic Syndicate', color: 'text-primary', progressColor: 'from-amber-400 to-primary' },
};

function getReputationTier(score: number) {
    if (score < 0) return reputationTiers.Outcast;
    if (score < 20) return reputationTiers.Rookie;
    if (score < 40) return reputationTiers.Spacer;
    if (score < 60) return reputationTiers.Broker;
    if (score < 80) return reputationTiers.Strategist;
    if (score < 100) return reputationTiers.Magnate;
    return reputationTiers['Galactic Syndicate'];
}


export default function CaptainPage() {
  const { gameState, isGeneratingBio, handleGenerateBio, setPlayerName, handleSetAvatar, handleResetGame, handlePurchaseInsurance } = useGame();

  if (!gameState) {
    return null; 
  }

  const { playerStats, currentSystem: currentSystemName, systems, marketItems, inventory, difficulty } = gameState;
  const currentSystem = systems.find(s => s.name === currentSystemName);
  const zoneType = currentSystem?.zoneType;
  const isHardcore = difficulty === 'Hardcore';
  
  const leaderboardRank = gameState.leaderboard.find(e => e.trader === playerStats.name)?.rank || gameState.leaderboard.length;

  const reputationInfo = getReputationTier(playerStats.reputation);
  const reputationProgress = (Math.max(0, playerStats.reputation) / 100) * 100;

  const careerInfo = CAREER_DATA.find(c => c.id === playerStats.career);
  const CareerIcon = careerInfo?.icon as LucideIcon | undefined;

  // --- Income Calculations ---
  const calculateIncome = (level: number, bots: number, contract: any, themes: any) => {
    if (!zoneType) return 0;
    const theme = themes[zoneType] || themes['Default'];
    const totalPartnerShare = (contract?.partners || []).reduce((acc: number, p: { percentage: number }) => acc + p.percentage, 0);
    const rawIncomePerClick = theme.baseIncome * level;
    return Math.round((bots * rawIncomePerClick) * (1 - totalPartnerShare));
  };

  const portfolio = [
    { name: 'Bar', icon: Martini, level: playerStats.barLevel, bots: playerStats.autoClickerBots, income: calculateIncome(playerStats.barLevel, playerStats.autoClickerBots, playerStats.barContract, barThemes) },
    { name: 'Residence', icon: Home, level: playerStats.residenceLevel, bots: playerStats.residenceAutoClickerBots, income: calculateIncome(playerStats.residenceLevel, playerStats.residenceAutoClickerBots, playerStats.residenceContract, residenceThemes) },
    { name: 'Commerce', icon: Landmark, level: playerStats.commerceLevel, bots: playerStats.commerceAutoClickerBots, income: calculateIncome(playerStats.commerceLevel, playerStats.commerceAutoClickerBots, playerStats.commerceContract, commerceThemes) },
    { name: 'Industry', icon: Factory, level: playerStats.industryLevel, bots: playerStats.industryAutoClickerBots, income: calculateIncome(playerStats.industryLevel, playerStats.industryAutoClickerBots, playerStats.industryContract, industryThemes) },
    { name: 'Construction', icon: Building2, level: playerStats.constructionLevel, bots: playerStats.constructionAutoClickerBots, income: calculateIncome(playerStats.constructionLevel, playerStats.constructionAutoClickerBots, playerStats.constructionContract, constructionThemes) },
    { name: 'Recreation', icon: Ticket, level: playerStats.recreationLevel, bots: playerStats.recreationAutoClickerBots, income: calculateIncome(playerStats.recreationLevel, playerStats.recreationAutoClickerBots, playerStats.recreationContract, recreationThemes) },
  ];

  const totalPassiveIncome = portfolio.reduce((sum, item) => sum + item.income, 0);

  const activeShip = playerStats.fleet[0];
  const shipValue = activeShip ? calculateShipValue(activeShip) : 0;
  const cargoValue = calculateCargoValue(inventory, marketItems);

  const insurancePolicies = {
    health: { 
        name: 'Health Insurance', 
        description: isHardcore 
            ? 'On ship destruction, your save is deleted. This policy is unavailable in Hardcore mode.' 
            : 'On rebirth after ship destruction, retain 50% of your net worth.', 
        cost: Math.round(playerStats.netWorth * 0.10),
        icon: Heart,
        type: 'health' as const,
    },
    ship: { 
        name: 'Ship Insurance', 
        description: isHardcore 
            ? 'Reduces repair costs by 50%. Does not prevent permanent loss on destruction.' 
            : 'Reduces repair costs by 50%. Your ship is returned upon rebirth.', 
        cost: Math.round(playerStats.netWorth * 0.10 + shipValue * 0.15),
        icon: Shield,
        type: 'ship' as const,
    },
    cargo: {
        name: 'Cargo Insurance',
        description: isHardcore 
            ? 'Recover 10% of cargo value if lost to pirates. Does not cover ship destruction.' 
            : 'Recover 10% of cargo value if lost to pirates, or 25% on rebirth.',
        cost: Math.round(playerStats.netWorth * 0.05 + cargoValue * 0.10),
        icon: Package,
        type: 'cargo' as const,
    },
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2">
            <PlayerProfile
                stats={playerStats}
                onSetAvatar={handleSetAvatar}
                onGenerateBio={handleGenerateBio}
                isGeneratingBio={isGeneratingBio}
                onNameChange={setPlayerName}
                onResetGame={handleResetGame}
            />
        </div>
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                            <Coins className="text-primary"/>
                            Finances
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Net Worth</span>
                            <span className="font-mono text-amber-300">{playerStats.netWorth.toLocaleString()} ¢</span>
                        </div>
                        <Link href="/bank" passHref>
                            <Button className="w-full mt-2" variant="outline">
                                <Landmark className="mr-2" />
                                Galactic Bank
                            </Button>
                        </Link>
                        <Link href="/captain/get-tokens" passHref>
                            <Button className="w-full mt-2">
                                <Coins className="mr-2"/>
                                Get Tokens
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                            <Trophy className="text-primary"/>
                            Ranking
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Global Rank</span>
                            <span className="font-mono text-primary">#{leaderboardRank}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Fleet Size</span>
                            <span className="font-mono text-primary">{playerStats.fleet.length}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Handshake className="text-primary"/>
                        Reputation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Galactic Standing</span>
                        <span className={`font-mono font-bold ${reputationInfo.color}`}>{reputationInfo.label}</span>
                    </div>
                    <div>
                        <Progress value={reputationProgress} className="h-2 [&>div]:bg-gradient-to-r" indicatorClassName={reputationInfo.progressColor} />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Outcast</span>
                            <span>Rookie</span>
                            <span>Syndicate</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
             {careerInfo && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                            {CareerIcon && <CareerIcon className="text-primary" />}
                            Career: {careerInfo.name}
                        </CardTitle>
                        <CardDescription>{careerInfo.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <h4 className="font-semibold text-sm">Perks:</h4>
                            <ul className="list-disc list-inside text-xs text-muted-foreground">
                                {careerInfo.perks.map((perk, i) => <li key={i}>{perk}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Risks:</h4>
                            <ul className="list-disc list-inside text-xs text-muted-foreground">
                                {careerInfo.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
        <div className="lg:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Shield className="text-primary"/>
                        Insurance Policies
                    </CardTitle>
                    <CardDescription>
                        Protect your assets against the dangers of the galaxy. Premiums are a one-time payment.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.values(insurancePolicies).map(policy => (
                        <div key={policy.name} className="flex items-center justify-between p-3 rounded-md bg-card/50">
                           <div className="flex items-start gap-3">
                                <policy.icon className="h-5 w-5 text-primary/70 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold">{policy.name}</h4>
                                    <p className="text-xs text-muted-foreground">{policy.description}</p>
                                </div>
                           </div>
                            {playerStats.insurance[policy.type] ? (
                                <span className="text-sm font-bold text-green-400 whitespace-nowrap">Active</span>
                            ) : (
                                <Button size="sm" onClick={() => handlePurchaseInsurance(policy.type)} disabled={playerStats.netWorth < policy.cost || (isHardcore && policy.type === 'health')}>
                                    Purchase ({policy.cost.toLocaleString()}¢)
                                </Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Briefcase className="text-primary"/>
                        Business Portfolio
                    </CardTitle>
                    <CardDescription>
                        Overview of your income-generating assets across the galaxy.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asset</TableHead>
                                <TableHead className="text-right">Level</TableHead>
                                <TableHead className="text-right">Bots</TableHead>
                                <TableHead className="text-right">Income/sec</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {portfolio.map(asset => (
                                <TableRow key={asset.name}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <asset.icon className="h-4 w-4 text-muted-foreground" />
                                        {asset.name}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{asset.level}</TableCell>
                                    <TableCell className="text-right font-mono">{asset.bots}</TableCell>
                                    <TableCell className="text-right font-mono text-amber-300">{asset.income.toLocaleString()}¢</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3} className="font-bold">Total Passive Income</TableCell>
                                <TableCell className="text-right font-bold font-mono text-amber-300">{totalPassiveIncome.toLocaleString()}¢</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
