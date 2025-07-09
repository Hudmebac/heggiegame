
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skull, Shield, Star, Landmark, Heart, Briefcase, AlertTriangle, Package } from 'lucide-react';

const difficultyLevels = [
    {
        icon: Star,
        title: 'Easy',
        description: 'A more relaxed experience. Pirate encounters are less frequent and less dangerous. Perfect for learning the ropes.',
    },
    {
        icon: Shield,
        title: 'Medium',
        description: 'The standard HEGGIE experience. A balanced challenge with moderate risks and rewards.',
    },
    {
        icon: Skull,
        title: 'Hard',
        description: 'A tough challenge for veteran traders. Pirate activity is high, and threats are more severe.',
    }
];

export default function GameplayCodex() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">Difficulty Levels</CardTitle>
                    <CardDescription>The challenge of the galaxy can be adjusted when starting a new game.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {difficultyLevels.map(level => (
                        <div key={level.title} className="border p-4 rounded-lg bg-background/30">
                            <h4 className="font-bold text-base text-primary flex items-center gap-2"><level.icon className="h-5 w-5"/> {level.title}</h4>
                            <p className="text-sm text-muted-foreground mt-2">{level.description}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Skull className="text-destructive"/>Hardcore Mode</CardTitle>
                    <CardDescription>A special mode for the ultimate challenge, featuring permadeath.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">In Hardcore mode, the stakes are as high as they get. If your ship is destroyed for any reason, your journey ends permanently. Your save file is deleted, and you must start a new game from scratch. There are no rebirths or second chances. This mode is for veteran traders who are ready to put everything on the line.</p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Landmark className="text-primary"/>Financial Systems</CardTitle>
                    <CardDescription>Leverage advanced financial tools, but beware the risks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-bold text-base flex items-center gap-2">Loans</h4>
                        <p className="text-sm text-muted-foreground">Secure capital by taking out a loan from the Galactic Bank. You can borrow up to 100 times your current net worth. All loans have a 10% interest rate and are paid back over a set number of installments. You can repay early for a preferential rate.</p>
                    </div>
                     <div>
                        <h4 className="font-bold text-base flex items-center gap-2">Credit Cards</h4>
                        <p className="text-sm text-muted-foreground">Apply for a line of credit worth up to 50 times your net worth. This provides flexible access to funds, but the entire balance must be cleared within a set time period after your first withdrawal.</p>
                    </div>
                     <div>
                        <h4 className="font-bold text-base flex items-center gap-2"><AlertTriangle className="text-destructive"/> Debt & Bankruptcy</h4>
                        <p className="text-sm text-muted-foreground">Failing to make loan repayments or clear your credit card balance will result in accumulating debt. This debt will slowly grow with interest. If your total debt exceeds <span className="font-mono text-amber-300">100,000¢</span>, you will be declared bankrupt, and your game will end.</p>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Briefcase className="text-primary"/>Insurance Policies</CardTitle>
                    <CardDescription>One-time premium payments to protect your assets.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-bold text-base flex items-center gap-2"><Heart className="h-4 w-4"/> Health Insurance</h4>
                        <p className="text-sm text-muted-foreground">In standard modes, this policy allows you to retain 50% of your net worth upon rebirth after ship destruction. This policy is unavailable in Hardcore mode.</p>
                    </div>
                     <div>
                        <h4 className="font-bold text-base flex items-center gap-2"><Shield className="h-4 w-4"/> Ship Insurance</h4>
                        <p className="text-sm text-muted-foreground">Reduces all repair costs by 50%. In standard modes, your ship is also returned to you upon rebirth.</p>
                    </div>
                     <div>
                        <h4 className="font-bold text-base flex items-center gap-2"><Package className="h-4 w-4"/> Cargo Insurance</h4>
                        <p className="text-sm text-muted-foreground">Allows you to recover a percentage of your cargo's value if it is lost to pirates or upon rebirth (in standard modes).</p>
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
