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
  [itemName: string]: number[];
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

export interface GameState {
  playerStats: PlayerStats;
  items: Item[];
  priceHistory: PriceHistory;
  leaderboard: LeaderboardEntry[];
  pirateEncounter: Pirate | null;
  systems: System[];
  routes: Route[];
  currentSystem: string;
}

export interface EncounterResult {
  outcome: 'success' | 'failure' | 'partial_success';
  narrative: string;
  cargoLost: number;
  creditsLost: number;
  damageTaken: string;
}
