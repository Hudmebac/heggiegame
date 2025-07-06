import type { PlayerStats } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { Coins, Sigma } from 'lucide-react';

function HeggieIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10C35 10 30 25 30 35V65C30 75 35 90 50 90" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="text-primary/70" />
        <path d="M50 10C65 10 70 25 70 35V65C70 75 65 90 50 90" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="text-primary/70" />
        <path d="M30 50H70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="3" className="opacity-30" />
        <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="opacity-50" />
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
