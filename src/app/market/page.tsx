'use client';
import { useGame } from '@/app/components/game-provider';
import MarketChart from '@/app/components/market-chart';
import TradingInterface from '@/app/components/trading-interface';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { MarketItem, InventoryItem } from '@/lib/types';
import { useState, useEffect } from 'react';
import { STATIC_ITEMS } from '@/lib/items';

export default function MarketPage() {
  const { 
    gameState, 
    handleInitiateTrade, 
    handleSimulateMarket, 
    isSimulating,
    chartItem,
    setChartItem
  } = useGame();

  const [chartCategory, setChartCategory] = useState('All');

  if (!gameState) {
    return null;
  }
  
  const allCategories = ['All', ...Array.from(new Set(STATIC_ITEMS.map(item => item.category)))];

  const chartItems = gameState.marketItems
    .filter(item => {
        if (chartCategory === 'All') return true;
        const staticItem = STATIC_ITEMS.find(si => si.name === item.name);
        return staticItem?.category === chartCategory;
    })
    .map(i => i.name);

  useEffect(() => {
    if (chartItems.length > 0 && !chartItems.includes(chartItem)) {
      setChartItem(chartItems[0]);
    }
  }, [chartCategory, chartItems, chartItem, setChartItem]);

  
  return (
     <div className="flex flex-col gap-6">
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
        />
        
        <div className="flex justify-center">
            <Button onClick={handleSimulateMarket} disabled={isSimulating} className="w-full max-w-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Simulate Market Event
            </Button>
        </div>
    </div>
  );
}
