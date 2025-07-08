
'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import BankClicker from './bank-clicker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, Coins, Briefcase, PiggyBank, CreditCard as CreditCardIcon, HandCoins, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import CooldownTimer from './cooldown-timer';

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

const LoanApplicationDialog = ({ onConfirm, maxLoan }: { onConfirm: (amount: number, repayments: number) => void, maxLoan: number }) => {
    const [amount, setAmount] = useState(Math.min(10000, maxLoan));
    const [repayments, setRepayments] = useState(12); // 12 repayments of 5 mins = 1 hour total
    
    const totalOwed = Math.ceil(amount * 1.10);
    const repaymentAmount = Math.ceil(totalOwed / repayments);

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Apply for a Loan</DialogTitle>
                <DialogDescription>Leverage your assets to secure capital. All loans have a 10% interest rate.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
                <div>
                    <Label>Loan Amount (Max: {maxLoan.toLocaleString()}¢)</Label>
                    <Input type="number" value={amount} onChange={e => setAmount(Math.max(0, Math.min(maxLoan, Number(e.target.value))))} />
                </div>
                <div>
                    <Label>Number of Repayments: {repayments}</Label>
                    <Slider defaultValue={[12]} min={6} max={24} step={1} onValueChange={(value) => setRepayments(value[0])} />
                </div>
                <div className="text-sm space-y-2 p-3 rounded-md bg-card/50 border">
                    <div className="flex justify-between"><span>Total Repayment:</span> <span className="font-mono">{totalOwed.toLocaleString()}¢</span></div>
                    <div className="flex justify-between"><span>Payment Amount:</span> <span className="font-mono">{repaymentAmount.toLocaleString()}¢</span></div>
                    <div className="flex justify-between"><span>Payment Frequency:</span> <span className="font-mono">Every 5 minutes</span></div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <DialogClose asChild><Button onClick={() => onConfirm(amount, repayments)} disabled={amount <= 0}>Take Loan</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

const CreditCardDialog = ({ type, onConfirm, card }: { type: 'Draw' | 'Pay', onConfirm: (amount: number) => void, card: any }) => {
    const [amount, setAmount] = useState(0);
    const { gameState } = useGame();
    if (!gameState) return null;
    const maxAmount = type === 'Draw' ? card.limit - card.balance : Math.min(card.balance, gameState.playerStats.netWorth);

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{type} Funds</DialogTitle>
                <DialogDescription>
                    {type === 'Draw' ? 'Draw funds from your available credit line. This will increase your balance owed.' : 'Pay down your outstanding credit card balance.'}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="flex justify-between text-sm"><span>Available Credit:</span> <span className="font-mono">{(card.limit - card.balance).toLocaleString()}¢</span></div>
                <div className="flex justify-between text-sm"><span>Current Balance:</span> <span className="font-mono">{card.balance.toLocaleString()}¢</span></div>
                 <div>
                    <Label htmlFor="amount">Amount (Max: {maxAmount.toLocaleString()}¢)</Label>
                    <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <DialogClose asChild><Button onClick={() => onConfirm(amount)} disabled={amount <= 0 || amount > maxAmount}>Confirm {type}</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default function BankPageComponent() {
    const { gameState, handleOpenAccount, handleDeposit, handleWithdraw, handlePurchaseShare, handleAcquireBank, handleApplyForLoan, handleMakeLoanRepayment, handleRepayLoanEarly, handleApplyForCreditCard, handleDrawFromCreditCard, handlePayCreditCard } = useGame();
    const [dialog, setDialog] = useState<'deposit' | 'withdraw' | 'loan' | 'cc_draw' | 'cc_pay' | null>(null);

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
    const { bankAccount, bankShares = 0, loan, creditCard, debt } = playerStats;
    const sharePurchaseCost = 1000000;
    const canAffordShare = playerStats.netWorth >= sharePurchaseCost;
    const canAcquireBank = bankShares >= 100;
    const acquisitionCost = 50000000;
    const canAffordAcquisition = playerStats.netWorth >= acquisitionCost;
    const totalWealth = playerStats.netWorth + (bankAccount?.balance || 0);

    const loanPayoffAmount = loan ? Math.ceil((loan.principal * (1 - (loan.repaymentsMade / loan.totalRepayments))) + ((loan.principal * loan.interestRate) * (1 - (loan.repaymentsMade / loan.totalRepayments)) * 0.5)) : 0;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-headline text-slate-200 tracking-wider">Galactic Bank</h2>
                <p className="text-muted-foreground">Your central hub for all financial operations.</p>
            </div>
            <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Card className="xl:col-span-1">
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
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2"><AlertTriangle className="text-destructive"/> Debt:</span>
                                <span className="font-mono text-destructive">{debt.toLocaleString()}¢</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Total Wealth:</span>
                                <span className="font-mono text-primary">{totalWealth.toLocaleString()}¢</span>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button className="w-full" onClick={() => setDialog('deposit')}>Deposit</Button>
                                <Button variant="outline" className="w-full" onClick={() => setDialog('withdraw')}>Withdraw</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="xl:col-span-1">
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

                    <Card className="xl:col-span-1">
                        <CardHeader>
                             <CardTitle className="font-headline text-lg flex items-center gap-2"><HandCoins className="text-primary"/> Financial Instruments</CardTitle>
                             <CardDescription>Leverage debt to accelerate your growth.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loan ? (
                                <div className="p-3 rounded-md border bg-card/50 space-y-3">
                                    <h4 className="font-semibold text-sm">Active Loan</h4>
                                    <div className="text-xs space-y-1 text-muted-foreground">
                                        <div className="flex justify-between"><span>Principal:</span><span>{loan.principal.toLocaleString()}¢</span></div>
                                        <div className="flex justify-between"><span>Next Payment:</span><span>{loan.repaymentAmount.toLocaleString()}¢</span></div>
                                        <div className="flex justify-between"><span>Due In:</span><span><CooldownTimer expiry={loan.nextDueDate} /></span></div>
                                        <div className="flex justify-between"><span>Payments Left:</span><span>{loan.totalRepayments - loan.repaymentsMade}</span></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="w-full" onClick={handleMakeLoanRepayment} disabled={playerStats.netWorth < loan.repaymentAmount}>Pay Now</Button>
                                        <Button size="sm" variant="outline" className="w-full" onClick={handleRepayLoanEarly} disabled={playerStats.netWorth < loanPayoffAmount}>Pay Off Early ({loanPayoffAmount.toLocaleString()}¢)</Button>
                                    </div>
                                </div>
                            ) : (
                                <Button className="w-full" onClick={() => setDialog('loan')}>Apply for Loan</Button>
                            )}
                            
                             {creditCard ? (
                                <div className="p-3 rounded-md border bg-card/50 space-y-3">
                                    <h4 className="font-semibold text-sm">Credit Line</h4>
                                    <div className="text-xs space-y-1 text-muted-foreground">
                                        <div className="flex justify-between"><span>Credit Limit:</span><span>{creditCard.limit.toLocaleString()}¢</span></div>
                                        <div className="flex justify-between"><span>Balance Owed:</span><span>{creditCard.balance.toLocaleString()}¢</span></div>
                                        <div className="flex justify-between">
                                            <span>Payment Due:</span>
                                            <span>
                                                {creditCard.dueDate ? <CooldownTimer expiry={creditCard.dueDate} /> : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                     <div className="flex gap-2">
                                        <Button size="sm" className="w-full" onClick={() => setDialog('cc_draw')} disabled={creditCard.balance >= creditCard.limit}>Draw Funds</Button>
                                        <Button size="sm" variant="outline" className="w-full" onClick={() => setDialog('cc_pay')} disabled={creditCard.balance <= 0}>Make Payment</Button>
                                    </div>
                                </div>
                            ) : (
                                <Button className="w-full" variant="secondary" onClick={handleApplyForCreditCard} disabled={playerStats.netWorth < 5000}>Apply for Credit Card (5,000¢)</Button>
                            )}
                        </CardContent>
                    </Card>

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
                 {dialog === 'loan' && (
                    <LoanApplicationDialog onConfirm={handleApplyForLoan} maxLoan={playerStats.netWorth * 100} />
                 )}
                 {dialog === 'cc_draw' && creditCard && (
                    <CreditCardDialog type="Draw" onConfirm={handleDrawFromCreditCard} card={creditCard} />
                 )}
                  {dialog === 'cc_pay' && creditCard && (
                    <CreditCardDialog type="Pay" onConfirm={handlePayCreditCard} card={creditCard} />
                 )}
            </Dialog>
        </div>
    )
}
