'use client';

import type { InventoryItem, MarketItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  marketItems: MarketItem[];
  onInitiateTrade: (itemName: string, type: 'sell') => void;
}

export default function InventoryView({ inventory, marketItems, onInitiateTrade }: InventoryViewProps) {
  if (inventory.length === 0) {
    return (
      <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2">
            <Package className="text-primary" />
            Your Cargo Hold
          </CardTitle>
          <CardDescription>Your cargo hold is currently empty. Buy some goods to get started.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const inventoryWithPrices = inventory.map(item => {
      const marketData = marketItems.find(mi => mi.name === item.name);
      return {
          ...item,
          currentPrice: marketData?.currentPrice || 0,
      }
  }).filter(item => item.currentPrice > 0);

  if (inventoryWithPrices.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <Package className="text-primary" />
          Your Cargo Hold
        </CardTitle>
        <CardDescription>Items you currently have in your ship's cargo hold. Sell them for a profit.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {inventoryWithPrices.map(item => (
                <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right font-mono">{item.owned}</TableCell>
                    <TableCell className="text-right font-mono text-amber-300">{item.currentPrice.toLocaleString()} ¢</TableCell>
                    <TableCell className="text-right font-mono text-amber-300">{(item.owned * item.currentPrice).toLocaleString()} ¢</TableCell>
                    <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onInitiateTrade(item.name, 'sell')} className="text-red-400 hover:bg-red-500/10 hover:text-red-300">
                        Sell
                    </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
