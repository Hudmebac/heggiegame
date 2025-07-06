import type { LeaderboardEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy } from 'lucide-react';

interface LeaderboardProps {
  data: LeaderboardEntry[];
  playerName: string;
}

export default function Leaderboard({ data, playerName }: LeaderboardProps) {
  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
            <Trophy className="text-primary"/>
            Global Leaderboard
        </CardTitle>
        <CardDescription>Top traders by net worth.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Trader</TableHead>
              <TableHead className="text-right">Net Worth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(entry => (
              <TableRow key={entry.rank} className={entry.trader === playerName ? 'bg-primary/10' : ''}>
                <TableCell className="font-medium font-mono text-center">{entry.rank}</TableCell>
                <TableCell>{entry.trader}</TableCell>
                <TableCell className="text-right font-mono text-amber-300">
                  {new Intl.NumberFormat('en-US').format(entry.netWorth)} ¢
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
