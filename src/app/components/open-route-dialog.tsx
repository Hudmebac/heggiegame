
'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import NegotiationMinigame from './negotiation-minigame';
import { runNegotiateTradeRoute } from '@/app/actions';
import { Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CooldownTimer from './cooldown-timer';

interface OpenRouteDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    route: { from: string; to: string } | null;
}

type NegotiationState = 'idle' | 'playing' | 'loading' | 'result';

export default function OpenRouteDialog({ isOpen, onOpenChange, route }: OpenRouteDialogProps) {
    const { gameState, handleOpenRoute, handleSetNegotiationCooldown } = useGame();
    const { toast } = useToast();
    
    const [negotiationState, setNegotiationState] = useState<NegotiationState>('idle');
    const [result, setResult] = useState<{ cost: number, narrative: string } | null>(null);
    const [triesLeft, setTriesLeft] = useState(3);

    if (!route || !gameState) return null;

    const routeKey = [route.from, route.to].sort().join('-');
    const cooldownExpiry = gameState.playerStats.negotiationCooldowns?.[routeKey] || 0;
    const isCoolingDown = Date.now() < cooldownExpiry;

    const handleNegotiationCommit = async (score: number) => {
        setNegotiationState('loading');
        try {
            const res = await runNegotiateTradeRoute({
                fromSystem: route.from,
                toSystem: route.to,
                negotiationScore: score,
            });
            setResult(res);
            setNegotiationState('result');
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Negotiation Failed", description: "Could not communicate with logistics officials." });
            setNegotiationState('idle');
        }
    };
    
    const handleTryAgain = () => {
        const newTries = triesLeft - 1;
        setTriesLeft(newTries);
        if (newTries > 0) {
            setResult(null);
            setNegotiationState('idle');
        } else {
            handleSetNegotiationCooldown(routeKey);
            onOpenChange(false);
            toast({ variant: 'destructive', title: "Negotiations Stalled", description: "You must wait 30 minutes before trying again for this route." });
        }
    };

    const handleAcceptDeal = () => {
        if (!result) return;
        handleOpenRoute(route.from, route.to, result.cost);
        onOpenChange(false);
    };
    
    const handleClose = () => {
        setNegotiationState('idle');
        setResult(null);
        setTriesLeft(3);
        onOpenChange(false);
    }
    
    const renderContent = () => {
        if (negotiationState === 'loading') {
            return <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto"/> <p className="mt-2 text-muted-foreground">Awaiting response from HEGGIE Logistics...</p></div>;
        }

        if (negotiationState === 'result' && result) {
            const canAfford = gameState.playerStats.netWorth >= result.cost;
            return (
                <div className="space-y-4 py-4 text-center">
                    <p className="text-muted-foreground italic">"{result.narrative}"</p>
                    <p className="font-bold text-lg">Proposed Cost: <span className="text-amber-300 font-mono">{result.cost.toLocaleString()}¢</span></p>
                    <div className="flex justify-center gap-4">
                        <Button variant="destructive" onClick={handleTryAgain} disabled={triesLeft <= 1}>Try Again ({triesLeft - 1} left)</Button>
                        <Button onClick={handleAcceptDeal} disabled={!canAfford}>
                            {canAfford ? 'Accept Deal' : 'Insufficient Funds'}
                        </Button>
                    </div>
                </div>
            );
        }
        
        return (
            <NegotiationMinigame 
                onCommit={handleNegotiationCommit}
                triesLeft={triesLeft}
                disabled={isCoolingDown}
            />
        )
    };


    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Negotiate New Trade Route: {route.from} <ArrowRight/> {route.to}
                    </DialogTitle>
                    <DialogDescription>
                        Establish a permanent trade route. A better negotiation leads to a lower establishment cost.
                    </DialogDescription>
                </DialogHeader>
                {isCoolingDown ? (
                     <div className="text-center p-8 text-destructive">
                        <p>Negotiations for this route are on hold.</p>
                        <p>Try again in: <CooldownTimer expiry={cooldownExpiry} /></p>
                    </div>
                ) : renderContent()}
            </DialogContent>
        </Dialog>
    );
}
