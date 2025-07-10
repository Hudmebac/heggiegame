
'use client';

import { useState } from 'react';
import type { PlayerStats, PartnershipOffer } from '@/lib/types';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Handshake, TrendingUp, Loader2 } from 'lucide-react';
import CommerceValueChart from './commerce-value-chart';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { runCommercePartnershipOfferGeneration } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

interface CommerceContractsProps {
    playerStats: PlayerStats;
    onSell: () => void;
    onExpand: () => void;
    canAffordExpansion: boolean;
    expansionButtonLabel: string;
    nextExpansionTier: boolean;
}

const getEstablishmentLevelLabel = (level: number) => {
    if (level === 0) return 'Not Purchased';
    if (level === 1) return 'Licensed';
    if (level === 5) return 'Galactic Conglomerate';
    return `Expansion Tier ${level - 1}`;
};

export default function CommerceContracts({ playerStats, onSell, onExpand, canAffordExpansion, expansionButtonLabel, nextExpansionTier }: CommerceContractsProps) {
    const { handleAcceptCommercePartnerOffer } = useGame();
    const { toast } = useToast();
    const [offers, setOffers] = useState<PartnershipOffer[]>([]);
    const [isFetchingOffers, setIsFetchingOffers] = useState(false);
    const [isOffersDialogOpen, setIsOffersDialogOpen] = useState(false);

    if (!playerStats.commerceContract) return null;

    const totalPartnerShare = playerStats.commerceContract.partners.reduce((acc, p) => acc + p.percentage, 0);
    const canAcceptMorePartners = totalPartnerShare < 1.0;

    const handleFetchOffers = async () => {
        setIsFetchingOffers(true);
        try {
            const result = await runCommercePartnershipOfferGeneration({ marketValue: playerStats.commerceContract!.currentMarketValue });
            setOffers(result.offers);
            setIsOffersDialogOpen(true);
        } catch (error) {
            console.error("Failed to fetch partnership offers:", error);
            toast({
                variant: "destructive",
                title: "Network Error",
                description: "Could not retrieve partnership offers at this time.",
            });
        } finally {
            setIsFetchingOffers(false);
        }
    };
    
    const handleOfferAccepted = (offer: PartnershipOffer) => {
        handleAcceptCommercePartnerOffer(offer);
        setIsOffersDialogOpen(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Briefcase className="text-primary"/>
                    Commerce Hub Contracts
                </CardTitle>
                <CardDescription>Manage ownership and strategic partnerships for this commerce hub.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Hub Level</span>
                    <span className="font-mono">{getEstablishmentLevelLabel(playerStats.commerceEstablishmentLevel)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="h-4 w-4"/> Current Market Value</span>
                    <span className="font-mono text-amber-300">{playerStats.commerceContract.currentMarketValue.toLocaleString()}¢</span>
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Value Fluctuation (Last 20 Cycles)</p>
                    <CommerceValueChart valueHistory={playerStats.commerceContract.valueHistory} />
                </div>
                
                <div className="pt-4 border-t border-border/50"></div>
                
                <Button className="w-full" onClick={onExpand} disabled={!canAffordExpansion || !nextExpansionTier}>
                    {expansionButtonLabel}
                </Button>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">Liquidate Assets</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to liquidate?</AlertDialogTitle>
                            <AlertDialogDescription>
                                You will sell the commerce hub for its current market value of {playerStats.commerceContract.currentMarketValue.toLocaleString()}¢. All levels, bot hires, and expansion progress will be lost. This action is irreversible.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onSell}>Confirm Liquidation</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <div className="pt-4 border-t border-border/50"></div>
                 
                 <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2"><Handshake className="text-primary"/> Partnerships</h4>
                    <div className="p-4 rounded-lg bg-background/50 text-sm space-y-2">
                         {playerStats.commerceContract.partners.length > 0 ? (
                            playerStats.commerceContract.partners.map(partner => (
                                <div key={partner.name} className="flex justify-between items-center">
                                    <span className="text-muted-foreground">{partner.name}</span>
                                    <span className="font-mono text-primary">{partner.percentage * 100}% Stake</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center">You hold all commercial rights.</p>
                        )}
                    </div>
                    {canAcceptMorePartners && (
                         <Dialog open={isOffersDialogOpen} onOpenChange={setIsOffersDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full mt-2" onClick={handleFetchOffers} disabled={isFetchingOffers}>
                                    {isFetchingOffers ? <Loader2 className="mr-2 animate-spin" /> : null}
                                    Seek Investors
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Investment Opportunities</DialogTitle>
                                    <DialogDescription>
                                        Several factions have expressed interest in acquiring a stake in your commerce hub. Review their offers carefully.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                                    {offers.map(offer => (
                                        <Card key={offer.partnerName} className="bg-card/50">
                                            <CardHeader>
                                                <CardTitle className="text-base text-primary">{offer.partnerName}</CardTitle>
                                                <CardDescription>{offer.dealDescription}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex justify-between items-center">
                                                <div className="space-y-1 text-sm">
                                                    <p>Stake: <span className="font-mono font-bold">{(offer.stakePercentage * 100).toFixed(0)}%</span></p>
                                                    <p>Offer: <span className="font-mono font-bold text-amber-300">{offer.cashOffer.toLocaleString()}¢</span></p>
                                                </div>
                                                <Button onClick={() => handleOfferAccepted(offer)}>Accept Deal</Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                 </div>

            </CardContent>
        </Card>
    );
}
