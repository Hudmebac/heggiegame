
'use client';

import { useState } from 'react';
import type { StaticItem, ItemCategory, ItemGrade, ItemRarity } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { STATIC_ITEMS } from '@/lib/items';
import ItemDetailDialog from '../item-detail-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Badge } from '@/components/ui/badge';

const allCategories = ['All', ...Array.from(new Set(STATIC_ITEMS.map(item => item.category)))];
const allGrades: Array<'All' | ItemGrade> = ['All', 'Salvaged', 'Standard', 'Refined', 'Experimental', 'Quantum', 'Singularity'];

const rarityColors: Record<ItemRarity, string> = {
    'Plentiful': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    'Common': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Accessible': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Uncommon': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Rare': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Ultra Rare': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Mythic': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ITEMS_PER_PAGE = 15;

export default function ItemCodex() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<StaticItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = STATIC_ITEMS.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = categoryFilter === 'All' || item.category === categoryFilter;
    const gradeMatch = gradeFilter === 'All' || item.grade === gradeFilter;
    return nameMatch && categoryMatch && gradeMatch;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handleItemClick = (item: StaticItem) => {
    setSelectedItemForDetail(item);
  };
  
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <>
      <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg flex-grow flex flex-col">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                  <CardTitle className="font-headline text-lg">Commodities Database</CardTitle>
                  <CardDescription>A comprehensive list of all known goods in the galaxy.</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                   <Select value={gradeFilter} onValueChange={handleFilterChange(setGradeFilter)}>
                      <SelectTrigger className="w-full sm:w-[150px] bg-background">
                        <SelectValue placeholder="Filter by grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {allGrades.map(grade => (
                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={handleFilterChange(setCategoryFilter)}>
                      <SelectTrigger className="w-full sm:w-[180px] bg-background">
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
                          className="pl-8 w-full sm:w-[200px] md:w-[250px] bg-background"
                          value={searchTerm}
                          onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
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
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Rarity</TableHead>
                  <TableHead className="text-right">Base Price (¢)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map(item => (
                  <TableRow key={item.name} onClick={() => handleItemClick(item)} className="cursor-pointer">
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground"/>
                            {item.name}
                        </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.grade}</TableCell>
                    <TableCell><Badge variant="outline" className={rarityColors[item.rarity]}>{item.rarity}</Badge></TableCell>
                    <TableCell className="font-mono text-amber-300 text-right">{item.basePrice.toLocaleString()}</TableCell>
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
