'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import BankClicker from './bank-clicker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, Coins, Briefcase, PiggyBank, ArrowRightLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const TransactionDialog = ({ type, onConfirm, maxAmount, currentBalance }: { type: 'Deposit' | 'Withdraw', onConfirm: (amount: number) => void, maxAmount: number, currentBalance: number }) => {
    const [amount, setAmount] = useState(0);

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{type} Funds</DialogTitle>
                <DialogDescription>
                    {type === 'Deposit' ? 'Move funds from your wallet to your secure bank account.' : 'Move funds from your bank account to your wallet.'}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="flex justify-between text-sm"><span>{type === 'Deposit' ? 'Wallet' : 'Bank Account'}:</span> <span className="font-mono">{maxAmount.toLocaleString()}¢</span></div>
                <div className="flex justify-between text-sm"><span>{type === 'Deposit' ? 'Bank Account' : 'Wallet'}:</span> <span className="font-mono">{currentBalance.toLocaleString()}¢</span></div>
                <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button onClick={() => onConfirm(amount)} disabled={amount <= 0 || amount > maxAmount}>Confirm {type}</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default function BankPageComponent() {
    const { gameState, handleOpenAccount, handleDeposit, handleWithdraw, handlePurchaseShare, handleAcquireBank } = useGame();
    const [dialogType, setDialogType] = useState<'Deposit' | 'Withdraw' | null>(null);

    if (!gameState) return null;

    if (gameState.playerStats.bankEstablishmentLevel > 0) {
        return <BankClicker />;
    }
    
    if (!gameState.playerStats.bankAccount) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Open a Galactic Bank Account</CardTitle>
                    <CardDescription>Secure your funds and unlock powerful financial tools. A one-time fee of 1,000¢ is required.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" onClick={handleOpenAccount} disabled={gameState.playerStats.netWorth < 1000}>
                        Open Account (1,000¢)
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const { playerStats } = gameState;
    const { bankAccount, bankShares = 0 } = playerStats;
    const sharePurchaseCost = 1000000;
    const canAffordShare = playerStats.netWorth >= sharePurchaseCost;
    const canAcquireBank = bankShares >= 100;
    const acquisitionCost = 50000000;
    const canAffordAcquisition = playerStats.netWorth >= acquisitionCost;

    const totalWealth = playerStats.netWorth + (bankAccount?.balance || 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-headline text-slate-200 tracking-wider">Galactic Bank</h2>
                <p className="text-muted-foreground">Your central hub for all financial operations.</p>
            </div>
            <Dialog onOpenChange={(open) => !open && setDialogType(null)}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center gap-2"><PiggyBank className="text-primary"/> Account Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Cash on Hand:</span>
                                <span className="font-mono text-amber-300">{playerStats.netWorth.toLocaleString()}¢</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Bank Balance:</span>
                                <span className="font-mono text-amber-300">{bankAccount.balance.toLocaleString()}¢</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Total Wealth:</span>
                                <span className="font-mono text-primary">{totalWealth.toLocaleString()}¢</span>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button className="w-full" onClick={() => setDialogType('Deposit')}>Deposit</Button>
                                <Button variant="outline" className="w-full" onClick={() => setDialogType('Withdraw')}>Withdraw</Button>
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center gap-2"><Briefcase className="text-primary"/> Investment Portfolio</CardTitle>
                            <CardDescription>Acquire shares to gain ownership of the bank.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Bank Shares Owned:</span>
                                <span className="font-mono">{bankShares} / 100</span>
                            </div>
                            <Progress value={bankShares} />
                             <Button className="w-full" onClick={handlePurchaseShare} disabled={!canAffordShare}>
                                Buy 1 Share ({sharePurchaseCost.toLocaleString()}¢)
                            </Button>
                            {canAcquireBank && (
                                 <Button variant="destructive" className="w-full" onClick={handleAcquireBank} disabled={!canAffordAcquisition}>
                                    Acquire Bank ({acquisitionCost.toLocaleString()}¢)
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
                {dialogType && (
                    <TransactionDialog 
                        type={dialogType}
                        onConfirm={dialogType === 'Deposit' ? handleDeposit : handleWithdraw}
                        maxAmount={dialogType === 'Deposit' ? playerStats.netWorth : bankAccount.balance}
                        currentBalance={dialogType === 'Deposit' ? bankAccount.balance : playerStats.netWorth}
                    />
                )}
            </Dialog>
        </div>
    )
}
