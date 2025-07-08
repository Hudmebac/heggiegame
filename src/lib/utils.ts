import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InventoryItem, PlanetType } from "./types";
import { STATIC_ITEMS } from "./items";


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

export const PLANET_TYPE_MODIFIERS: Record<PlanetType, number> = {
    'Terrestrial': 1.1,
    'Oceanic': 1.05,
    'Volcanic': 0.9,
    'Barren': 0.8,
    'Ice Giant': 0.95,
    'Gas Giant': 0.85,
};