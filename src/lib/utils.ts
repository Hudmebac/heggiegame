

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InventoryItem, PlanetType, PlayerShip, MarketItem, ItemCategory, SystemEconomy, SimulateMarketPricesOutput, PlayerStats, Stock } from "./types";
import { STATIC_ITEMS } from "./items";
import { SHIPS_FOR_SALE } from './ships';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades, droneUpgrades, powerCoreUpgrades, advancedUpgrades } from './upgrades';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompactNumber(number: number) {
    if (Math.abs(number) < 1000000) {
        return number.toLocaleString();
    }
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
    }).format(number);
}

export const ECONOMY_MULTIPLIERS: Record<ItemCategory, Record<SystemEconomy, number>> = {
    'Biological':   { 'Agricultural': 0.7, 'High-Tech': 1.2, 'Industrial': 1.3, 'Extraction': 1.1, 'Refinery': 1.2 },
    'Industrial':   { 'Agricultural': 1.3, 'High-Tech': 1.1, 'Industrial': 0.7, 'Extraction': 1.2, 'Refinery': 0.8 },
    'Pleasure':     { 'Agricultural': 1.1, 'High-Tech': 1.2, 'Industrial': 1.1, 'Extraction': 1.0, 'Refinery': 1.0 },
    'Food':         { 'Agricultural': 0.6, 'High-Tech': 1.2, 'Industrial': 1.3, 'Extraction': 1.4, 'Refinery': 1.2 },
    'Military':     { 'Agricultural': 1.4, 'High-Tech': 1.1, 'Industrial': 1.2, 'Extraction': 1.0, 'Refinery': 1.0 },
    'Technology':   { 'Agricultural': 1.3, 'High-Tech': 0.7, 'Industrial': 1.1, 'Extraction': 1.2, 'Refinery': 1.2 },
    'Minerals':     { 'Agricultural': 1.2, 'High-Tech': 1.1, 'Industrial': 0.9, 'Extraction': 0.7, 'Refinery': 0.8 },
    'Illegal':      { 'Agricultural': 1.1, 'High-Tech': 1.2, 'Industrial': 1.0, 'Extraction': 1.3, 'Refinery': 1.4 },
    'Marketing':    { 'Agricultural': 1.0, 'High-Tech': 1.0, 'Industrial': 1.0, 'Extraction': 1.0, 'Refinery': 1.0 },
    'Scientific':   { 'Agricultural': 1.2, 'High-Tech': 0.8, 'Industrial': 1.1, 'Extraction': 1.1, 'Refinery': 1.0 },
    'Robotic':      { 'Agricultural': 1.3, 'High-Tech': 0.9, 'Industrial': 0.8, 'Extraction': 1.2, 'Refinery': 1.1 },
};

export function calculatePrice(basePrice: number, supply: number, demand: number, economyMultiplier: number): number {
    if (supply <= 0) supply = 1;
    const demandFactor = demand / supply;
    const price = basePrice * economyMultiplier * Math.pow(demandFactor, 0.5);
    return Math.round(price);
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

export function calculateCargoValue(inventory: InventoryItem[], marketItems: (MarketItem[] | Stock[])): number {
    if (!inventory) return 0;
    return inventory.reduce((acc, item) => {
        const marketData = marketItems.find(mi => mi.name === item.name);
        // Use base price as a fallback if not in the current market
        const price = (marketData as MarketItem)?.currentPrice || (marketData as Stock)?.price || STATIC_ITEMS.find(si => si.name === item.name)?.basePrice || 0;
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

export function simulateMarket(
  items: MarketItem[],
  systemEconomy: SystemEconomy,
  systemVolatility: number,
  eventDescription?: string
): SimulateMarketPricesOutput {
  return items.map(item => {
    const staticItem = STATIC_ITEMS.find(si => si.name === item.name);
    if (!staticItem) return { name: item.name, newSupply: item.supply, newDemand: item.demand, reasoning: "No static data found." };

    let supplyChange = (Math.random() - 0.5) * 0.2 * systemVolatility; // Base volatility
    let demandChange = (Math.random() - 0.5) * 0.2 * systemVolatility;

    // Event logic
    if (eventDescription) {
      if (eventDescription.toLowerCase().includes('shortage') || eventDescription.toLowerCase().includes('blockade')) {
        supplyChange -= 0.25;
        demandChange += 0.20;
      }
      if (eventDescription.toLowerCase().includes('boom') || eventDescription.toLowerCase().includes('surplus') || eventDescription.toLowerCase().includes('breakthrough')) {
        supplyChange += 0.30;
        demandChange -= 0.20;
      }
      if (eventDescription.toLowerCase().includes(staticItem.category.toLowerCase())) {
        supplyChange += 0.1;
        demandChange += 0.1;
      }
    }
    
    // Economy influence
    const economyMultiplier = ECONOMY_MULTIPLIERS[staticItem.category]?.[systemEconomy] ?? 1.0;
    if (economyMultiplier < 1) { // System produces this
        supplyChange += 0.1;
    } else { // System consumes this
        demandChange += 0.1;
    }

    const newSupply = Math.round(Math.max(10, item.supply * (1 + supplyChange)));
    const newDemand = Math.round(Math.max(10, item.demand * (1 + demandChange)));

    return {
      name: item.name,
      newSupply,
      newDemand,
      reasoning: `Fluctuation based on ${systemEconomy} economy, volatility, and recent events.`,
    };
  });
}

export function syncActiveShipStats(playerStats: PlayerStats): PlayerStats {
    if (!playerStats.fleet || playerStats.fleet.length === 0) return playerStats;

    const activeShip = playerStats.fleet[0];
    const newStats = { ...playerStats };

    const cargoTier = cargoUpgrades[activeShip.cargoLevel - 1];
    newStats.maxCargo = cargoTier ? cargoTier.capacity : 0;
    newStats.cargoLevel = activeShip.cargoLevel;

    const weaponTier = weaponUpgrades[activeShip.weaponLevel - 1];
    newStats.weaponLevel = weaponTier ? weaponTier.level : 1;

    const shieldTier = shieldUpgrades[activeShip.shieldLevel - 1];
    newStats.shieldLevel = shieldTier ? shieldTier.level : 1;

    const hullTier = hullUpgrades[activeShip.hullLevel - 1];
    newStats.maxShipHealth = hullTier ? hullTier.health : 100;
    newStats.hullLevel = activeShip.hullLevel;

    const fuelTier = fuelUpgrades[activeShip.fuelLevel - 1];
    newStats.maxFuel = fuelTier ? fuelTier.capacity : 100;
    newStats.fuelLevel = activeShip.fuelLevel;

    const sensorTier = sensorUpgrades[activeShip.sensorLevel - 1];
    newStats.sensorLevel = sensorTier ? sensorTier.level : 1;
    
    const droneTier = droneUpgrades[activeShip.droneLevel - 1];
    newStats.droneLevel = droneTier ? droneTier.level : 1;

    newStats.powerCoreLevel = activeShip.powerCoreLevel;
    newStats.overdriveEngine = activeShip.overdriveEngine;
    newStats.warpStabilizer = activeShip.warpStabilizer;
    newStats.stealthPlating = activeShip.stealthPlating;
    newStats.targetingMatrix = activeShip.targetingMatrix;
    newStats.anomalyAnalyzer = activeShip.anomalyAnalyzer;
    newStats.fabricatorBay = activeShip.fabricatorBay;
    newStats.gravAnchor = activeShip.gravAnchor;
    newStats.aiCoreInterface = activeShip.aiCoreInterface;
    newStats.bioDomeModule = activeShip.bioDomeModule;
    newStats.flakDispensers = activeShip.flakDispensers;
    newStats.boardingTubeSystem = activeShip.boardingTubeSystem;
    newStats.terraformToolkit = activeShip.terraformToolkit;
    newStats.thermalRegulator = activeShip.thermalRegulator;
    newStats.diplomaticUplink = activeShip.diplomaticUplink;
    
    newStats.shipHealth = activeShip.health;
    newStats.fuel = Math.min(newStats.fuel || 0, newStats.maxFuel);

    return newStats;
}
