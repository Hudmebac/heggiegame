'use client';
import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spade, Dice5, Gem, Trophy, Ticket, Loader2, Timer } from 'lucide-react';
import type { CasinoGameType } from '@/lib/types';
import CooldownTimer from './cooldown-timer';
import GambleAwarenessWarning from './gamble-awareness-warning';

const gameConfig: Record<
  CasinoGameType,
  {
    name: string;
    icon: React.ElementType;
    description: string;
    cooldown: number; // in seconds
    minStake: number;
    maxStake: number;
  }
> = {
  slots: {
    name: 'Slot Machine Zone',
    icon: Gem,
    description: 'Classic reels and themed video slots. Fast-paced fun with frequent, smaller payouts.',
    cooldown: 2,
    minStake: 10,
    maxStake: 1000,
  },
  table: {
    name: 'Table Games Area',
    icon: Dice5,
    description: 'Home to blackjack, roulette, and craps. A balanced risk for a solid reward.',
    cooldown: 5,
    minStake: 50,
    maxStake: 5000,
  },
  poker: {
    name: 'Poker Room',
    icon: Spade,
    description: 'A quieter, more strategic space for cash games. High skill, high reward.',
    cooldown: 5,
    minStake: 100,
    maxStake: 10000,
  },
  vip: {
    name: 'High-Limit VIP Room',
    icon: Trophy,
    description: 'Exclusive, high-stakes games for serious players. Big risks for massive payouts.',
    cooldown: 5,
    minStake: 10000,
    maxStake: 100000,
  },
  sportsbook: {
    name: 'Sportsbook Area',
    icon: Ticket,
    description: 'Place your bets on live galactic sports. A game of knowledge and luck.',
    cooldown: 5,
    minStake: 20,
    maxStake: 2000,
  },
  lottery: {
    name: 'Daily Lottery',
    icon: Ticket,
    description: 'One ticket, one chance per day to win a grand prize of 1000x your stake.',
    cooldown: 86400, // 24 hours
    minStake: 100,
    maxStake: 100,
  },
};

const GameCard = ({ gameType }: { gameType: CasinoGameType }) => {
  const { gameState, handlePlayCasinoGame } = useGame();
  const [stake, setStake] = useState(gameConfig[gameType].minStake);
  const [isLoading, setIsLoading] = useState(false);

  if (!gameState || !gameState.playerStats.casino) return null;

  const { name, icon: Icon, description, cooldown, minStake, maxStake } = gameConfig[gameType];
  const lastPlayed = gameState.playerStats.casino.lastPlayed[gameType] || 0;
  
  const isLottery = gameType === 'lottery';
  const isLotteryPlayed = isLottery && gameState.playerStats.casino.dailyLotteryTicketPurchased;
  
  const canAfford = gameState.playerStats.netWorth >= stake;
  const isCooldownActive = Date.now() < lastPlayed + cooldown * 1000;
  const isDisabled = isLoading || isCooldownActive || !canAfford || isLotteryPlayed;

  const handlePlay = async () => {
    setIsLoading(true);
    await handlePlayCasinoGame(gameType, stake);
    setIsLoading(false);
  };

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setStake(Math.max(minStake, Math.min(maxStake, value)));
    }
  }

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Icon className="text-primary" />{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`${gameType}-stake`}>Stake (Min: {minStake.toLocaleString()}¢, Max: {maxStake.toLocaleString()}¢)</Label>
          <Input 
            id={`${gameType}-stake`}
            type="number" 
            value={stake} 
            onChange={handleStakeChange}
            min={minStake}
            max={maxStake}
            step={minStake}
            disabled={isLoading || isLottery}
          />
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
        <GameCard gameType="vip" />
        <GameCard gameType="sportsbook" />
        <GameCard gameType="lottery" />
      </div>
    </div>
  );
}
