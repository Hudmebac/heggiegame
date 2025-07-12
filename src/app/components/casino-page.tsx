
'use client';
import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Spade, Dice5, Gem, Trophy, Ticket, Loader2, Timer, Info, Rocket, Circle, Globe } from 'lucide-react';
import type { CasinoGameType } from '@/lib/types';
import CooldownTimer from './cooldown-timer';
import GambleAwarenessWarning from './gamble-awareness-warning';
import { useToast } from '@/hooks/use-toast';

const gameConfig: Record<
  CasinoGameType,
  {
    name: string;
    icon: React.ElementType;
    description: string;
    cooldown: number; // in seconds
    minStake: number;
    maxStake: number;
    winChance: number;
    payoutMin: number;
    payoutMax: number;
  }
> = {
  slots: {
    name: 'Slot Machine Zone',
    icon: Gem,
    description: 'Classic reels and themed video slots. Fast-paced fun with frequent, smaller payouts.',
    cooldown: 2,
    minStake: 10,
    maxStake: 1000,
    winChance: 0.75, payoutMin: 2, payoutMax: 5,
  },
  table: {
    name: 'Table Games Area',
    icon: Dice5,
    description: 'Home to blackjack, roulette, and craps. A balanced risk for a solid reward.',
    cooldown: 5,
    minStake: 50,
    maxStake: 5000,
    winChance: 0.5, payoutMin: 1.5, payoutMax: 15,
  },
  poker: {
    name: 'Poker Room',
    icon: Spade,
    description: 'A quieter, more strategic space for cash games. High skill, high reward.',
    cooldown: 5,
    minStake: 100,
    maxStake: 10000,
    winChance: 0.5, payoutMin: 1.5, payoutMax: 15,
  },
  vip: {
    name: 'High-Limit VIP Room',
    icon: Trophy,
    description: 'Exclusive, high-stakes games for serious players. Big risks for massive payouts.',
    cooldown: 5,
    minStake: 10000,
    maxStake: 100000,
    winChance: 0.3, payoutMin: 1.5, payoutMax: 20,
  },
  sportsbook: {
    name: 'Sportsbook Area',
    icon: Ticket,
    description: 'Place your bets on live galactic sports. A game of knowledge and luck.',
    cooldown: 5,
    minStake: 20,
    maxStake: 2000,
    winChance: 0.45, payoutMin: 1.5, payoutMax: 30,
  },
  lottery: {
    name: 'Daily Lottery',
    icon: Ticket,
    description: 'One ticket, one chance per day to win a grand prize of 1000x your stake.',
    cooldown: 86400, // 24 hours
    minStake: 100,
    maxStake: 100,
    winChance: 0.02, payoutMin: 10000, payoutMax: 10000,
  },
  droneRacing: {
    name: 'Drone Racing Circuit',
    icon: Rocket,
    description: 'Bet on high-speed drone races through treacherous courses. High-octane, high-payout action.',
    cooldown: 15,
    minStake: 200,
    maxStake: 20000,
    winChance: 0.4, payoutMin: 2, payoutMax: 25,
  },
  spaceRoulette: {
    name: 'Space Roulette',
    icon: Circle,
    description: 'A zero-G variant of roulette with more betting options and chaotic results.',
    cooldown: 10,
    minStake: 100,
    maxStake: 15000,
    winChance: 0.48, payoutMin: 1.2, payoutMax: 35,
  },
  gravityWorldCup: {
    name: 'Gravity World Cup',
    icon: Globe,
    description: 'Place long-shot bets on the galactic premier zero-G sporting event. Huge potential payouts.',
    cooldown: 60,
    minStake: 500,
    maxStake: 50000,
    winChance: 0.25, payoutMin: 5, payoutMax: 50,
  },
};

const GameCard = ({ gameType }: { gameType: CasinoGameType }) => {
  const { gameState, handlePlayCasinoGame } = useGame();
  const { toast } = useToast();
  const [stake, setStake] = useState(gameConfig[gameType].minStake);
  const [isLoading, setIsLoading] = useState(false);

  if (!gameState || !gameState.playerStats.casino) return null;

  const { name, icon: Icon, description, cooldown, minStake, maxStake, payoutMin, payoutMax } = gameConfig[gameType];
  const lastPlayed = gameState.playerStats.casino.lastPlayed[gameType] || 0;
  
  const isLottery = gameType === 'lottery';
  const isLotteryPlayed = isLottery && gameState.playerStats.casino.dailyLotteryTicketPurchased;
  
  const canAfford = gameState.playerStats.netWorth >= stake;
  const isCooldownActive = Date.now() < lastPlayed + cooldown * 1000;
  const isDisabled = isLoading || isCooldownActive || !canAfford || isLotteryPlayed;
  
  const effectiveMaxStake = Math.min(maxStake, gameState.playerStats.netWorth);

  const handlePlay = async () => {
    setIsLoading(true);
    await handlePlayCasinoGame(gameType, stake);
    setIsLoading(false);
  };

  const handleShowInfo = () => {
    toast({
      title: `${name} Payouts`,
      description: `Winnings are calculated as your stake multiplied by a random number between ${payoutMin.toFixed(1)}x and ${payoutMax.toFixed(1)}x. Good luck!`,
      duration: 5000,
    });
  };

  const handleStakeChange = (value: number) => {
    setStake(Math.max(minStake, Math.min(effectiveMaxStake, value)));
  }

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-2"><Icon className="text-primary" />{name}</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleShowInfo}>
                <Info className="h-4 w-4 text-muted-foreground" />
            </Button>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`${gameType}-stake`}>Stake (Min: {minStake.toLocaleString()}¢, Max: {maxStake.toLocaleString()}¢)</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input 
              id={`${gameType}-stake`}
              type="number" 
              value={stake} 
              onChange={(e) => handleStakeChange(parseInt(e.target.value, 10) || minStake)}
              min={minStake}
              max={effectiveMaxStake}
              step={minStake}
              disabled={isLoading || isLottery}
              className="w-full"
            />
            <Button variant="outline" size="sm" onClick={() => handleStakeChange(minStake)} disabled={isLottery}>Min</Button>
            <Button variant="outline" size="sm" onClick={() => handleStakeChange(effectiveMaxStake)} disabled={isLottery}>Max</Button>
          </div>
          {!isLottery && (
            <Slider
                value={[stake]}
                onValueChange={(value) => handleStakeChange(value[0])}
                min={minStake}
                max={effectiveMaxStake}
                step={Math.max(10, Math.round((effectiveMaxStake-minStake)/100))}
                className="mt-3"
                disabled={isLoading}
            />
          )}
        </div>
        <Button className="w-full" onClick={handlePlay} disabled={isDisabled}>
          {isLoading && <Loader2 className="mr-2 animate-spin" />}
          {isLottery ? (isLotteryPlayed ? 'Ticket Purchased' : 'Buy Lottery Ticket') : 'Play'}
        </Button>
      </CardContent>
      <CardFooter>
        {isCooldownActive && !isLotteryPlayed ? (
          <div className="text-sm text-muted-foreground w-full text-center flex items-center justify-center gap-2">
            <Timer className="h-4 w-4" />
            Cooldown: <CooldownTimer expiry={lastPlayed + cooldown * 1000} />
          </div>
        ) : (
           <p className="text-sm text-green-400/80 w-full text-center">{isLotteryPlayed ? "Come back tomorrow!" : "Ready to play"}</p>
        )}
      </CardFooter>
    </Card>
  );
};


export default function CasinoPage() {
  return (
    <div className="space-y-6">
      <GambleAwarenessWarning />
      <div>
        <h2 className="text-2xl font-headline text-slate-200 tracking-wider">The Casino Floor</h2>
        <p className="text-muted-foreground">Fortune favors the bold. Place your stakes and see what fate has in store.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GameCard gameType="slots" />
        <GameCard gameType="table" />
        <GameCard gameType="poker" />
        <GameCard gameType="droneRacing" />
        <GameCard gameType="spaceRoulette" />
        <GameCard gameType="sportsbook" />
        <GameCard gameType="gravityWorldCup" />
        <GameCard gameType="vip" />
        <GameCard gameType="lottery" />
      </div>
    </div>
  );
}
