'use client';

import { useState, useEffect } from 'react';
import type { Item, PlayerStats } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Coins, Package } from 'lucide-react';

interface TradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  tradeType: 'buy' | 'sell';
  playerStats: PlayerStats;
  onTrade: (itemName: string, type: 'buy' | 'sell', amount: number) => void;
}

export default function TradeDialog({ isOpen, onOpenChange, item, tradeType, playerStats, onTrade }: TradeDialogProps) {
  const [amount, setAmount] = useState(1);

  useEffect(() => {
    // Reset amount when item changes
    setAmount(1);
  }, [item]);

  if (!item) return null;

  const handleAmountChange = (newAmount: number) => {
    if (newAmount >= 0) {
      setAmount(newAmount);
    }
  };

  const maxBuyableByCredits = item.currentPrice > 0 ? Math.floor(playerStats.netWorth / item.currentPrice) : Infinity;
  const maxBuyableByCargo = item.cargoSpace > 0 ? Math.floor((playerStats.maxCargo - playerStats.cargo) / item.cargoSpace) : Infinity;
  const maxBuy = Math.min(maxBuyableByCredits, maxBuyableByCargo);
  const maxSell = item.owned;

  const maxAmount = tradeType === 'buy' ? maxBuy : maxSell;
  const totalPrice = amount * item.currentPrice;
  const totalCargo = amount * item.cargoSpace;
  const isTransactionValid = amount > 0 && amount <= maxAmount;


  const handleConfirm = () => {
    if (isTransactionValid) {
      onTrade(item.name, tradeType, amount);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="capitalize text-primary">{tradeType} {item.name}</DialogTitle>
          <DialogDescription>
            Specify the quantity you wish to {tradeType}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => handleAmountChange(amount - 1)} disabled={amount <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(parseInt(e.target.value, 10) || 0)}
                className="w-20 text-center"
              />
               <Button variant="outline" size="icon" onClick={() => handleAmountChange(amount + 1)} disabled={amount >= maxAmount}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
           <div className="text-sm text-muted-foreground text-right col-span-4">
            <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setAmount(maxAmount)}>Max: {maxAmount}</Button>
           </div>
          <div className="space-y-2 rounded-md border border-border/50 p-3 bg-card/50">
             <div className="flex justify-between items-center text-sm">
                <p className="flex items-center gap-2 text-muted-foreground"><Coins className="h-4 w-4 text-amber-400" /> Total Price:</p>
                <p className={`font-mono ${tradeType === 'buy' && totalPrice > playerStats.netWorth ? 'text-red-400' : 'text-foreground'}`}>
                    {totalPrice.toLocaleString()} ¢
                </p>
             </div>
             <div className="flex justify-between items-center text-sm">
                <p className="flex items-center gap-2 text-muted-foreground"><Package className="h-4 w-4 text-sky-400" /> Cargo Space:</p>
                <p className={`font-mono ${tradeType === 'buy' && totalCargo > (playerStats.maxCargo - playerStats.cargo) ? 'text-red-400' : 'text-foreground'}`}>
                    {totalCargo}t
                </p>
             </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleConfirm} disabled={!isTransactionValid}>
            Confirm {tradeType === 'buy' ? 'Purchase' : 'Sale'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
