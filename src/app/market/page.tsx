'use client';
import { useGame } from '@/app/components/game-provider';
import MarketChart from '@/app/components/market-chart';
import TradingInterface from '@/app/components/trading-interface';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { MarketItem, InventoryItem } from '@/lib/types';

export default function MarketPage() {
  const { 
    gameState, 
    handleInitiateTrade, 
    handleSimulateMarket, 
    isSimulating,
    chartItem,
    setChartItem
  } = useGame();

  if (!gameState) {
    return null;
  }
  
  return (
     <div className="flex flex-col gap-6">
        <TradingInterface 
            marketItems={gameState.marketItems} 
            inventory={gameState.inventory}
            onInitiateTrade={(item: MarketItem, type: 'buy' | 'sell') => handleInitiateTrade(item.name, type)} 
        />
        
        <MarketChart 
            priceHistory={gameState.priceHistory} 
            items={gameState.marketItems.map(i => i.name)}
            selectedItem={chartItem}
            onSelectItem={setChartItem}
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
