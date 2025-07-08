
'use client';
import { useGame } from '@/app/components/game-provider';
import MarketChart from '@/app/components/market-chart';
import TradingInterface from '@/app/components/trading-interface';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { MarketItem, ItemGrade } from '@/lib/types';
import { useState, useEffect } from 'react';
import { STATIC_ITEMS } from '@/lib/items';
import InventoryView from '@/app/components/inventory-view';

export default function MarketPageComponent() {
  const { 
    gameState, 
    handleInitiateTrade, 
    chartItem,
    setChartItem
  } = useGame();

  const [chartCategory, setChartCategory] = useState('All');
  const [chartGrade, setChartGrade] = useState('All');

  if (!gameState) {
    return null;
  }
  
  const allCategories = ['All', ...Array.from(new Set(STATIC_ITEMS.map(item => item.category)))];
  const allGrades: Array<'All' | ItemGrade> = ['All', 'Salvaged', 'Standard', 'Refined', 'Experimental', 'Quantum', 'Singularity'];

  const chartItems = gameState.marketItems
    .filter(item => {
        const staticItem = STATIC_ITEMS.find(si => si.name === item.name);
        if (!staticItem) return false;

        const categoryMatch = chartCategory === 'All' || staticItem.category === chartCategory;
        const gradeMatch = chartGrade === 'All' || staticItem.grade === chartGrade;
        return categoryMatch && gradeMatch;
    })
    .map(i => i.name);

  useEffect(() => {
    if (chartItems.length > 0 && !chartItems.includes(chartItem)) {
      setChartItem(chartItems[0]);
    } else if (chartItems.length === 0 && chartItem) {
      setChartItem('');
    }
  }, [chartCategory, chartGrade, chartItems, chartItem, setChartItem]);

  
  return (
     <div className="flex flex-col gap-6">
        <InventoryView
          inventory={gameState.inventory}
          marketItems={gameState.marketItems}
          onInitiateTrade={(itemName, type) => handleInitiateTrade(itemName, type)}
        />
        <TradingInterface 
            marketItems={gameState.marketItems} 
            inventory={gameState.inventory}
            onInitiateTrade={(item: MarketItem, type: 'buy' | 'sell') => handleInitiateTrade(item.name, type)} 
        />
        
        <MarketChart 
            priceHistory={gameState.priceHistory} 
            items={chartItems}
            selectedItem={chartItem}
            onSelectItem={setChartItem}
            categories={allCategories}
            selectedCategory={chartCategory}
            onSelectCategory={setChartCategory}
            grades={allGrades}
            selectedGrade={chartGrade}
            onSelectGrade={setChartGrade}
        />
    </div>
  );
}
