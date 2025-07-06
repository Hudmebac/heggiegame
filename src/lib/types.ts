export type ItemCategory = 'Biological' | 'Industrial' | 'Pleasure' | 'Food' | 'Military' | 'Technology' | 'Minerals' | 'Illegal' | 'Marketing' | 'Scientific' | 'Robotic';
export type ItemRarity = 'Plentiful' | 'Common' | 'Accessible' | 'Uncommon' | 'Rare' | 'Ultra Rare' | 'Mythic';
export type ItemGrade = 'Salvaged' | 'Standard' | 'Refined' | 'Experimental' | 'Quantum' | 'Singularity';

export interface StaticItem {
  category: ItemCategory;
  name: string;
  grade: ItemGrade;
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

export interface BarPartner {
  name: string;
  percentage: number;
  investment: number;
}

export interface BarContract {
  currentMarketValue: number;
  valueHistory: number[];
  partners: BarPartner[];
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
  hullLevel: number;
  fuelLevel: number;
  sensorLevel: number;
  fleetSize: number;
  pirateRisk: number;
  shipHealth: number;
  maxShipHealth: number;
  reputation: number;
  barLevel: number;
  autoClickerBots: number;
  establishmentLevel: number;
  barContract?: BarContract;
}

export interface PriceHistory {
  [itemName:string]: number[];
}

export interface LeaderboardEntry {
  rank: number;
  trader: string;
  netWorth: number;
  fleetSize: number;
  bio?: string;
}

export interface Pirate {
  name: string;
  shipType: string;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  scanResult?: string;
}

export type SystemEconomy = 'Industrial' | 'Agricultural' | 'High-Tech' | 'Extraction' | 'Refinery';
export type ZoneType = 'Core World' | 'Frontier Outpost' | 'Mining Colony' | 'Trade Hub' | 'Corporate Zone' | 'Diplomatic Station' | 'Ancient Ruins';

export interface Planet {
  name: string;
  type: 'Terrestrial' | 'Gas Giant' | 'Ice Giant' | 'Barren' | 'Volcanic' | 'Oceanic';
  description: string;
}

export interface System {
  name: string;
  x: number;
  y: number;
  security: 'High' | 'Medium' | 'Low' | 'Anarchy';
  economy: SystemEconomy;
  volatility: number;
  zoneType: ZoneType;
  description: string;
  planets: Planet[];
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

export interface CrewMember {
  id: string;
  name: string;
  role: 'Engineer' | 'Navigator' | 'Gunner' | 'Negotiator';
  description: string;
  salary: number;
  hiringFee: number;
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
  currentPlanet: string;
  quests: Quest[];
  crew: CrewMember[];
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

export interface HullUpgrade {
  level: number;
  name: string;
  health: number;
  cost: number;
}

export interface FuelUpgrade {
    level: number;
    name: string;
    capacity: number;
    cost: number;
}

export interface SensorUpgrade {
    level: number;
    name: string;
    cost: number;
}

export interface ShipUpgradeSlots {
  [key: string]: number;
}

export interface ShipForSale {
  id: string;
  name: string;
  type: string;
  designation: string;
  manufacturer: string;
  description: string;
  cost: number;
  crewCapacity: number;
  cargo: number;
  fuel: number;
  health: number;
  defenseRating: number;
  speedRating: number;
  shieldEmitterSlots: number;
  engineClass: string;
  upgradeSlots: ShipUpgradeSlots;
  recommendedUse: string;
  heggieClearance: string;
}

export interface PartnershipOffer {
  partnerName: string;
  stakePercentage: number;
  cashOffer: number;
  dealDescription: string;
}
