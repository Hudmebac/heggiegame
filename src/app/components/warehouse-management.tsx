'use client';

import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Warehouse, ChevronsUp, Package, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { warehouseUpgrades } from '@/lib/upgrades';
import { calculateCurrentCargo } from '@/lib/utils';
import WarehouseTransferDialog from './warehouse-transfer-dialog';
import type { InventoryItem } from '@/lib/types';

export default function WarehouseManagement() {
    const { gameState, handleBuildWarehouse, handleUpgradeWarehouse } = useGame();
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

    if (!gameState) return null;

    const { playerStats, currentSystem } = gameState;
    const currentSystemWarehouse = playerStats.warehouses.find(w => w.systemName === currentSystem);

    if (!currentSystemWarehouse) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Warehouse className="text-primary"/>Warehouse</CardTitle>
                    <CardDescription>You do not own a warehouse in the {currentSystem} system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" onClick={handleBuildWarehouse} disabled={playerStats.netWorth < 25000}>
                        Build Warehouse (25,000¢)
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const currentWarehouseLoad = calculateCurrentCargo(currentSystemWarehouse.storage);
    const capacityPercentage = (currentWarehouseLoad / currentSystemWarehouse.capacity) * 100;
    
    const isMaxLevel = currentSystemWarehouse.level >= warehouseUpgrades.length;
    let upgradeCost = 0;
    if (!isMaxLevel) {
        const currentCost = warehouseUpgrades[currentSystemWarehouse.level - 1]?.cost || 0;
        const nextCost = warehouseUpgrades[currentSystemWarehouse.level].cost;
        upgradeCost = nextCost - currentCost;
    }
    const canAffordUpgrade = playerStats.netWorth >= upgradeCost;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Warehouse className="text-primary"/>
                        Warehouse: {currentSystem}
                    </CardTitle>
                    <CardDescription>Store goods and manage your inventory in this system.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Storage Capacity</span>
                            <span className="font-mono">{currentWarehouseLoad.toFixed(2)}t / {currentSystemWarehouse.capacity}t</span>
                        </div>
                        <Progress value={capacityPercentage} />
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span>Warehouse Level: <span className="font-mono">{currentSystemWarehouse.level}</span></span>
                        {!isMaxLevel && (
                             <Button size="sm" onClick={() => handleUpgradeWarehouse(currentSystem)} disabled={!canAffordUpgrade}>
                                <ChevronsUp className="mr-2"/> Upgrade ({upgradeCost.toLocaleString()}¢)
                            </Button>
                        )}
                    </div>

                    <div className="pt-4 border-t">
                         <h4 className="text-sm font-semibold mb-2">Stored Items</h4>
                        {currentSystemWarehouse.storage.length > 0 ? (
                             <ul className="space-y-1 text-sm text-muted-foreground">
                                {currentSystemWarehouse.storage.map(item => (
                                    <li key={item.name} className="flex justify-between items-center">
                                        <span>{item.name}</span>
                                        <span className="font-mono">{item.owned.toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">This warehouse is empty.</p>
                        )}
                    </div>
                    
                    <Button className="w-full" onClick={() => setIsTransferDialogOpen(true)}>
                        <Package className="mr-2"/> Transfer Cargo
                    </Button>
                </CardContent>
            </Card>
            <WarehouseTransferDialog
                isOpen={isTransferDialogOpen}
                onOpenChange={setIsTransferDialogOpen}
                warehouse={currentSystemWarehouse}
            />
        </>
    );
}
