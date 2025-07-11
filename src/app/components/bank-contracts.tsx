
'use client';

import { useState } from 'react';
import type { PlayerStats, PartnershipOffer } from '@/lib/types';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Handshake, TrendingUp, Loader2, FileSignature } from 'lucide-react';
import BankValueChart from './bank-value-chart';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { runBankPartnershipOfferGeneration } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FloatShareDialog = ({ onConfirm }: { onConfirm: (name: string, price: number) => void }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState(100);

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Float New Share on the Market</DialogTitle>
                <DialogDescription>As the owner of the Galactic Bank, you can issue new tradable shares for custom ventures.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div>
                    <Label htmlFor="share-name">Share/Company Name</Label>
                    <Input id="share-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Orion Mining Guild"/>
                </div>
                <div>
                    <Label htmlFor="share-price">Starting Price (¢)</Label>
                    <Input id="share-price" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <DialogClose asChild><Button onClick={() => onConfirm(name, price)} disabled={!name || price <= 0}>Confirm IPO</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    );
}

export default function BankContracts() {
    const { gameState, handleAcceptBankPartnerOffer, handleFloatShare } = useGame();
    const { toast } = useToast();
    const [offers, setOffers] = useState<PartnershipOffer[]>([]);
    const [isFetchingOffers, setIsFetchingOffers] = useState(false);
    const [isOffersDialogOpen, setIsOffersDialogOpen] = useState(false);
    const [isFloatShareDialogOpen, setIsFloatShareDialogOpen] = useState(false);

    if (!gameState || !gameState.playerStats.bankContract) return null;
    
    const { playerStats } = gameState;
    const { bankContract } = playerStats;

    const totalPartnerShare = bankContract.partners.reduce((acc, p) => acc + p.percentage, 0);
    const canAcceptMorePartners = totalPartnerShare < 1.0;
    const isSoleProprietor = bankContract.partners.length === 0;

    const handleFetchOffers = async () => {
        setIsFetchingOffers(true);
        try {
            const result = await runBankPartnershipOfferGeneration({ marketValue: bankContract.currentMarketValue });
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
        handleAcceptBankPartnerOffer(offer);
        setIsOffersDialogOpen(false);
    };

    const handleConfirmFloatShare = (name: string, price: number) => {
        handleFloatShare(name, price);
        setIsFloatShareDialogOpen(false);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Briefcase className="text-primary"/>
                    Bank Holdings & Partnerships
                </CardTitle>
                <CardDescription>Manage the ownership and value of your financial empire.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="h-4 w-4"/> Current Market Value</span>
                    <span className="font-mono text-amber-300">{bankContract.currentMarketValue.toLocaleString()}¢</span>
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Value Fluctuation (Last 20 Cycles)</p>
                    <BankValueChart valueHistory={bankContract.valueHistory} />
                </div>
                
                <div className="pt-4 border-t border-border/50"></div>
                 
                 <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2"><Handshake className="text-primary"/> Partnerships</h4>
                    <div className="p-4 rounded-lg bg-background/50 text-sm space-y-2">
                         {bankContract.partners.length > 0 ? (
                            bankContract.partners.map(partner => (
                                <div key={partner.name} className="flex justify-between items-center">
                                    <span className="text-muted-foreground">{partner.name}</span>
                                    <span className="font-mono text-primary">{partner.percentage * 100}% Stake</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center">You are the sole proprietor.</p>
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
                                        Several financial consortiums are interested in your bank. Review their offers carefully.
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
                    {isSoleProprietor && (
                        <Dialog open={isFloatShareDialogOpen} onOpenChange={setIsFloatShareDialogOpen}>
                            <DialogTrigger asChild>
                                 <Button variant="secondary" className="w-full mt-2">
                                    <FileSignature className="mr-2"/>
                                    Float New Share
                                </Button>
                            </DialogTrigger>
                            <FloatShareDialog onConfirm={handleConfirmFloatShare} />
                        </Dialog>
                    )}
                 </div>
            </CardContent>
        </Card>
    );
}
