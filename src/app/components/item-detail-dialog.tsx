'use client';

import type { StaticItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package, Info } from 'lucide-react';

interface ItemDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: StaticItem | null;
}

const rarityColors: Record<StaticItem['rarity'], string> = {
    'Plentiful': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    'Common': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Accessible': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Uncommon': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Rare': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Ultra Rare': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export default function ItemDetailDialog({ isOpen, onOpenChange, item }: ItemDetailDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Package />
            {item.name}
          </DialogTitle>
          <DialogDescription>
            {item.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Category</span>
                <span className="font-mono">{item.category}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rarity</span>
                <Badge variant="outline" className={rarityColors[item.rarity]}>{item.rarity}</Badge>
            </div>
            <div className="p-3 rounded-md bg-background/50 border border-border/50 text-sm text-muted-foreground space-y-2">
                <p className="font-bold flex items-center gap-2 text-foreground"><Info className="h-4 w-4 text-cyan-400" /> Details:</p>
                <p>{item.detail}</p>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
