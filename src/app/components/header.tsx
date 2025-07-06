'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { PlayerStats } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { Coins, User, Rocket, LineChart, Map, ScrollText, Trophy, Sigma, Users, BookOpen, Martini } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const navItems = [
    { href: '/captain', label: 'Captain', icon: User },
    { href: '/ship', label: 'Ship', icon: Rocket },
    { href: '/crew', label: 'Crew', icon: Users },
    { href: '/market', label: 'Market', icon: LineChart },
    { href: '/galaxy', label: 'Galaxy', icon: Map },
    { href: '/bar', label: 'Bar', icon: Martini },
    { href: '/quests', label: 'Quests', icon: ScrollText },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/encyclopedia', label: 'Encyclopedia', icon: BookOpen },
];

const NavLink = ({ href, label, icon: Icon }: { href: string, label: string, icon: React.ElementType }) => {
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);
    return (
        <Link href={href}>
            <div className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted",
                isActive && "bg-muted text-foreground"
            )}>
                <Icon className="h-5 w-5" />
                <span>{label}</span>
            </div>
        </Link>
    );
};

export default function Header({ playerStats }: {playerStats: PlayerStats}) {
  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b">
          <div className="flex items-center gap-3">
            <HeggieIcon />
            <h1 className="text-xl md:text-2xl font-bold text-slate-200 font-headline tracking-wider">
              HEGGIE
            </h1>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 p-2 rounded-lg bg-card/50 border border-border">
            <div className="flex items-center gap-2 font-mono">
              <Coins className="h-5 w-5 text-amber-400" />
              <span className="text-lg font-semibold text-slate-200">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 0 }).format(playerStats.netWorth).replace('$', '¢')}
              </span>
            </div>
             <div className="hidden sm:flex items-center gap-2 font-mono text-slate-300">
                <Sigma className="h-5 w-5 text-cyan-400" />
                <span>Net Worth</span>
            </div>
          </div>
      </header>

      <nav className="p-4 space-y-2">
        {navItems.map(item => <NavLink key={item.href} {...item} />)}
      </nav>
    </div>
  );
}
