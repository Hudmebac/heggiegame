
'use client';

import MarketPageComponent from "@/app/components/market-page-component";
import WarehouseManagement from "@/app/components/warehouse-management";

export default function TraderPage() {
  return (
    <div className="space-y-6">
        <WarehouseManagement />
        <MarketPageComponent />
    </div>
  );
}
