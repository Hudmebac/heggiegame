
'use client';

import type { LeaderboardEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Ship } from 'lucide-react';
import { cn } from '@/lib/utils';


interface LeaderboardProps {
  data: LeaderboardEntry[];
  playerName: string;
  onTraderClick?: (trader: LeaderboardEntry) => void;
}

export default function Leaderboard({ data, playerName, onTraderClick }: LeaderboardProps) {
  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
            <Trophy className="text-primary"/>
            Global Leaderboard
        </CardTitle>
        <CardDescription>Top traders by net worth and fleet size. Click on a rival for intel.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[50px] text-center">Rank</TableHead>
                <TableHead>Trader</TableHead>
                <TableHead className="text-right">Net Worth</TableHead>
                <TableHead className="text-right w-[100px]">Fleet Size</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map(entry => {
                const isPlayer = entry.trader === playerName;
                return (
                    <TableRow 
                    key={entry.rank} 
                    className={cn(
                        isPlayer ? 'bg-primary/10' : 'hover:bg-muted/50',
                        !isPlayer && onTraderClick && 'cursor-pointer'
                    )}
                    onClick={() => !isPlayer && onTraderClick && onTraderClick(entry)}
                    >
                    <TableCell className="font-medium font-mono text-center">{entry.rank}</TableCell>
                    <TableCell>{entry.trader}</TableCell>
                    <TableCell className="text-right font-mono text-amber-300">
                        {new Intl.NumberFormat('en-US').format(entry.netWorth)} ¢
                    </TableCell>
                    <TableCell className="text-right font-mono text-sky-300 flex items-center justify-end gap-2">
                        <Ship className="h-4 w-4" />
                        {entry.fleetSize}
                    </TableCell>
                    </TableRow>
                )
                })}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
