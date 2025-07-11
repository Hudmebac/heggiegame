
'use client';

import { useCallback } from 'react';
import type { GameState, Warehouse } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { warehouseUpgrades } from '@/lib/upgrades';
import { STATIC_ITEMS } from '@/lib/items';
import { calculateCurrentCargo } from '@/lib/utils';

export function useTrader(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>,
) {
    const { toast } = useToast();

    const handleBuildWarehouse = useCallback(() => {
        setGameState(prev => {
            if (!prev) return null;
            const systemName = prev.currentSystem;
            if (prev.playerStats.warehouses.some(w => w.systemName === systemName)) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Action Failed', description: 'You already own a warehouse in this system.' }), 0);
                return prev;
            }
            
            const cost = 25000; // Initial build cost
            if (prev.playerStats.netWorth < cost) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Construction Failed', description: `Not enough credits. You need ${cost.toLocaleString()}¢.` }), 0);
                return prev;
            }

            const newWarehouse: Warehouse = {
                systemName,
                level: 1,
                capacity: warehouseUpgrades[0].capacity,
                storage: [],
            };
            
            setTimeout(() => toast({ title: 'Warehouse Built!', description: `You have established a new warehouse in the ${systemName} system.` }), 0);
            
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth - cost,
                    warehouses: [...prev.playerStats.warehouses, newWarehouse]
                }
            };
        });
    }, [setGameState, toast]);

    const handleUpgradeWarehouse = useCallback((systemName: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const warehouseIndex = prev.playerStats.warehouses.findIndex(w => w.systemName === systemName);
            if (warehouseIndex === -1) return prev;

            const warehouses = [...prev.playerStats.warehouses];
            const warehouse = { ...warehouses[warehouseIndex] };

            if (warehouse.level >= warehouseUpgrades.length) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Max Level', description: 'This warehouse is already at maximum level.' }), 0);
                return prev;
            }

            const nextLevel = warehouse.level + 1;
            const upgradeData = warehouseUpgrades[nextLevel - 1];
            const cost = upgradeData.cost - (warehouseUpgrades[warehouse.level - 1]?.cost || 0);

            if (prev.playerStats.netWorth < cost) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Upgrade Failed', description: `Not enough credits. You need ${cost.toLocaleString()}¢.` }), 0);
                return prev;
            }

            warehouse.level = nextLevel;
            warehouse.capacity = upgradeData.capacity;
            warehouses[warehouseIndex] = warehouse;

            setTimeout(() => toast({ title: 'Warehouse Upgraded!', description: `Your warehouse in ${systemName} is now Level ${nextLevel}.` }), 0);

            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth - cost,
                    warehouses,
                }
            };
        });
    }, [setGameState, toast]);

    const handleStoreItem = useCallback((systemName: string, itemName: string, amount: number) => {
         setGameState(prev => {
            if (!prev) return null;
            
            const warehouseIndex = prev.playerStats.warehouses.findIndex(w => w.systemName === systemName);
            if (warehouseIndex === -1) return prev;

            const inventoryItemIndex = prev.inventory.findIndex(i => i.name === itemName);
            if (inventoryItemIndex === -1 || prev.inventory[inventoryItemIndex].owned < amount) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Transfer Failed', description: 'Not enough items in ship cargo.' }), 0);
                return prev;
            }

            const staticItem = STATIC_ITEMS.find(i => i.name === itemName);
            if (!staticItem) return prev;

            const warehouses = [...prev.playerStats.warehouses];
            const warehouse = { ...warehouses[warehouseIndex] };
            
            const currentWarehouseLoad = calculateCurrentCargo(warehouse.storage);
            const transferLoad = staticItem.cargoSpace * amount;

            if (currentWarehouseLoad + transferLoad > warehouse.capacity) {
                setTimeout(() => toast({ variant: 'destructive', title: 'Transfer Failed', description: `Not enough warehouse space. Available: ${(warehouse.capacity - currentWarehouseLoad).toFixed(2)}t.` }), 0);
                return prev;
            }

            // Update ship inventory
            const newInventory = [...prev.inventory];
            newInventory[inventoryItemIndex] = { ...newInventory[inventoryItemIndex], owned: newInventory[inventoryItemIndex].owned - amount };

            // Update warehouse storage
            const newStorage = [...warehouse.storage];
            const storageItemIndex = newStorage.findIndex(i => i.name === itemName);
            if (storageItemIndex > -1) {
                newStorage[storageItemIndex].owned += amount;
            } else {
                newStorage.push({ name: itemName, owned: amount });
            }
            warehouse.storage = newStorage.filter(i => i.owned > 0);
            warehouses[warehouseIndex] = warehouse;

            // Update player cargo
            const newPlayerStats = { ...prev.playerStats, warehouses };
            newPlayerStats.cargo = calculateCurrentCargo(newInventory.filter(i => i.owned > 0));

            return {
                ...prev,
                playerStats: newPlayerStats,
                inventory: newInventory.filter(i => i.owned > 0),
            }
        });
    }, [setGameState, toast]);

    const handleRetrieveItem = useCallback((systemName: string, itemName: string, amount: number) => {
         setGameState(prev => {
            if (!prev) return null;

            const warehouseIndex = prev.playerStats.warehouses.findIndex(w => w.systemName === systemName);
            if (warehouseIndex === -1) return prev;
            
            const warehouses = [...prev.playerStats.warehouses];
            const warehouse = { ...warehouses[warehouseIndex] };

            const storageItemIndex = warehouse.storage.findIndex(i => i.name === itemName);
            if (storageItemIndex === -1 || warehouse.storage[storageItemIndex].owned < amount) {
                 setTimeout(() => toast({ variant: 'destructive', title: 'Transfer Failed', description: 'Not enough items in warehouse.' }), 0);
                return prev;
            }
            
            const staticItem = STATIC_ITEMS.find(i => i.name === itemName);
            if (!staticItem) return prev;

            const currentShipLoad = calculateCurrentCargo(prev.inventory);
            const transferLoad = staticItem.cargoSpace * amount;

            if (currentShipLoad + transferLoad > prev.playerStats.maxCargo) {
                 setTimeout(() => toast({ variant: 'destructive', title: 'Transfer Failed', description: 'Not enough ship cargo space.' }), 0);
                return prev;
            }
            
            // Update warehouse storage
            const newStorage = [...warehouse.storage];
            newStorage[storageItemIndex].owned -= amount;
            warehouse.storage = newStorage.filter(i => i.owned > 0);
            warehouses[warehouseIndex] = warehouse;
            
            // Update ship inventory
            const newInventory = [...prev.inventory];
            const inventoryItemIndex = newInventory.findIndex(i => i.name === itemName);
            if(inventoryItemIndex > -1) {
                newInventory[inventoryItemIndex].owned += amount;
            } else {
                newInventory.push({ name: itemName, owned: amount });
            }
            
            // Update player cargo
            const newPlayerStats = { ...prev.playerStats, warehouses };
            newPlayerStats.cargo = calculateCurrentCargo(newInventory.filter(i => i.owned > 0));

            return {
                ...prev,
                playerStats: newPlayerStats,
                inventory: newInventory.filter(i => i.owned > 0),
            }
        });
    }, [setGameState, toast]);

    return { handleBuildWarehouse, handleUpgradeWarehouse, handleStoreItem, handleRetrieveItem };
}
