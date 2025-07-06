import type { Pirate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Swords, Shield, DollarSign, Scan, Skull, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';


interface PirateEncounterProps {
  pirate: Pirate;
  onAction: (action: 'fight' | 'evade' | 'bribe' | 'scan') => void;
  isResolving: boolean;
}

const threatColors = {
    'Low': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function PirateEncounter({ pirate, onAction, isResolving }: PirateEncounterProps) {
  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg shadow-red-500/10">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2 text-red-400">
          <Skull />
          Pirate Encounter!
        </CardTitle>
        <CardDescription>You've been intercepted by {pirate.name} in a {pirate.shipType}.</CardDescription>
        <div className="pt-2 flex items-center gap-4">
            <Badge variant="outline" className={threatColors[pirate.threatLevel]}>Threat: {pirate.threatLevel}</Badge>
            {isResolving && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="destructive" disabled={isResolving} onClick={() => onAction('fight')} className="bg-red-800/50 text-red-300 hover:bg-red-800/80 border border-red-500/30"><Swords className="mr-2 h-4 w-4" /> Fight</Button>
          <Button variant="outline" disabled={isResolving} onClick={() => onAction('evade')}><Shield className="mr-2 h-4 w-4 text-sky-400" /> Evade</Button>
          <Button variant="outline" disabled={isResolving} onClick={() => onAction('bribe')}><DollarSign className="mr-2 h-4 w-4 text-amber-400" /> Bribe</Button>
          <Button variant="outline" disabled={isResolving} onClick={() => onAction('scan')}><Scan className="mr-2 h-4 w-4 text-purple-400" /> Scan</Button>
        </div>
      </CardContent>
    </Card>
  );
}
