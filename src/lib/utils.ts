
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InventoryItem, PlanetType, PlayerShip, MarketItem } from "./types";
import { STATIC_ITEMS } from "./items";
import { SHIPS_FOR_SALE } from './ships';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades, droneUpgrades, powerCoreUpgrades, advancedUpgrades } from './upgrades';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateCurrentCargo(inventory: InventoryItem[]): number {
    if (!inventory) return 0;
    return inventory.reduce((acc, item) => {
        const staticItem = STATIC_ITEMS.find(si => si.name === item.name);
        return acc + (staticItem ? staticItem.cargoSpace * item.owned : 0);
    }, 0);
}

export function calculateShipValue(ship: PlayerShip): number {
    const baseData = SHIPS_FOR_SALE.find(s => s.id === ship.shipId);
    if (!baseData) return 0;
    
    let totalValue = baseData.cost;
    
    // Standard Upgrades
    totalValue += cargoUpgrades[ship.cargoLevel - 1]?.cost || 0;
    totalValue += weaponUpgrades[ship.weaponLevel - 1]?.cost || 0;
    totalValue += shieldUpgrades[ship.shieldLevel - 1]?.cost || 0;
    totalValue += hullUpgrades[ship.hullLevel - 1]?.cost || 0;
    totalValue += fuelUpgrades[ship.fuelLevel - 1]?.cost || 0;
    totalValue += sensorUpgrades[ship.sensorLevel - 1]?.cost || 0;
    totalValue += droneUpgrades[ship.droneLevel - 1]?.cost || 0;

    // Advanced Upgrades
    totalValue += powerCoreUpgrades[ship.powerCoreLevel - 1]?.cost || 0;
    
    const installedAdvanced = Object.keys(ship).filter(k => advancedUpgrades.some(au => au.id === k) && (ship as any)[k] === true);
    installedAdvanced.forEach(upgradeId => {
        const upgradeData = advancedUpgrades.find(u => u.id === upgradeId);
        if (upgradeData) {
            totalValue += upgradeData.cost;
        }
    });

    return totalValue;
}

export function calculateCargoValue(inventory: InventoryItem[], marketItems: MarketItem[]): number {
    return inventory.reduce((acc, item) => {
        const marketData = marketItems.find(mi => mi.name === item.name);
        // Use base price as a fallback if not in the current market
        const price = marketData?.currentPrice || STATIC_ITEMS.find(si => si.name === item.name)?.basePrice || 0;
        return acc + (item.owned * price);
    }, 0);
}

export const PLANET_TYPE_MODIFIERS: Record<PlanetType, number> = {
    'Terrestrial': 1.1,
    'Oceanic': 1.05,
    'Volcanic': 0.9,
    'Barren': 0.8,
    'Ice Giant': 0.95,
    'Gas Giant': 0.85,
};
