'use client';

import { useState } from 'react';
import type { Item } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, ArrowUpDown, Coins, Package, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TradingInterfaceProps {
  items: Item[];
  onInitiateTrade: (item: Item, type: 'buy' | 'sell') => void;
}

type SortKey = keyof Item | 'value';

export default function TradingInterface({ items, onInitiateTrade }: TradingInterfaceProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = sortKey === 'value' ? a.currentPrice * a.cargoSpace : a[sortKey];
    const bValue = sortKey === 'value' ? b.currentPrice * b.cargoSpace : b[sortKey];

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

  return (
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
                  <TableCell className="font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground"/>
                    {item.name}
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
  );
}
