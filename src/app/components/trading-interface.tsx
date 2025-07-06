'use client';

import { useState } from 'react';
import type { MarketItem, InventoryItem, StaticItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, ArrowUpDown, Coins, Package, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { STATIC_ITEMS } from '@/lib/items';
import ItemDetailDialog from './item-detail-dialog';

interface TradingInterfaceProps {
  marketItems: MarketItem[];
  inventory: InventoryItem[];
  onInitiateTrade: (item: MarketItem, type: 'buy' | 'sell') => void;
}

interface DisplayItem extends MarketItem {
    owned: number;
}

type SortKey = keyof DisplayItem;

export default function TradingInterface({ marketItems, inventory, onInitiateTrade }: TradingInterfaceProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<StaticItem | null>(null);

  const displayItems: DisplayItem[] = marketItems.map(marketItem => {
    const inventoryItem = inventory.find(i => i.name === marketItem.name);
    return {
      ...marketItem,
      owned: inventoryItem ? inventoryItem.owned : 0,
    };
  });

  const filteredItems = displayItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const SortableHeader = ({ tkey, label, className }: { tkey: SortKey; label: string; className?: string }) => (
    <TableHead className={className} onClick={() => handleSort(tkey)}>
      <div className="flex items-center gap-2 cursor-pointer select-none">
        {label}
        {sortKey === tkey ? (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
      </div>
    </TableHead>
  );

  const handleItemClick = (itemName: string) => {
    const staticItem = STATIC_ITEMS.find(si => si.name === itemName);
    if (staticItem) {
        setSelectedItemForDetail(staticItem);
    }
  };

  return (
    <>
      <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg flex-grow flex flex-col">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <Coins className="text-primary" />
                  Commodity Market
                  </CardTitle>
                  <CardDescription>Buy and sell goods from across the galaxy. Prices fluctuate based on supply and demand.</CardDescription>
              </div>
              <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="Search commodities..."
                      className="pl-8 sm:w-[200px] md:w-[250px] bg-background"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader tkey="name" label="Item Name" className="w-2/5" />
                  <SortableHeader tkey="currentPrice" label="Price (¢)" />
                  <SortableHeader tkey="supply" label="Supply" />
                  <SortableHeader tkey="demand" label="Demand" />
                  <SortableHeader tkey="owned" label="Owned" />
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map(item => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">
                        <button onClick={() => handleItemClick(item.name)} className="flex items-center gap-2 hover:underline text-left transition-colors">
                            <Package className="h-4 w-4 text-muted-foreground"/>
                            {item.name}
                        </button>
                    </TableCell>
                    <TableCell className="font-mono text-amber-300">{item.currentPrice.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-sky-300">{item.supply}</TableCell>
                    <TableCell className="font-mono text-rose-300">{item.demand}</TableCell>
                    <TableCell className="font-mono">{item.owned}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => onInitiateTrade(item, 'buy')} className="text-green-400 hover:bg-green-500/10 hover:text-green-300">Buy</Button>
                      <Button variant="ghost" size="sm" onClick={() => onInitiateTrade(item, 'sell')} disabled={item.owned === 0} className="text-red-400 hover:bg-red-500/10 hover:text-red-300">Sell</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <ItemDetailDialog
          isOpen={!!selectedItemForDetail}
          onOpenChange={(open) => !open && setSelectedItemForDetail(null)}
          item={selectedItemForDetail}
      />
    </>
  );
}
