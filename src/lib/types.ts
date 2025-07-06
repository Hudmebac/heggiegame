export type ItemCategory = 'Biological' | 'Industrial' | 'Pleasure' | 'Food' | 'Military' | 'Technology' | 'Minerals' | 'Illegal';
export type ItemRarity = 'Plentiful' | 'Common' | 'Accessible' | 'Uncommon' | 'Rare' | 'Ultra Rare';

export interface StaticItem {
  category: ItemCategory;
  name: string;
  rarity: ItemRarity;
  description: string;
  detail: string;
  basePrice: number;
  cargoSpace: number;
}

export interface MarketItem {
  name: string;
  currentPrice: number;
  supply: number;
  demand: number;
}

export interface InventoryItem {
    name: string;
    owned: number;
}

export interface PlayerStats {
  name: string;
  bio: string;
  netWorth: number;
  fuel: number;
  maxFuel: number;
  cargo: number;
  maxCargo: number;
  insurance: boolean;
  avatarUrl: string;
  weaponLevel: number;
  shieldLevel: number;
  fleetSize: number;
  pirateRisk: number;
  shipHealth: number;
  maxShipHealth: number;
}

export interface PriceHistory {
  [itemName:string]: number[];
}

export interface LeaderboardEntry {
  rank: number;
  trader: string;
  netWorth: number;
  fleetSize: number;
}

export interface Pirate {
  name: string;
  shipType: string;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  scanResult?: string;
}

export type SystemEconomy = 'Industrial' | 'Agricultural' | 'High-Tech' | 'Extraction' | 'Refinery';

export interface System {
  name: string;
  x: number;
  y: number;
  security: 'High' | 'Medium' | 'Low' | 'Anarchy';
  economy: SystemEconomy;
  volatility: number;
}

export interface Quest {
  title: string;
  description: string;
  reward: string;
  type: 'Bounty' | 'Daily' | 'Quest';
  difficulty: 'Low' | 'Medium' | 'High';
}

export interface GameState {
  playerStats: PlayerStats;
  inventory: InventoryItem[];
  marketItems: MarketItem[];
  priceHistory: PriceHistory;
  leaderboard: LeaderboardEntry[];
  pirateEncounter: Pirate | null;
  systems: System[];
  routes: Route[];
  currentSystem: string;
  quests: Quest[];
}

export interface EncounterResult {
  outcome: 'success' | 'failure' | 'partial_success';
  narrative: string;
  cargoLost: number;
  creditsLost: number;
  damageTaken: number;
}

export interface CargoUpgrade {
  capacity: number;
  cost: number;
}

export interface WeaponUpgrade {
  level: number;
  name: string;
  cost: number;
}

export interface ShieldUpgrade {
  level: number;
  name: string;
  cost: number;
}
