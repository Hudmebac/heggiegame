'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import type { Warehouse, InventoryItem } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftRight, Package, Ship, Warehouse as WarehouseIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STATIC_ITEMS } from '@/lib/items';
import { calculateCurrentCargo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TransferDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse: Warehouse;
}

type TransferDirection = 'toWarehouse' | 'toShip';

export default function WarehouseTransferDialog({ isOpen, onOpenChange, warehouse }: TransferDialogProps) {
    const { gameState, handleStoreItem, handleRetrieveItem } = useGame();
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [direction, setDirection] = useState<TransferDirection | null>(null);
    const [amount, setAmount] = useState(1);

    if (!gameState) return null;

    const { inventory: shipInventory, playerStats } = gameState;
    const warehouseInventory = warehouse.storage;

    const handleSelect = (item: InventoryItem, dir: TransferDirection) => {
        setSelectedItem(item);
        setDirection(dir);
        setAmount(1);
    };

    const handleTransfer = () => {
        if (!selectedItem || !direction) return;
        if (direction === 'toWarehouse') {
            handleStoreItem(warehouse.systemName, selectedItem.name, amount);
        } else {
            handleRetrieveItem(warehouse.systemName, selectedItem.name, amount);
        }
        setSelectedItem(null);
        setDirection(null);
    };
    
    const maxAmount = direction === 'toWarehouse' ? selectedItem?.owned : selectedItem?.owned;

    const renderInventoryList = (items: InventoryItem[], dir: TransferDirection, title: string, icon: React.ReactNode) => (
        <div className="flex-1 border p-2 rounded-md">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">{icon}{title}</h4>
            <ScrollArea className="h-48">
                <div className="space-y-1 pr-2">
                    {items.length > 0 ? items.map(item => (
                        <button key={item.name} onClick={() => handleSelect(item, dir)}
                            className="w-full text-left p-2 rounded-md text-xs hover:bg-muted transition-colors flex justify-between items-center">
                            <span>{item.name}</span>
                            <Badge variant="secondary">{item.owned}</Badge>
                        </button>
                    )) : <p className="text-xs text-muted-foreground text-center p-4">Empty</p>}
                </div>
            </ScrollArea>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Transfer Cargo</DialogTitle>
                    <DialogDescription>Move items between your ship and the warehouse in {warehouse.systemName}.</DialogDescription>
                </DialogHeader>
                
                <div className="flex gap-4">
                    {renderInventoryList(shipInventory, 'toWarehouse', 'Ship Cargo', <Ship className="text-primary"/>)}
                    {renderInventoryList(warehouseInventory, 'toShip', 'Warehouse Storage', <WarehouseIcon className="text-primary"/>)}
                </div>

                {selectedItem && direction && (
                    <div className="p-4 border rounded-lg bg-card/50 space-y-4">
                        <h4 className="font-semibold text-sm">Transfer: {selectedItem.name}</h4>
                        <p className="text-xs text-muted-foreground">
                            {direction === 'toWarehouse' ? `Moving from Ship to Warehouse.` : `Moving from Warehouse to Ship.`}
                        </p>
                        <div className="flex items-center gap-2">
                             <Label htmlFor="transfer-amount">Amount:</Label>
                             <Input id="transfer-amount" type="number" value={amount}
                                onChange={e => setAmount(Math.max(1, Math.min(maxAmount || 1, parseInt(e.target.value) || 1)))}
                                className="w-24" />
                            <Button variant="outline" size="sm" onClick={() => setAmount(maxAmount || 1)}>Max</Button>
                        </div>
                    </div>
                )}
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleTransfer} disabled={!selectedItem || !direction || amount <= 0 || amount > (maxAmount || 0)}>
                        <ArrowLeftRight className="mr-2"/>
                        Confirm Transfer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
