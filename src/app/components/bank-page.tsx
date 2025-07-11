
'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import BankClicker from './bank-clicker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, Coins, Briefcase, PiggyBank, CreditCard as CreditCardIcon, HandCoins, AlertTriangle, FileSignature } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import CooldownTimer from './cooldown-timer';
import BankValueChart from './bank-value-chart';

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

const ShareTransactionDialog = ({ type, onConfirm, price, maxShares, playerShares, playerNetWorth }: { type: 'Buy' | 'Sell', onConfirm: (amount: number) => void, price: number, maxShares: number, playerShares: number, playerNetWorth: number }) => {
    const [amount, setAmount] = useState(1);
    const maxAffordable = price > 0 ? Math.floor(playerNetWorth / price) : 0;
    const maxCanTransact = type === 'Buy' ? Math.min(maxShares, maxAffordable) : maxShares;

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{type} Bank Shares</DialogTitle>
                <DialogDescription>
                    Current share price: {price.toLocaleString()}¢. {type === 'Buy' ? `You can afford ${maxAffordable.toLocaleString()} share(s).` : `You own ${maxShares.toLocaleString()} share(s).`}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <div>
                    <Label htmlFor="share-amount">Amount (Max: {maxCanTransact.toLocaleString()})</Label>
                    <Input id="share-amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                </div>
                 <div className="text-sm text-muted-foreground">Total Cost: {(amount * price).toLocaleString()}¢</div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <DialogClose asChild><Button onClick={() => onConfirm(amount)} disabled={amount <= 0 || amount > maxCanTransact}>Confirm {type}</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

const LoanDialog = ({ onConfirm, netWorth }: { onConfirm: (amount: number) => void, netWorth: number }) => {
    const [amount, setAmount] = useState(10000);
    const maxLoan = netWorth * 100;
    const interest = amount * 0.10;
    const totalRepayable = amount + interest;
    const repayments = 12;
    const repaymentAmount = Math.ceil(totalRepayable / repayments);

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Request a Loan</DialogTitle>
                <DialogDescription>Take on debt to accelerate your growth. Loans are repaid in 12 installments every 5 minutes.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-sm">
                <div>
                    <Label htmlFor="loan-amount">Loan Amount (Max: {maxLoan.toLocaleString()}¢)</Label>
                    <Input id="loan-amount" type="number" value={amount} onChange={e => setAmount(Math.max(0, Math.min(maxLoan, Number(e.target.value))))} />
                </div>
                <div className="p-3 rounded-md bg-background/50 border">
                    <div className="flex justify-between"><span>Interest (10%):</span> <span className="font-mono">{interest.toLocaleString()}¢</span></div>
                    <div className="flex justify-between"><span>Total Repayable:</span> <span className="font-mono">{totalRepayable.toLocaleString()}¢</span></div>
                    <div className="flex justify-between"><span>Installments:</span> <span className="font-mono">{repayments} x {repaymentAmount.toLocaleString()}¢</span></div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <DialogClose asChild>
                    <Button onClick={() => onConfirm(amount)} disabled={amount <= 0 || amount > maxLoan}>Sign Loan Agreement</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default function BankPageComponent() {
    const { gameState, handleOpenAccount, handleDeposit, handleWithdraw, handlePurchaseShare, handleSellShare, handleAcquireBank, handleSetInterestRate, handleTakeLoan, handleFloatShare } = useGame();
    const [dialog, setDialog] = useState<'deposit' | 'withdraw' | 'buy_shares' | 'sell_shares' | 'loan' | null>(null);
    const [newInterestRate, setNewInterestRate] = useState(gameState?.playerStats.bankAccount?.interestRate || 0.1);

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
    const { bankAccount, bankShares = 0, debt, loan } = playerStats;
    const totalWealth = playerStats.netWorth + (bankAccount?.balance || 0);

    const hasMajority = bankShares >= 5001;
    const hasFullOwnership = bankShares >= 10000;
    const acquisitionCost = 50000000;
    const canAffordAcquisition = playerStats.netWorth >= acquisitionCost;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-headline text-slate-200 tracking-wider">Galactic Bank</h2>
                <p className="text-muted-foreground">Your central hub for all financial operations.</p>
            </div>
            <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center gap-2"><PiggyBank className="text-primary"/> Account Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm"><span>Cash on Hand:</span><span className="font-mono text-amber-300">{playerStats.netWorth.toLocaleString()}¢</span></div>
                            <div className="flex justify-between text-sm"><span>Bank Balance:</span><span className="font-mono text-amber-300">{bankAccount.balance.toLocaleString()}¢</span></div>
                            <div className="flex justify-between text-sm"><span>Interest Rate:</span><span className="font-mono text-amber-300">{bankAccount.interestRate.toFixed(2)}%</span></div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total Wealth:</span><span className="font-mono text-primary">{totalWealth.toLocaleString()}¢</span></div>
                            <div className="flex gap-2 pt-4">
                                <Button className="w-full" onClick={() => setDialog('deposit')}>Deposit</Button>
                                <Button variant="outline" className="w-full" onClick={() => setDialog('withdraw')}>Withdraw</Button>
                            </div>
                        </CardContent>
                    </Card>

                     <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center gap-2"><HandCoins className="text-primary"/> Loans & Credit</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loan ? (
                                <div className="text-sm space-y-2">
                                    <p className="font-semibold">Active Loan</p>
                                    <div className="flex justify-between"><span>Principal:</span><span className="font-mono">{loan.principal.toLocaleString()}¢</span></div>
                                    <div className="flex justify-between"><span>Next Payment:</span><span className="font-mono"><CooldownTimer expiry={loan.nextDueDate} /></span></div>
                                    <div className="flex justify-between"><span>Repayments:</span><span className="font-mono">{loan.repaymentsMade} / {loan.totalRepayments}</span></div>
                                </div>
                            ) : (
                                <Button className="w-full" onClick={() => setDialog('loan')}>Request Loan</Button>
                            )}
                             <div className="flex justify-between text-sm pt-4 border-t">
                                <span className="text-destructive flex items-center gap-2"><AlertTriangle/> Outstanding Debt:</span>
                                <span className="font-mono text-destructive">{debt.toLocaleString()}¢</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center gap-2"><Briefcase className="text-primary"/> Investment Portfolio</CardTitle>
                            <CardDescription>Acquire shares to gain ownership of the bank.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Shares Owned</p>
                                    <p className="font-mono text-xl">{bankShares.toLocaleString()} / 10,000</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-muted-foreground">Share Price</p>
                                    <p className="font-mono text-xl text-amber-300">{bankAccount.sharePrice.toLocaleString()}¢</p>
                                </div>
                            </div>
                            <Progress value={(bankShares / 10000) * 100} />
                            <div className="flex gap-2">
                                <Button className="w-full" onClick={() => setDialog('buy_shares')} disabled={bankShares >= 10000}>Buy Shares</Button>
                                <Button variant="outline" className="w-full" onClick={() => setDialog('sell_shares')} disabled={bankShares === 0}>Sell Shares</Button>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Share Price History</CardTitle>
                        </CardHeader>
                         <CardContent>
                            <div className="h-[150px]">
                                <BankValueChart valueHistory={bankAccount.sharePriceHistory} />
                            </div>
                         </CardContent>
                    </Card>

                    {hasMajority && (
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="font-headline text-lg flex items-center gap-2">Full Ownership</CardTitle>
                                <CardDescription>You own all outstanding shares of the Galactic Bank. You can now nationalize it as your own private enterprise for a final fee.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button variant="destructive" className="w-full" onClick={handleAcquireBank} disabled={!canAffordAcquisition}>
                                    Acquire Bank and Convert to Private Business ({acquisitionCost.toLocaleString()}¢)
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                </div>
                {dialog === 'deposit' && (
                    <TransactionDialog 
                        type="Deposit"
                        onConfirm={handleDeposit}
                        maxAmount={playerStats.netWorth}
                        currentBalance={bankAccount.balance}
                    />
                )}
                {dialog === 'withdraw' && (
                    <TransactionDialog 
                        type="Withdraw"
                        onConfirm={handleWithdraw}
                        maxAmount={bankAccount.balance}
                        currentBalance={playerStats.netWorth}
                    />
                )}
                 {dialog === 'buy_shares' && (
                    <ShareTransactionDialog 
                        type="Buy"
                        onConfirm={handlePurchaseShare}
                        price={bankAccount.sharePrice}
                        maxShares={10000 - bankShares}
                        playerShares={bankShares}
                        playerNetWorth={playerStats.netWorth}
                    />
                 )}
                  {dialog === 'sell_shares' && (
                    <ShareTransactionDialog 
                        type="Sell"
                        onConfirm={handleSellShare}
                        price={bankAccount.sharePrice}
                        maxShares={bankShares}
                        playerShares={bankShares}
                        playerNetWorth={playerStats.netWorth}
                    />
                 )}
                 {dialog === 'loan' && (
                    <LoanDialog onConfirm={handleTakeLoan} netWorth={playerStats.netWorth}/>
                 )}
            </Dialog>
        </div>
    )
}
