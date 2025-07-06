import type { PlayerStats } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { Coins, Sigma } from 'lucide-react';

interface HeaderProps {
  playerStats: PlayerStats;
}

function HeggieIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
      <path d="M50 10L60 30L80 35L70 50L75 70L50 60L25 70L30 50L20 35L40 30L50 10Z" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      <path d="M50 40L55 50L65 52L57.5 57.5L60 65L50 60L40 65L42.5 57.5L35 52L45 50L50 40Z" fill="currentColor" />
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="5" strokeDasharray="10 5" />
    </svg>
  );
}


export default function Header({ playerStats }: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <HeggieIcon />
        <h1 className="text-2xl md:text-3xl font-bold text-slate-200 font-headline tracking-wider">
          HEGGIE
        </h1>
        <Badge variant="outline" className="border-accent text-accent font-mono text-xs">
          Hegg Interstellar Exchange
        </Badge>
      </div>
      <div className="flex items-center gap-4 sm:gap-6 p-2 rounded-lg bg-card/50 border border-border">
        <div className="flex items-center gap-2 font-mono">
          <Coins className="h-5 w-5 text-amber-400" />
          <span className="text-lg font-semibold text-slate-200">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 0 }).format(playerStats.netWorth).replace('$', '¢')}
          </span>
        </div>
        <div className="w-px h-6 bg-border"></div>
        <div className="flex items-center gap-2 font-mono text-slate-300">
          <Sigma className="h-5 w-5 text-cyan-400" />
          <span>Net Worth</span>
        </div>
      </div>
    </header>
  );
}
