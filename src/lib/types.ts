

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

export type CasinoGameType = 'slots' | 'table' | 'poker' | 'vip' | 'sportsbook' | 'lottery';

export interface CasinoState {
    lastPlayed: { [key in CasinoGameType]?: number };
    dailyLotteryTicketPurchased: boolean;
}

export type ResidenceContract = BarContract;
export type CommerceContract = BarContract;
export type IndustryContract = BarContract;
export type ConstructionContract = BarContract;
export type RecreationContract = BarContract;
export type BankContract = BarContract;
export type BankPartner = BarPartner;


export interface PlayerShip {
  instanceId: number;
  shipId: string;
  name: string;
  weaponLevel: number;
  shieldLevel: number;
  hullLevel: number;
  fuelLevel: number;
  sensorLevel: number;
  cargoLevel: number;
  droneLevel: number;
}

export interface InsurancePolicies {
  health: boolean;
  cargo: boolean;
  ship: boolean;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Hardcore';

export interface Loan {
  principal: number;
  interestRate: number;
  totalRepayments: number;
  repaymentsMade: number;
  repaymentAmount: number;
  nextDueDate: number;
}

export interface CreditCard {
  limit: number;
  balance: number;
  dueDate?: number;
}

export interface PlayerStats {
  name: string;
  bio: string;
  netWorth: number;
  avatarUrl: string;
  pirateRisk: number;
  reputation: number;
  insurance: InsurancePolicies;

  fleet: PlayerShip[];

  // Stats of the ACTIVE ship (from fleet[0])
  fuel: number;
  maxFuel: number;
  cargo: number;
  maxCargo: number;
  shipHealth: number;
  maxShipHealth: number;
  weaponLevel: number;
  shieldLevel: number;
  hullLevel: number;
  fuelLevel: number;
  sensorLevel: number;
  cargoLevel: number;
  droneLevel: number;

  // Business stats
  barLevel: number;
  autoClickerBots: number;
  establishmentLevel: number;
  barContract?: BarContract;
  residenceLevel: number;
  residenceAutoClickerBots: number;
  residenceEstablishmentLevel: number;
  residenceContract?: ResidenceContract;
  commerceLevel: number;
  commerceAutoClickerBots: number;
  commerceEstablishmentLevel: number;
  commerceContract?: CommerceContract;
  industryLevel: number;
  industryAutoClickerBots: number;
  industryEstablishmentLevel: number;
  industryContract?: IndustryContract;
  constructionLevel: number;
  constructionAutoClickerBots: number;
  constructionEstablishmentLevel: number;
  constructionContract?: ConstructionContract;
  recreationLevel: number;
  recreationAutoClickerBots: number;
  recreationEstablishmentLevel: number;
  recreationContract?: RecreationContract;
  casino: CasinoState;

  // Bank Stats
  bankAccount?: { balance: number };
  bankShares: number;
  bankLevel: number;
  bankAutoClickerBots: number;
  bankEstablishmentLevel: number;
  bankContract?: BankContract;

  // Financial Instruments
  loan?: Loan;
  creditCard?: CreditCard;
  debt: number;
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

export type PlanetType = 'Terrestrial' | 'Gas Giant' | 'Ice Giant' | 'Barren' | 'Volcanic' | 'Oceanic';

export interface Planet {
  name: string;
  type: PlanetType;
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

export interface QuestTask {
    type: 'bar' | 'residence' | 'commerce' | 'industry' | 'construction' | 'recreation';
    target: number;
    description: string;
}

export interface Quest {
  title: string;
  description: string;
  reward: string;
  type: 'Bounty' | 'Daily' | 'Quest' | 'Objective';
  difficulty: 'Low' | 'Medium' | 'High';
  tasks?: QuestTask[];
  timeLimit?: number;
}

export interface ActiveObjective extends Quest {
    progress: { [key in QuestTask['type']]?: number };
    startTime: number;
}

export interface CrewMember {
    id: string;
    name: string;
    role: 'Engineer' | 'Gunner' | 'Navigator' | 'Negotiator';
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
  activeObjectives: ActiveObjective[];
  crew: CrewMember[];
  difficulty: Difficulty;
  isGameOver?: boolean;
}

export interface EncounterResult {
  outcome: 'success' | 'failure' | 'partial_success';
  narrative: string;
  cargoLost: number;
  creditsLost: number;
  damageTaken: number;
}

export interface CargoUpgrade {
  level: number;
  name: string;
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

export interface DroneUpgrade {
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
  baseCargo: number;
  baseFuel: number;
  baseHealth: number;
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
