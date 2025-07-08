
'use client';

import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Package, Coins, ArrowRight, AlertTriangle, CheckCircle, Hourglass, Loader2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function HaulerPage() {
    const { gameState, handleGenerateContracts, handleAcceptContract, isGeneratingContracts } = useGame();

    if (!gameState) return null;

    const { playerStats } = gameState;
    const { tradeContracts = [] } = playerStats;

    const availableContracts = tradeContracts.filter(c => c.status === 'Available');
    const activeContracts = tradeContracts.filter(c => c.status === 'Active');

    const riskColorMap = {
        'Low': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Truck className="text-primary" />
                        Hauler Contracts
                    </CardTitle>
                    <CardDescription>
                        Manage your logistics empire. Find lucrative trade routes, accept contracts, and ensure timely delivery to build your reputation and wealth.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGenerateContracts} disabled={isGeneratingContracts}>
                        {isGeneratingContracts ? <Loader2 className="mr-2 animate-spin" /> : <FileText className="mr-2" />}
                        Scan for New Contracts
                    </Button>
                </CardContent>
            </Card>

            {activeContracts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2"><Hourglass className="text-primary"/> Active Contracts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeContracts.map(contract => (
                            <Card key={contract.id} className="bg-card/50">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold">{contract.fromSystem}</span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-semibold">{contract.toSystem}</span>
                                        </div>
                                        <Badge variant="outline" className={riskColorMap[contract.riskLevel]}>{contract.riskLevel} Risk</Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-2 pt-1"><Package className="h-4 w-4" /> {contract.quantity} units of {contract.cargo}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Progress value={contract.progress || 0} />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>In Transit...</span>
                                            <span>Payout: <span className="font-mono text-amber-300">{contract.payout.toLocaleString()}¢</span></span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><FileText className="text-primary"/> Available Contracts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isGeneratingContracts && availableContracts.length === 0 ? (
                        <div className="text-center text-muted-foreground p-8">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                            <p>Scanning galactic logistics network...</p>
                        </div>
                    ) : availableContracts.length > 0 ? (
                        availableContracts.map(contract => (
                            <Card key={contract.id} className="bg-card/50">
                                <CardHeader>
                                     <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold">{contract.fromSystem}</span>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-semibold">{contract.toSystem}</span>
                                        </div>
                                        <Badge variant="outline" className={riskColorMap[contract.riskLevel]}>{contract.riskLevel} Risk</Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-2 pt-1"><Package className="h-4 w-4" /> {contract.quantity} units of {contract.cargo}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex justify-between items-center">
                                    <div className="text-sm space-y-1">
                                        <p className="flex items-center gap-2"><Coins className="h-4 w-4 text-amber-300" /> Payout: <span className="font-mono text-amber-300">{contract.payout.toLocaleString()}¢</span></p>
                                        <p className="flex items-center gap-2 text-muted-foreground"><Hourglass className="h-4 w-4" /> Duration: {contract.duration}s</p>
                                    </div>
                                    <Button onClick={() => handleAcceptContract(contract.id)}>Accept Contract</Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground p-8">No contracts available. Try scanning for new ones.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
