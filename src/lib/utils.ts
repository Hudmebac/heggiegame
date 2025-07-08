import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InventoryItem } from "./types";
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
