
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
 {
 price: '£5.00',
 tokens: 1_000_000_000,
 popular: false,
 url: 'https://buy.stripe.com/9B6eVde9e8YAgHz8zL93y03',
 },
 {
 price: '£10.00',
 tokens: 10_000_000_000,
 popular: true,
 url: 'https://buy.stripe.com/aFafZh5CI1w8bnfbLX93y02',
 },
 {
 price: '£15.00',
 tokens: 20_000_000_000,
 popular: false,
 url: 'https://buy.stripe.com/4gM6oH3uAdeQgHz03f93y01',
 },
];

const subscriptionPackage = {
 price: '£5.00/month',
 initialTokens: 1_000_000_000,
 monthlyTokens: 20_000_000_000,
 url: 'https://buy.stripe.com/4gMdR9ghm0s44YRaHT93y00',
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
 <a href={pkg.url} target="_blank" rel="noopener noreferrer">
 <Button className="w-full">{pkg.price}</Button>
 </a>
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
 <a href={subscriptionPackage.url} target="_blank" rel="noopener noreferrer">
 <Button className="w-full" variant="secondary">{subscriptionPackage.price}</Button>
 </a>
                            </CardContent>
                        </Card>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
