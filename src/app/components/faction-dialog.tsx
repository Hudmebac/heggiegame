
'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { FACTIONS_DATA } from '@/lib/factions';
import type { FactionId, PlayerStats } from '@/lib/types';
import type { Faction } from '@/lib/factions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, AlertTriangle, LucideIcon, Coins, Handshake } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


interface FactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const FACTION_JOIN_COST = 50000;

export default function FactionDialog({ isOpen, onOpenChange }: FactionDialogProps) {
    const { gameState, handleJoinFaction } = useGame();
    
    if (!gameState) return null;

    const { playerStats } = gameState;
    const canAfford = playerStats.netWorth >= FACTION_JOIN_COST;

    const handleConfirmJoin = (factionId: FactionId) => {
        handleJoinFaction(factionId);
        onOpenChange(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Handshake className="text-primary"/>
                        Galactic Factions
                    </DialogTitle>
                    <DialogDescription>
                        Choose your allegiance. Joining a faction provides powerful perks but may alienate others. Changing allegiance costs {FACTION_JOIN_COST.toLocaleString()}¢.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh] p-1">
                    <div className="space-y-4 pr-4">
                    {FACTIONS_DATA.map((faction: Faction) => {
                        const Icon = faction.icon as LucideIcon;
                        const isCurrent = playerStats.faction === faction.id;
                        return (
                            <Card key={faction.id} className={cn("bg-card/50", isCurrent && "border-primary")}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="flex items-center gap-3 font-headline text-xl">
                                            <Icon className="h-6 w-6"/>
                                            {faction.name}
                                        </CardTitle>
                                        {isCurrent && <Badge>Current Allegiance</Badge>}
                                    </div>
                                    <CardDescription className="italic pt-1">{faction.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2 text-green-400">
                                            <CheckCircle className="h-4 w-4"/> Perks
                                        </h4>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                            {faction.perks.map((perk, i) => <li key={i}>{perk}</li>)}
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                         <h4 className="font-semibold flex items-center gap-2 text-orange-400">
                                            <AlertTriangle className="h-4 w-4"/> Risks
                                        </h4>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                            {faction.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                                        </ul>
                                    </div>
                                </CardContent>
                                <CardContent>
                                    {!isCurrent && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button className="w-full" disabled={!canAfford && faction.id !== 'Independent'}>
                                                    <Coins className="mr-2"/>
                                                    {faction.id === 'Independent' ? 'Declare Independence (Free)' : `Pledge Allegiance (${FACTION_JOIN_COST.toLocaleString()}¢)`}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Confirm Allegiance Change</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to align with {faction.name}? This will affect your standings with other factions and cost {faction.id === 'Independent' ? 0 : FACTION_JOIN_COST.toLocaleString()}¢. This action cannot be undone immediately.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleConfirmJoin(faction.id)}>Confirm</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
