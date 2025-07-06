'use client';

import { useState } from 'react';
import type { MarketItem, InventoryItem, StaticItem, ItemCategory, ItemGrade } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, ArrowUpDown, Coins, Package, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { STATIC_ITEMS } from '@/lib/items';
import ItemDetailDialog from './item-detail-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

interface TradingInterfaceProps {
  marketItems: MarketItem[];
  inventory: InventoryItem[];
  onInitiateTrade: (item: MarketItem, type: 'buy' | 'sell') => void;
}

interface DisplayItem extends MarketItem {
    owned: number;
    category: ItemCategory;
    grade: ItemGrade;
}

type SortKey = keyof DisplayItem | 'grade';

const allCategories = ['All', ...Array.from(new Set(STATIC_ITEMS.map(item => item.category)))];

const ITEMS_PER_PAGE = 10;

export default function TradingInterface({ marketItems, inventory, onInitiateTrade }: TradingInterfaceProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<StaticItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const displayItems: DisplayItem[] = marketItems
    .map(marketItem => {
      const inventoryItem = inventory.find(i => i.name === marketItem.name);
      const staticItem = STATIC_ITEMS.find(i => i.name === marketItem.name);
      if (!staticItem) {
        return null;
      }
      return {
        ...marketItem,
        owned: inventoryItem ? inventoryItem.owned : 0,
        category: staticItem.category,
        grade: staticItem.grade,
      };
    })
    .filter((item): item is DisplayItem => item !== null);

  const filteredItems = displayItems.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = categoryFilter === 'All' || item.category === categoryFilter;
    return nameMatch && categoryMatch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
  };
  
  const handleCategoryChange = (value: string) => {
      setCategoryFilter(value);
      setCurrentPage(1);
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
              <div className="flex items-center gap-2">
                  <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="w-[180px] bg-background">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                  <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                          type="search"
                          placeholder="Search commodities..."
                          className="pl-8 sm:w-[200px] md:w-[250px] bg-background"
                          value={searchTerm}
                          onChange={handleSearchChange}
                      />
                  </div>
              </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader tkey="name" label="Item Name" className="w-2/5" />
                  <SortableHeader tkey="category" label="Category" />
                  <SortableHeader tkey="grade" label="Grade" />
                  <SortableHeader tkey="currentPrice" label="Price (¢)" />
                  <SortableHeader tkey="supply" label="Supply" />
                  <SortableHeader tkey="demand" label="Demand" />
                  <SortableHeader tkey="owned" label="Owned" />
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map(item => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">
                        <button onClick={() => handleItemClick(item.name)} className="flex items-center gap-2 hover:underline text-left transition-colors">
                            <Package className="h-4 w-4 text-muted-foreground"/>
                            {item.name}
                        </button>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.grade}</TableCell>
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
        {totalPages > 1 && (
            <CardFooter className="pt-4 justify-center">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <span className="text-sm font-medium px-4">
                                Page {currentPage} of {totalPages}
                            </span>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </CardFooter>
        )}
      </Card>
      <ItemDetailDialog
          isOpen={!!selectedItemForDetail}
          onOpenChange={(open) => !open && setSelectedItemForDetail(null)}
          item={selectedItemForDetail}
      />
    </>
  );
}
