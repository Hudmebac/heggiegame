
'use client';

import type { Pirate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Swords, Shield, DollarSign, Skull, Loader2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';


interface PirateEncounterProps {
  pirate: Pirate | null;
  onAction: (action: 'fight' | 'evade' | 'bribe') => void;
  isResolving: boolean;
}

const threatColors = {
    'Low': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Critical': 'bg-destructive/20 text-destructive border-destructive/30',
}

export default function PirateEncounter({ pirate, onAction, isResolving }: PirateEncounterProps) {
  if (!pirate) {
    return null;
  }

  return (
    <Dialog open={!!pirate} modal={true}>
        <DialogContent
            className="sm:max-w-sm"
            onInteractOutside={(e) => e.preventDefault()}
            hideCloseButton={true}
        >
            <Card className="bg-transparent border-0 shadow-none">
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2 text-destructive">
                    <Skull />
                    Pirate Encounter!
                    </CardTitle>
                    <CardDescription>You've been intercepted by {pirate.name} in a {pirate.shipType}.</CardDescription>
                    <div className="pt-2 flex items-center gap-4">
                        <Badge variant="outline" className={threatColors[pirate.threatLevel]}>Threat: {pirate.threatLevel}</Badge>
                        {isResolving && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {pirate.scanResult && (
                        <div className="p-3 rounded-md bg-background/50 border border-border/50 text-sm text-muted-foreground">
                            <p className="font-bold flex items-center gap-2 mb-2 text-foreground"><Info className="h-4 w-4 text-cyan-400" /> Tactical Scan:</p>
                            <p>{pirate.scanResult}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="destructive" disabled={isResolving} onClick={() => onAction('fight')}><Swords className="mr-2 h-4 w-4" /> Fight</Button>
                        <Button variant="outline" disabled={isResolving} onClick={() => onAction('evade')}><Shield className="mr-2 h-4 w-4 text-sky-400" /> Evade</Button>
                        <Button variant="outline" disabled={isResolving} onClick={() => onAction('bribe')}><DollarSign className="mr-2 h-4 w-4 text-amber-400" /> Bribe</Button>
                    </div>
                </CardContent>
            </Card>
        </DialogContent>
    </Dialog>
  );
}
