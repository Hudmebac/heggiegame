
'use client';
import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins, Trophy, Handshake, Briefcase, Martini, Home, Landmark, Factory, Building2, Ticket, Heart, Shield, Package, LucideIcon, User, Bot, RefreshCw, PenSquare, Share2, ScrollText, Edit, Copy, TrendingUp } from 'lucide-react';
import { barThemes } from '@/lib/bar-themes';
import { residenceThemes } from '@/lib/residence-themes';
import { commerceThemes } from '@/lib/commerce-themes';
import { industryThemes } from '@/lib/industry-themes';
import { constructionThemes } from '@/lib/construction-themes';
import { recreationThemes } from '@/lib/recreation-themes';
import { bankThemes } from '@/lib/bank-themes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { calculateCargoValue, calculateShipValue } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CAREER_DATA } from '@/lib/careers';
import ChangeCareerDialog from '../components/change-career-dialog';
import FactionDialog from '../components/faction-dialog';
import { FACTIONS_DATA } from '@/lib/factions';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { AVATARS } from '@/lib/avatars';
import ShareProgressDialog from '@/app/components/share-progress-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import WhatsAppIcon from '@/app/components/icons/whatsapp-icon';
import CooldownTimer from '@/app/components/cooldown-timer';
import AssetOverviewChartCompact from '../components/asset-overview-chart-compact';

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

function PlayerProfile() {
    const { gameState, isGeneratingBio, handleGenerateBio, setPlayerName, setPlayerBio, handleSetAvatar, handleResetGame, handleShareToFacebook, handleShareToWhatsapp } = useGame();
    const [isEditingName, setIsEditingName] = useState(false);
    const [name, setName] = useState(gameState?.playerStats.name || '');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bio, setBio] = useState(gameState?.playerStats.bio || '');
    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [isFBConsentOpen, setIsFBConsentOpen] = useState(false);
    const { toast } = useToast();

    if (!gameState) return null;

    const { playerStats } = gameState;

    const handleNameSave = () => {
        setPlayerName(name);
        setIsEditingName(false);
    };

    const handleBioSave = () => {
        setPlayerBio(bio);
        setIsEditingBio(false);
    }

    const handleAvatarSelect = (avatarUrl: string) => {
        handleSetAvatar(avatarUrl);
        setIsAvatarDialogOpen(false);
    };
    
    const shareText = `I'm playing HEGGIE - Space Game 🪐 I'm a ${playerStats.career}, and my net worth’s already a cosmic-sized ${playerStats.netWorth.toLocaleString()}¢. Think you can top that?\n\n🎮 Start your own adventure now: 🌍 https://heggiegame.netlify.app/captain\n\n💥 Use promo code STARTERBOOST for a boost of 100,000,000¢ — it’s my little gift to you.`;

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(shareText);
        toast({ title: 'Copied to Clipboard!', description: 'You can now paste this message into your post.' });
    };

    const onShareToWhatsapp = () => {
        handleShareToWhatsapp();
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
    };

    const now = Date.now();
    const fbCooldown = 5 * 60 * 1000;
    const whatsAppCooldown = 5 * 60 * 1000;

    const fbExpiry = (playerStats.lastFacebookShare || 0) + fbCooldown;
    const isFbOnCooldown = now < fbExpiry;

    const whatsAppExpiry = (playerStats.lastWhatsappShare || 0) + whatsAppCooldown;
    const isWhatsAppOnCooldown = now < whatsAppExpiry;

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsAvatarDialogOpen(true)} className="relative group">
                            <Image src={playerStats.avatarUrl} alt="Player Avatar" width={80} height={80} className="rounded-full border-2 border-primary/50" />
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <PenSquare className="text-white" />
                            </div>
                        </button>
                        <div>
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNameSave()} />
                                    <Button onClick={handleNameSave} size="sm">Save</Button>
                                </div>
                            ) : (
                                <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                                    {playerStats.name}
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditingName(true)}>
                                        <PenSquare className="h-4 w-4" />
                                    </Button>
                                </CardTitle>
                            )}
                            <CardDescription>Reputation: {playerStats.reputation.toFixed(0)}</CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-background/50 rounded-lg">
                    {isEditingBio ? (
                        <div className="space-y-2">
                            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="h-24" />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsEditingBio(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleBioSave}>Save Bio</Button>
                            </div>
                        </div>
                    ) : (
                         <p className="text-sm text-muted-foreground italic h-28 overflow-y-auto">{playerStats.bio}</p>
                    )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={handleGenerateBio} disabled={isGeneratingBio}>
                        {isGeneratingBio ? <Loader2 className="animate-spin"/> : <RefreshCw />}
                        New Bio
                    </Button>
                     <Button variant="outline" onClick={() => setIsEditingBio(true)} disabled={isEditingBio}>
                        <Edit /> Edit Bio
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <RefreshCw className="mr-2" />
                                Reset
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone. This will permanently delete your game progress and start a new game.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleResetGame}>Confirm Reset</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                 <div className="grid grid-cols-3 gap-2">
                    <Button variant="secondary" onClick={() => setIsShareDialogOpen(true)}>
                        <Share2 className="mr-2" /> Sync
                    </Button>
                     <AlertDialog open={isFBConsentOpen} onOpenChange={setIsFBConsentOpen}>
                        <AlertDialogTrigger asChild>
                           <Button variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700" disabled={isFbOnCooldown}>
                                {isFbOnCooldown ? <CooldownTimer expiry={fbExpiry} /> : 'Share for 1M¢'}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Share to Facebook</AlertDialogTitle>
                                <AlertDialogDescription>Copy the message below and paste it into your Facebook post to receive 1,000,000 tokens!</AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="p-4 bg-muted rounded-md text-sm italic border">
                                {shareText}
                            </div>
                            <AlertDialogFooter className="w-full grid grid-cols-2 gap-2">
                                <Button onClick={handleCopyToClipboard}><Copy className="mr-2" /> Copy Text</Button>
                                <AlertDialogAction onClick={handleShareToFacebook} className="bg-blue-600 hover:bg-blue-700">Open Facebook</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="secondary" className="bg-green-600 text-white hover:bg-green-700" onClick={onShareToWhatsapp} disabled={isWhatsAppOnCooldown}>
                        {isWhatsAppOnCooldown ? <CooldownTimer expiry={whatsAppExpiry} /> : <><WhatsAppIcon className="mr-2" /> Share for 1M¢</>}
                    </Button>
                </div>
                 <div className="grid grid-cols-1">
                    <Button asChild variant="outline">
                        <Link href="/captain/history-events">
                            <ScrollText className="mr-2" />
                            History &amp; Progress
                        </Link>
                    </Button>
                </div>

                <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-muted-foreground">
                        <TrendingUp className="h-4 w-4"/>
                        Asset Overview
                    </div>
                    <AssetOverviewChartCompact assetHistory={playerStats.assetHistory || []} />
                </div>

            </CardContent>
             <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Select Your Avatar</DialogTitle>
                        <DialogDescription>Choose a new portrait to represent you in the galaxy.</DialogDescription>
                    </DialogHeader>
                    <Carousel opts={{ align: "start", loop: true }}>
                        <CarouselContent>
                            {AVATARS.map(avatar => (
                                <CarouselItem key={avatar} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
                                    <button onClick={() => handleAvatarSelect(avatar)} className="block w-full">
                                        <Image src={avatar} alt="Avatar option" width={128} height={128} className="rounded-lg border-2 border-transparent hover:border-primary transition-all" />
                                    </button>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </DialogContent>
            </Dialog>
            <ShareProgressDialog isOpen={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}/>
        </Card>
    );
}


export default function CaptainPage() {
  const { gameState, handlePurchaseInsurance } = useGame();
  const [isCareerChangeOpen, setIsCareerChangeOpen] = useState(false);
  const [isFactionDialogOpen, setIsFactionDialogOpen] = useState(false);

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
    { name: 'Commerce', icon: Briefcase, level: playerStats.commerceLevel, bots: playerStats.commerceAutoClickerBots, income: calculateIncome(playerStats.commerceLevel, playerStats.commerceAutoClickerBots, playerStats.commerceContract, commerceThemes) },
    { name: 'Industry', icon: Factory, level: playerStats.industryLevel, bots: playerStats.industryAutoClickerBots, income: calculateIncome(playerStats.industryLevel, playerStats.industryAutoClickerBots, playerStats.industryContract, industryThemes) },
    { name: 'Construction', icon: Building2, level: playerStats.constructionLevel, bots: playerStats.constructionAutoClickerBots, income: calculateIncome(playerStats.constructionLevel, playerStats.constructionAutoClickerBots, playerStats.constructionContract, constructionThemes) },
    { name: 'Recreation', icon: Ticket, level: playerStats.recreationLevel, bots: playerStats.recreationAutoClickerBots, income: calculateIncome(playerStats.recreationLevel, playerStats.recreationAutoClickerBots, playerStats.recreationContract, recreationThemes) },
  ];

  if (playerStats.bankEstablishmentLevel > 0) {
      portfolio.push({
          name: 'Galactic Bank',
          icon: Landmark,
          level: playerStats.bankLevel,
          bots: playerStats.bankAutoClickerBots,
          income: calculateIncome(playerStats.bankLevel, playerStats.bankAutoClickerBots, playerStats.bankContract, bankThemes)
      });
  }

  const totalPassiveIncome = portfolio.reduce((sum, item) => sum + item.income, 0);

  const activeShip = playerStats.fleet[0];
  const shipValue = activeShip ? calculateShipValue(activeShip) : 0;
  const cargoValue = calculateCargoValue(inventory, marketItems);
  const bankAccountValue = playerStats.bankAccount?.balance || 0;
  
  const totalNetWorth = playerStats.netWorth + shipValue + cargoValue + bankAccountValue;

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
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-2">
                <PlayerProfile />
            </div>
            <div className="space-y-6 xl:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center gap-2">
                                <Coins className="text-primary"/>
                                Finances
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Cash on Hand</span>
                                <span className="font-mono text-amber-300">{playerStats.netWorth.toLocaleString()} ¢</span>
                            </div>
                            <div className="flex justify-between items-center font-semibold pt-2 border-t mt-2">
                                <span className="text-foreground">Total Net Worth</span>
                                <span className="font-mono text-primary">{totalNetWorth.toLocaleString()} ¢</span>
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
                        <CardDescription>
                            Your standing is influenced by successful trades, completing missions, and your business dealings. A higher reputation unlocks better opportunities.
                        </CardDescription>
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
                             <Button className="w-full mt-4" variant="outline" onClick={() => setIsCareerChangeOpen(true)}>Change Career</Button>
                        </CardContent>
                    </Card>
                )}
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                            <Handshake className="text-primary"/>
                            Diplomacy
                        </CardTitle>
                        <CardDescription>
                            Your political allegiances and standing with the major galactic powers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Current Allegiance</span>
                            <span className={`font-mono font-bold`}>{playerStats.faction}</span>
                        </div>
                        <div>
                            <h4 className="text-xs text-muted-foreground mb-2">Faction Standings</h4>
                            <div className="space-y-2">
                                {FACTIONS_DATA.filter(f => f.id !== 'Independent').map(faction => {
                                    const rep = playerStats.factionReputation[faction.id] || 0;
                                    const repColor = rep > 0 ? 'text-green-400' : rep < 0 ? 'text-destructive' : 'text-muted-foreground';
                                    return (
                                        <div key={faction.id} className="flex justify-between items-center text-xs">
                                            <span>{faction.name}</span>
                                            <span className={cn('font-mono', repColor)}>{rep > 0 ? `+${rep}` : rep}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <Button className="w-full mt-2" variant="outline" onClick={() => setIsFactionDialogOpen(true)}>Manage Allegiance</Button>
                    </CardContent>
                </Card>
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
            <div className="xl:col-span-4">
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
                        <div className="overflow-x-auto">
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
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
        <ChangeCareerDialog isOpen={isCareerChangeOpen} onOpenChange={setIsCareerChangeOpen} />
        <FactionDialog isOpen={isFactionDialogOpen} onOpenChange={setIsFactionDialogOpen} />
    </div>
  );
}
