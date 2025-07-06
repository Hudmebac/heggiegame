export interface PlayerStats {
  netWorth: number;
  fuel: number;
  maxFuel: number;
  cargo: number;
  maxCargo: number;
  insurance: boolean;
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
}

export interface GameState {
  playerStats: PlayerStats;
  items: Item[];
  priceHistory: PriceHistory;
  leaderboard: LeaderboardEntry[];
  pirateEncounter: Pirate | null;
}
