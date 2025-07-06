
'use client';

import type { PlayerStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, DollarSign, Handshake, TrendingUp } from 'lucide-react';
import BarValueChart from './bar-value-chart';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface BarContractsProps {
    playerStats: PlayerStats;
    onSell: () => void;
    onExpand: () => void;
    canAffordExpansion: boolean;
    expansionButtonLabel: string;
    nextExpansionTier: boolean;
}

const getEstablishmentLevelLabel = (level: number) => {
    if (level === 0) return 'Not Purchased';
    if (level === 1) return 'Purchased';
    if (level === 5) return 'Galactic Franchise';
    return `Expansion Level ${level - 1}`;
};

export default function BarContracts({ playerStats, onSell, onExpand, canAffordExpansion, expansionButtonLabel, nextExpansionTier }: BarContractsProps) {
    if (!playerStats.barContract) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Briefcase className="text-primary"/>
                    Establishment Contracts
                </CardTitle>
                <CardDescription>Manage ownership and strategic partnerships for this establishment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Establishment Level</span>
                    <span className="font-mono">{getEstablishmentLevelLabel(playerStats.establishmentLevel)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="h-4 w-4"/> Current Market Value</span>
                    <span className="font-mono text-amber-300">{playerStats.barContract.currentMarketValue.toLocaleString()}¢</span>
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Value Fluctuation (Last 20 Cycles)</p>
                    <BarValueChart valueHistory={playerStats.barContract.valueHistory} />
                </div>
                
                <div className="pt-4 border-t border-border/50"></div>
                
                <Button className="w-full" onClick={onExpand} disabled={!canAffordExpansion || !nextExpansionTier}>
                    {expansionButtonLabel}
                </Button>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">Sell Establishment</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to sell?</AlertDialogTitle>
                            <AlertDialogDescription>
                                You will sell the establishment for its current market value of {playerStats.barContract.currentMarketValue.toLocaleString()}¢. All bar levels, bot upgrades, and expansion progress will be lost. This action is irreversible.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onSell}>Confirm Sale</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <div className="pt-4 border-t border-border/50"></div>
                 
                 <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2"><Handshake className="text-primary"/> Partnerships</h4>
                    <div className="p-4 rounded-lg bg-background/50 text-center text-muted-foreground text-sm">
                        <p>You are the sole proprietor.</p>
                        <Button variant="link" disabled>Float to Partners (Coming Soon)</Button>
                    </div>
                 </div>

            </CardContent>
        </Card>
    );
}
