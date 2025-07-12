

export type Career = 'Hauler' | 'Taxi Pilot' | 'Landlord' | 'Trader' | 'Defender' | 'Fighter' | 'Galactic Official' | 'Heggie Contractor' | 'Unselected';
export type ItemCategory = 'Biological' | 'Industrial' | 'Pleasure' | 'Food' | 'Military' | 'Technology' | 'Minerals' | 'Illegal' | 'Marketing' | 'Scientific' | 'Robotic';
export type ItemRarity = 'Plentiful' | 'Common' | 'Accessible' | 'Uncommon' | 'Rare' | 'Ultra Rare' | 'Mythic';
export type ItemGrade = 'Salvaged' | 'Standard' | 'Refined' | 'Experimental' | 'Quantum' | 'Singularity';
export type FactionId = 'Independent' | 'Federation of Sol' | 'Corporate Hegemony' | 'Veritas Concord' | 'Frontier Alliance' | 'Independent Miners Guild';
export type StockCategory = 'Technology' | 'Industrial' | 'Ship Manufacturing' | 'Finance' | 'Consumer Services' | 'Real Estate' | 'Energy' | 'Medical';

export type GameEventType = 'Trade' | 'Combat' | 'Upgrade' | 'Mission' | 'System' | 'Career' | 'Faction' | 'Purchase';

export interface GameEvent {
  id: string;
  timestamp: number;
  type: GameEventType;
  description: string;
  value: number; // e.g., trade profit, mission reward, upgrade cost
  isMilestone: boolean;
  reputationChange?: number;
}

export interface AssetSnapshot {
  timestamp: number;
  totalNetWorth: number;
  cash: number;
  bankBalance: number;
  fleetValue: number;
  cargoValue: number;
  realEstateValue: number;
  sharePortfolioValue: number;
}


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

export interface Stock {
  id: string;
  name: string;
  category: StockCategory;
  price: number;
  history: number[];
  changePercent: number;
  lastUpdated: number;
  totalShares: number;
  sharesAvailable: number | null;
}

export interface PortfolioItem {
    id: string;
    shares: number;
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

export type CasinoGameType = 'slots' | 'table' | 'poker' | 'vip' | 'sportsbook' | 'lottery' | 'droneRacing' | 'spaceRoulette' | 'gravityWorldCup';

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

export interface BankAccount {
    balance: number;
    interestRate: number; // Player-set interest rate if they are majority shareholder
    sharePrice: number;
    sharePriceHistory: number[];
    lastFluctuation: number; // timestamp
}

export interface PlayerShip {
  instanceId: number;
  shipId: string;
  name: string;
  health: number;
  status: 'operational' | 'repair_needed';
  weaponLevel: number;
  shieldLevel: number;
  hullLevel: number;
  fuelLevel: number;
  sensorLevel: number;
  cargoLevel: number;
  droneLevel: number;
  powerCoreLevel: number;
  overdriveEngine: boolean;
  warpStabilizer: boolean;
  stealthPlating: boolean;
  targetingMatrix: boolean;
  anomalyAnalyzer: boolean;
  fabricatorBay: boolean;
  gravAnchor: boolean;
  aiCoreInterface: boolean;
  bioDomeModule: boolean;
  flakDispensers: boolean;
  boardingTubeSystem: boolean;
  terraformToolkit: boolean;
  thermalRegulator: boolean;
  diplomaticUplink: boolean;
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

export interface TradeRouteContract {
  id: string;
  fromSystem: string;
  toSystem: string;
  cargo: string;
  quantity: number;
  payout: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Available' | 'Active' | 'Completed' | 'Failed';
  progress?: number; // 0-100 for active routes
  startTime?: number; // To calculate progress
  duration: number; // in seconds
  assignedShipInstanceId?: number | null;
  assignedShipName?: string
}

export interface TaxiMission {
  id: string;
  passengerName: string;
  description: string;
  fromSystem: string;
  toSystem: string;
  fare: number;
  bonus: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Available' | 'Active' | 'Completed' | 'Failed';
  progress?: number;
  startTime?: number;
  duration: number;
}

export interface EscortMission {
  id: string;
  clientName: string;
  missionType: 'VIP Escort' | 'Cargo Convoy' | 'Data Runner';
  description: string;
  fromSystem: string;
  toSystem: string;
  payout: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Available' | 'Active' | 'Completed' | 'Failed';
  progress?: number;
  startTime?: number;
  duration: number;
  assignedShipInstanceId?: number | null;
  assignedShipName?: string;
}

export interface MilitaryMission {
  id: string;
  title: string;
  missionType: 'Strike' | 'Raid' | 'Recon' | 'Assassination';
  description: string;
  target: string;
  system: string;
  payout: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Available' | 'Active' | 'Completed' | 'Failed';
  progress?: number;
  startTime?: number;
  duration: number;
}

export interface DiplomaticMission {
  id: string;
  title: string;
  missionType: 'Treaty' | 'Mediation' | 'Investigation';
  description: string;
  system: string;
  stakeholders: string[];
  payoutCredits: number;
  payoutInfluence: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Available' | 'Active' | 'Completed' | 'Failed';
  progress?: number;
  startTime?: number;
  duration: number;
}

export interface Warehouse {
  systemName: string;
  level: number;
  capacity: number;
  storage: InventoryItem[];
}

export interface PlayerStats {
  name: string;
  bio: string;
  netWorth: number;
  avatarUrl: string;
  career: Career;
  faction: FactionId;
  factionReputation: Record<FactionId, number>;
  influence: number;
  inspiration: number;
  pirateRisk: number;
  reputation: number;
  insurance: InsurancePolicies;
  warehouses: Warehouse[];
  events: GameEvent[];
  assetHistory: AssetSnapshot[];
  cashInHandHistory: number[];
  usedPromoCodes: string[];
  negotiationCooldowns: Record<string, number>;
  lastFacebookShare?: number;
  lastWhatsappShare?: number;
  cargoValueHistory: number[];
  stardate: string;
  portfolio: PortfolioItem[];
  stocks: Stock[];

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
  powerCoreLevel: number;
  overdriveEngine: boolean;
  warpStabilizer: boolean;
  stealthPlating: boolean;
  targetingMatrix: boolean;
  anomalyAnalyzer: boolean;
  fabricatorBay: boolean;
  gravAnchor: boolean;
  aiCoreInterface: boolean;
  bioDomeModule: boolean;
  flakDispensers: boolean;
  boardingTubeSystem: boolean;
  terraformToolkit: boolean;
  thermalRegulator: boolean;
  diplomaticUplink: boolean;

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
  bankAccount?: BankAccount;
  bankShares: number;
  bankLevel: number;
  bankAutoClickerBots: number;
  bankEstablishmentLevel: number;
  bankContract?: BankContract;

  // Financial Instruments
  loan?: Loan;
  creditCard?: CreditCard;
  debt: number;

  // Career Specific
  tradeContracts: TradeRouteContract[];
  taxiMissions: TaxiMission[];
  escortMissions: EscortMission[];
  militaryMissions: MilitaryMission[];
  diplomaticMissions: DiplomaticMission[];
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
  missionId?: string;
  missionType?: 'escort' | 'trade' | 'taxi' | 'military';
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
  faction: string;
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

export interface NegotiateTradeRouteOutput {
    cost: number;
    narrative: string;
}
