
'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift, CreditCard, Sparkles, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const tokenPackages = [
    { price: '£5.00', tokens: 1_000_000_000, popular: false },
    { price: '£10.00', tokens: 10_000_000_000, popular: true },
    { price: '£15.00', tokens: 20_000_000_000, popular: false },
];

const subscriptionPackage = {
    price: '£5.00/month',
    initialTokens: 1_000_000_000,
    monthlyTokens: 20_000_000_000,
};

export default function GetTokensPage() {
    const { handleRedeemPromoCode } = useGame();
    const [promoCode, setPromoCode] = useState('');

    const onRedeem = () => {
        if(handleRedeemPromoCode) {
            handleRedeemPromoCode(promoCode);
            setPromoCode('');
        }
    };
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl"><Gift className="text-primary"/> Redeem Promo Code</CardTitle>
                    <CardDescription>Have a special code? Enter it here to receive your reward.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="w-full">
                        <Label htmlFor="promo-code">Promo Code</Label>
                        <Input 
                            id="promo-code"
                            placeholder="Enter your code" 
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        />
                    </div>
                    <Button onClick={onRedeem} className="w-full sm:w-auto">Redeem</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-xl"><CreditCard className="text-primary"/> Buy Tokens</CardTitle>
                    <CardDescription>Support the game and get a massive boost with these token packages.</CardDescription>
                     <div className="pt-4">
                        <div className="flex items-center gap-3 bg-yellow-900/20 border border-yellow-700/50 text-yellow-300 p-3 rounded-lg text-sm">
                            <AlertTriangle className="h-5 w-5"/>
                            <p>This is a UI demonstration. Stripe is not actually integrated, and these buttons will not process payments.</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-4">One-Time Purchases</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {tokenPackages.map((pkg) => (
                                <Card key={pkg.price} className="text-center">
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-mono text-amber-300 flex items-center justify-center gap-2">
                                            {pkg.tokens.toLocaleString()} <Sparkles className="h-5 w-5 opacity-70" />
                                        </CardTitle>
                                        <CardDescription>Tokens</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full">{pkg.price}</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <Separator />

                     <div>
                        <h3 className="font-semibold mb-4">Monthly Subscription</h3>
                        <Card className="text-center bg-card/50 border-primary/50">
                             <CardHeader>
                                <CardTitle className="text-2xl font-mono text-amber-300 flex items-center justify-center gap-2">
                                    {subscriptionPackage.monthlyTokens.toLocaleString()} <Sparkles className="h-5 w-5 opacity-70" />
                                </CardTitle>
                                <CardDescription>Tokens Per Month</CardDescription>
                                <p className="text-xs text-muted-foreground pt-2">+ {subscriptionPackage.initialTokens.toLocaleString()} initial bonus tokens!</p>
                            </CardHeader>
                             <CardContent>
                                <Button className="w-full" variant="secondary">{subscriptionPackage.price}</Button>
                            </CardContent>
                        </Card>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
