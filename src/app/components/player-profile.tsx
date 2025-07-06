'use client';

import type { PlayerStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Fuel, Warehouse, Shield, BadgeCheck, Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface PlayerProfileProps {
  stats: PlayerStats;
  onGenerateAvatar: () => void;
  isGeneratingAvatar: boolean;
}

const StatDisplay = ({ icon, title, value, max, unit, progressColorClass }: { icon: React.ReactNode, title: string, value: number, max: number, unit: string, progressColorClass: string }) => (
  <div>
    <div className="flex justify-between items-center mb-1 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        {icon}
        <span>{title}</span>
      </div>
      <span className="font-mono text-foreground">{value} / {max}{unit}</span>
    </div>
    <Progress value={(value / max) * 100} className="h-2 [&>div]:bg-gradient-to-r" indicatorClassName={progressColorClass} />
  </div>
);

export default function PlayerProfile({ stats, onGenerateAvatar, isGeneratingAvatar }: PlayerProfileProps) {
  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-headline">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rocket text-primary"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.33-.04-3.08.66-.25 1.37-.19 2.04.04.67.23 1.34.64 2 1.04.46.27.99.41 1.5.41.92 0 1.76-.43 2.5-1.11.74-.68 1.15-1.59 1.15-2.59s-.41-1.91-1.15-2.59c-.74-.68-1.58-1.11-2.5-1.11a3.42 3.42 0 0 0-1.5.41c-.66.4-1.33.81-2 1.04.67.23 1.37.19 2.04.04.74-.29 1.42-1.83 1.42-2.82s-.31-2.33-1-3c-1.39-1.39-4.2-2-5-2s-3.61.61-5 2c-.69.67-1 2-1 3s.68 2.53 1.42 2.82c.67.23 1.37.19 2.04.04-.75.75-.79 2.24-.04 3.08Z"/></svg>
            Ship & Captain
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
            <div className="relative h-24 w-24 rounded-full border-2 border-primary/50 overflow-hidden shadow-lg">
                <Image 
                    src={stats.avatarUrl} 
                    alt="Player Avatar"
                    data-ai-hint="space captain"
                    width={96}
                    height={96}
                    className="object-cover"
                />
            </div>
            <Button onClick={onGenerateAvatar} disabled={isGeneratingAvatar} size="sm" variant="outline">
                {isGeneratingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate New Avatar
            </Button>
        </div>

        <StatDisplay 
          icon={<Fuel className="h-4 w-4 text-amber-400" />}
          title="Fuel"
          value={stats.fuel}
          max={stats.maxFuel}
          unit=" SU"
          progressColorClass="from-amber-500 to-orange-500"
        />
        <StatDisplay 
          icon={<Warehouse className="h-4 w-4 text-sky-400" />}
          title="Cargo"
          value={stats.cargo}
          max={stats.maxCargo}
          unit="t"
          progressColorClass="from-sky-500 to-cyan-500"
        />
         <div className="flex justify-between items-center text-sm">
           <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4 text-green-400" />
              <span>Insurance</span>
           </div>
            <span className={`font-mono text-sm flex items-center gap-1.5 ${stats.insurance ? 'text-green-400' : 'text-red-500'}`}>
                {stats.insurance ? <BadgeCheck className="h-4 w-4" /> : null}
                {stats.insurance ? 'Active' : 'Inactive'}
            </span>
        </div>
      </CardContent>
    </Card>
  );
}
