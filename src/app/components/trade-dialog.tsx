
'use client';

import { useState, useEffect } from 'react';
import type { MarketItem, PlayerStats, InventoryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Coins, Package } from 'lucide-react';
import { STATIC_ITEMS } from '@/lib/items';

interface TradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: MarketItem | null;
  tradeType: 'buy' | 'sell';
  playerStats: PlayerStats | null;
  inventory: InventoryItem[];
  onTrade: (itemName: string, type: 'buy' | 'sell', amount: number) => void;
}

export default function TradeDialog({ isOpen, onOpenChange, item, tradeType, playerStats, inventory, onTrade }: TradeDialogProps) {
  const [amount, setAmount] = useState(1);

  useEffect(() => {
    // Reset amount when item changes
    setAmount(1);
  }, [item]);

  if (!item || !playerStats) {
      // This guard prevents rendering when the dialog is not supposed to be visible or data is missing.
      // The component is always mounted, so hooks are always called.
      return null;
  }

  const staticItemData = STATIC_ITEMS.find(i => i.name === item.name);
  if (!staticItemData) return null; // Should not happen
  
  const isTrader = playerStats.career === 'Trader';
  const effectivePrice = (tradeType === 'buy' && isTrader) ? item.currentPrice * 0.8 : item.currentPrice;

  const handleAmountChange = (newAmount: number) => {
    if (newAmount >= 0) {
      setAmount(newAmount);
    }
  };

  const currentOwned = inventory.find(i => i.name === item.name)?.owned ?? 0;

  const maxBuyableByCredits = effectivePrice > 0 ? Math.floor(playerStats.netWorth / effectivePrice) : Infinity;
  const maxBuyableByCargo = staticItemData.cargoSpace > 0 ? Math.floor((playerStats.maxCargo - playerStats.cargo) / staticItemData.cargoSpace) : Infinity;
  const maxBuy = Math.min(maxBuyableByCredits, maxBuyableByCargo);
  const maxSell = currentOwned;

  const maxAmount = tradeType === 'buy' ? maxBuy : maxSell;
  const totalPrice = amount * effectivePrice;
  const totalCargo = amount * staticItemData.cargoSpace;
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
           {isTrader && tradeType === 'buy' && <DialogDescription>As a Trader, you get a 20% discount on purchases.</DialogDescription>}
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
                <p className="flex items-center gap-2 text-muted-foreground"><Coins className="h-4 w-4 text-amber-400" /> Total Price ({effectivePrice.toLocaleString()}¢ each):</p>
                <p className={`font-mono ${tradeType === 'buy' && totalPrice > playerStats.netWorth ? 'text-destructive' : 'text-foreground'}`}>
                    {totalPrice.toLocaleString()} ¢
                </p>
             </div>
             <div className="flex justify-between items-center text-sm">
                <p className="flex items-center gap-2 text-muted-foreground"><Package className="h-4 w-4 text-sky-400" /> Cargo Space:</p>
                <p className={`font-mono ${tradeType === 'buy' && totalCargo > (playerStats.maxCargo - playerStats.cargo) ? 'text-destructive' : 'text-foreground'}`}>
                    {totalCargo.toFixed(2)}t
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
