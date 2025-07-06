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
}

export interface Item {
  name: string;
  currentPrice: number;
  supply: number;
  demand: number;
  cargoSpace: number;
  owned: number;
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

export interface System {
  name: string;
  x: number;
  y: number;
}

export interface Route {
  from: string;
  to: string;
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
  items: Item[];
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
  damageTaken: string;
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