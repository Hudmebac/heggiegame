'use client';

import { useMemo } from 'react';
import type { GameEvent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Package, Briefcase, TrendingUp, TrendingDown, Star } from 'lucide-react';

interface HistorySummaryProps {
  events: GameEvent[];
  initialNetWorth: number;
}

export default function HistorySummary({ events, initialNetWorth }: HistorySummaryProps) {
  const stats = useMemo(() => {
    let missionsCompleted = 0;
    let tradesMade = 0;
    let shipsPurchased = 0;
    let highestNetWorth = initialNetWorth;
    let currentNetWorth = initialNetWorth;

    events.forEach(event => {
      if (event.type === 'Mission') missionsCompleted++;
      if (event.type === 'Trade') tradesMade++;
      if (event.type === 'Purchase' && event.description.includes('ship')) shipsPurchased++;
      
      currentNetWorth += event.value;
      if (currentNetWorth > highestNetWorth) {
        highestNetWorth = currentNetWorth;
      }
    });

    const totalProfit = events.filter(e => e.value > 0).reduce((sum, e) => sum + e.value, 0);
    const totalSpending = events.filter(e => e.value < 0).reduce((sum, e) => sum + e.value, 0);

    return { missionsCompleted, tradesMade, shipsPurchased, highestNetWorth, totalProfit, totalSpending };
  }, [events, initialNetWorth]);

  const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
    <div className="flex items-center gap-4 rounded-lg bg-background/50 p-3 border">
      <Icon className="h-8 w-8 text-primary/80 flex-shrink-0" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-bold font-mono">{value}</p>
      </div>
    </div>
  );

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
                <Star className="text-primary"/>
                Career Highlights
            </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={Briefcase} label="Missions" value={stats.missionsCompleted} />
            <StatCard icon={Package} label="Trades" value={stats.tradesMade} />
            <StatCard icon={Ship} label="Ships Purchased" value={stats.shipsPurchased} />
            <StatCard icon={TrendingUp} label="Highest Net Worth" value={`¢${stats.highestNetWorth.toLocaleString()}`} />
            <StatCard icon={TrendingUp} label="Total Profit" value={`¢${stats.totalProfit.toLocaleString()}`} />
            <StatCard icon={TrendingDown} label="Total Spending" value={`¢${stats.totalSpending.toLocaleString()}`} />
        </CardContent>
    </Card>
  );
}
