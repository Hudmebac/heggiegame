

import { z } from 'zod';

// Schemas for simulate-market-prices
export const MarketItemSchema = z.object({
  name: z.string().describe('The name of the item.'),
  currentPrice: z.number().describe('The current price of the item.'),
  supply: z.number().describe('The current supply of the item.'),
  demand: z.number().describe('The current demand of the item.'),
});

export const SimulateMarketPricesInputSchema = z.object({
  items: z.array(MarketItemSchema).describe('An array of items with their current market data.'),
  systemEconomy: z.string().describe('The primary economy of the current system (e.g., Industrial, Agricultural).'),
  systemVolatility: z.number().describe('A factor (0-1) representing the market volatility of the system.'),
  eventDescription: z
    .string()
    .optional()
    .describe('An optional description of a recent in-game event that may affect market prices.'),
});
export type SimulateMarketPricesInput = z.infer<typeof SimulateMarketPricesInputSchema>;

export const SimulateMarketPricesOutputSchema = z.array(
  z.object({
    name: z.string().describe('The name of the item.'),
    newSupply: z.number().describe('The new simulated supply level for the item.'),
    newDemand: z.number().describe('The new simulated demand level for the item.'),
    reasoning: z.string().describe('The reasoning behind the supply/demand change.'),
  })
);
export type SimulateMarketPricesOutput = z.infer<typeof SimulateMarketPricesOutputSchema>;


// Schemas for resolve-pirate-encounter
export const ResolvePirateEncounterInputSchema = z.object({
  action: z.enum(['fight', 'evade', 'bribe']).describe("The player's chosen action."),
  playerNetWorth: z.number().describe("The player's current net worth in credits."),
  playerCargo: z.number().describe("The amount of cargo the player is currently carrying."),
  pirateName: z.string().describe('The name of the pirate.'),
  pirateThreatLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The threat level of the pirate.'),
  hasGunner: z.boolean().describe("Whether the player has a gunner in their crew, improving combat effectiveness."),
  hasNegotiator: z.boolean().describe("Whether the player has a negotiator in their crew, improving bribe outcomes."),
  shipHealth: z.number().describe("The player's current ship health (0-100)."),
  weaponLevel: z.number().describe("The player's current weapon upgrade level."),
  shieldLevel: z.number().describe("The player's current shield upgrade level."),
});
export type ResolvePirateEncounterInput = z.infer<typeof ResolvePirateEncounterInputSchema>;

export const ResolvePirateEncounterOutputSchema = z.object({
  outcome: z.enum(['success', 'failure', 'partial_success']).describe('The result of the encounter.'),
  narrative: z.string().describe('A dramatic, short description of what happened.'),
  cargoLost: z.number().describe('Amount of cargo units lost.'),
  creditsLost: z.number().describe('Amount of credits lost (from bribes or repairs).'),
  damageTaken: z.number().describe('The amount of hull damage taken, from 0 to 100.'),
});
export type ResolvePirateEncounterOutput = z.infer<typeof ResolvePirateEncounterOutputSchema>;


// Schemas for generate-game-event
export const GenerateGameEventOutputSchema = z.object({
  eventDescription: z.string().describe('A short, dramatic description of an in-game event that could affect market prices.'),
});
export type GenerateGameEventOutput = z.infer<typeof GenerateGameEventOutputSchema>;

// Schemas for scan-pirate-vessel
export const ScanPirateVesselInputSchema = z.object({
  pirateName: z.string().describe('The name of the pirate.'),
  pirateShipType: z.string().describe('The type of the pirate ship.'),
  pirateThreatLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The threat level of the pirate.'),
  sensorLevel: z.number().describe("The player's current sensor upgrade level."),
});
export type ScanPirateVesselInput = z.infer<typeof ScanPirateVesselInputSchema>;

export const ScanPirateVesselOutputSchema = z.object({
    scanReport: z.string().describe('A tactical report of the scan, providing hints about the pirate vessel.'),
});
export type ScanPirateVesselOutput = z.infer<typeof ScanPirateVesselOutputSchema>;

// Schemas for generate-quests
export const QuestTaskSchema = z.object({
    type: z.enum(['bar', 'residence', 'commerce', 'industry', 'construction', 'recreation']).describe("The type of business operation related to the task."),
    target: z.number().describe("The number of actions required to complete the task."),
    description: z.string().describe("A player-facing description of the task, e.g., 'Serve Patrons' or 'Fulfil Industry Orders'."),
});

const BaseQuestSchema = z.object({
    title: z.string().describe("The title of the quest."),
    description: z.string().describe("A brief, engaging description of the quest."),
    reward: z.string().describe("The reward for completing the quest, e.g., '15,000 ¢' or 'Variable'."),
    difficulty: z.enum(['Low', 'Medium', 'High']).describe("The difficulty of the quest."),
});

const NonObjectiveQuestSchema = BaseQuestSchema.extend({
    type: z.enum(['Bounty', 'Daily', 'Quest']).describe("The type of the quest."),
});

const ObjectiveQuestSchema = BaseQuestSchema.extend({
    type: z.literal('Objective').describe("The type of the quest."),
    tasks: z.array(QuestTaskSchema).min(1).describe("An array of one or more tasks to complete for the objective."),
    timeLimit: z.number().describe("The time limit in seconds to complete all tasks."),
});

export const QuestSchema = z.discriminatedUnion("type", [
    NonObjectiveQuestSchema,
    ObjectiveQuestSchema,
]);

export const GenerateQuestsOutputSchema = z.object({
    quests: z.array(QuestSchema).describe("An array of generated quests."),
});
export type GenerateQuestsOutput = z.infer<typeof GenerateQuestsOutputSchema>;

// Schemas for generate-traders
export const TraderSchema = z.object({
    name: z.string().describe("The full name or callsign of the trader."),
    netWorth: z.number().describe("The estimated net worth of the trader in credits."),
    fleetSize: z.number().describe("The number of ships in the trader's fleet."),
    bio: z.string().describe("A short, 1-2 sentence, flavourful biography for the trader. Make it interesting and fit the sci-fi tone."),
});

export const GenerateTradersOutputSchema = z.object({
    traders: z.array(TraderSchema).describe("An array of 4 generated NPC traders for the leaderboard."),
});
export type GenerateTradersOutput = z.infer<typeof GenerateTradersOutputSchema>;

// Schemas for resolve-casino-game
export const CasinoGameTypeSchema = z.enum(['slots', 'table', 'poker', 'vip', 'sportsbook', 'lottery', 'droneRacing', 'spaceRoulette', 'gravityWorldCup']);

export const ResolveCasinoGameInputSchema = z.object({
  gameType: CasinoGameTypeSchema.describe('The type of casino game being played.'),
  stake: z.number().describe('The amount of credits the player is staking.'),
  playerReputation: z.number().describe("The player's reputation score, which can influence luck."),
});
export type ResolveCasinoGameInput = z.infer<typeof ResolveCasinoGameInputSchema>;

export const ResolveCasinoGameOutputSchema = z.object({
  win: z.boolean().describe('Whether the player won the game.'),
  winnings: z.number().describe('The total amount of credits won (0 if lost).'),
  bonusWin: z.boolean().describe('Whether the player won a special bonus prize.'),
  bonusAmount: z.number().describe('The amount of the bonus prize, if applicable.'),
  narrative: z.string().describe('A short, flavourful description of the game outcome.'),
});
export type ResolveCasinoGameOutput = z.infer<typeof ResolveCasinoGameOutputSchema>;

// Schemas for generate-partnership-offers
export const GeneratePartnershipOffersInputSchema = z.object({
  marketValue: z.number().describe("The current market value of the player's establishment."),
});
export type GeneratePartnershipOffersInput = z.infer<typeof GeneratePartnershipOffersInputSchema>;

export const PartnershipOfferSchema = z.object({
  partnerName: z.string().describe("The name of the potential partner corporation or faction."),
  stakePercentage: z.number().describe("The percentage of the stake they want to purchase (e.g., 0.1 for 10%)."),
  cashOffer: z.number().describe("The amount of credits offered for the stake."),
  dealDescription: z.string().describe("A short, flavourful description of the deal and the partner's reputation."),
});
export type PartnershipOffer = z.infer<typeof PartnershipOfferSchema>;

export const GeneratePartnershipOffersOutputSchema = z.object({
    offers: z.array(PartnershipOfferSchema).describe("An array of generated partnership offers."),
});
export type GeneratePartnershipOffersOutput = z.infer<typeof GeneratePartnershipOffersOutputSchema>;

// Schemas for generate-residence-partnership-offers
export const GenerateResidencePartnershipOffersInputSchema = z.object({
  marketValue: z.number().describe("The current market value of the player's residence."),
});
export type GenerateResidencePartnershipOffersInput = z.infer<typeof GenerateResidencePartnershipOffersInputSchema>;

export const ResidencePartnershipOfferSchema = PartnershipOfferSchema;
export type ResidencePartnershipOffer = z.infer<typeof ResidencePartnershipOfferSchema>;

export const GenerateResidencePartnershipOffersOutputSchema = z.object({
    offers: z.array(ResidencePartnershipOfferSchema).describe("An array of generated partnership offers for the residence."),
});
export type GenerateResidencePartnershipOffersOutput = z.infer<typeof GenerateResidencePartnershipOffersOutputSchema>;

// Schemas for generate-commerce-partnership-offers
export const GenerateCommercePartnershipOffersInputSchema = z.object({
  marketValue: z.number().describe("The current market value of the player's commerce hub."),
});
export type GenerateCommercePartnershipOffersInput = z.infer<typeof GenerateCommercePartnershipOffersInputSchema>;

export const CommercePartnershipOfferSchema = PartnershipOfferSchema;
export type CommercePartnershipOffer = z.infer<typeof CommercePartnershipOfferSchema>;

export const GenerateCommercePartnershipOffersOutputSchema = z.object({
    offers: z.array(CommercePartnershipOfferSchema).describe("An array of generated partnership offers for the commerce hub."),
});
export type GenerateCommercePartnershipOffersOutput = z.infer<typeof GenerateCommercePartnershipOffersOutputSchema>;

// Schemas for generate-industry-partnership-offers
export const GenerateIndustryPartnershipOffersInputSchema = z.object({
  marketValue: z.number().describe("The current market value of the player's industrial facility."),
});
export type GenerateIndustryPartnershipOffersInput = z.infer<typeof GenerateIndustryPartnershipOffersInputSchema>;

export const IndustryPartnershipOfferSchema = PartnershipOfferSchema;
export type IndustryPartnershipOffer = z.infer<typeof IndustryPartnershipOfferSchema>;

export const GenerateIndustryPartnershipOffersOutputSchema = z.object({
    offers: z.array(IndustryPartnershipOfferSchema).describe("An array of generated partnership offers for the industrial facility."),
});
export type GenerateIndustryPartnershipOffersOutput = z.infer<typeof GenerateIndustryPartnershipOffersOutputSchema>;

// Schemas for generate-construction-partnership-offers
export const GenerateConstructionPartnershipOffersInputSchema = z.object({
  marketValue: z.number().describe("The current market value of the player's construction project."),
});
export type GenerateConstructionPartnershipOffersInput = z.infer<typeof GenerateConstructionPartnershipOffersInputSchema>;

export const ConstructionPartnershipOfferSchema = PartnershipOfferSchema;
export type ConstructionPartnershipOffer = z.infer<typeof ConstructionPartnershipOfferSchema>;

export const GenerateConstructionPartnershipOffersOutputSchema = z.object({
    offers: z.array(ConstructionPartnershipOfferSchema).describe("An array of generated partnership offers for the construction project."),
});
export type GenerateConstructionPartnershipOffersOutput = z.infer<typeof GenerateConstructionPartnershipOffersOutputSchema>;

// Schemas for generate-recreation-partnership-offers
export const GenerateRecreationPartnershipOffersInputSchema = z.object({
  marketValue: z.number().describe("The current market value of the player's recreation facility."),
});
export type GenerateRecreationPartnershipOffersInput = z.infer<typeof GenerateRecreationPartnershipOffersInputSchema>;

export const RecreationPartnershipOfferSchema = PartnershipOfferSchema;
export type RecreationPartnershipOffer = z.infer<typeof RecreationPartnershipOfferSchema>;

export const GenerateRecreationPartnershipOffersOutputSchema = z.object({
    offers: z.array(RecreationPartnershipOfferSchema).describe("An array of generated partnership offers for the recreation facility."),
});
export type GenerateRecreationPartnershipOffersOutput = z.infer<typeof GenerateRecreationPartnershipOffersOutputSchema>;

// Schemas for generate-bank-partnership-offers
export const GenerateBankPartnershipOffersInputSchema = z.object({
  marketValue: z.number().describe("The current market value of the player's bank."),
});
export type GenerateBankPartnershipOffersInput = z.infer<typeof GenerateBankPartnershipOffersInputSchema>;

export const BankPartnershipOfferSchema = PartnershipOfferSchema;
export type BankPartnershipOffer = z.infer<typeof BankPartnershipOfferSchema>;

export const GenerateBankPartnershipOffersOutputSchema = z.object({
    offers: z.array(BankPartnershipOfferSchema).describe("An array of generated partnership offers for the bank."),
});
export type GenerateBankPartnershipOffersOutput = z.infer<typeof GenerateBankPartnershipOffersOutputSchema>;

// Schemas for generate-trade-contracts
export const TradeRouteContractSchema = z.object({
  id: z.string().describe("A unique identifier for the contract."),
  fromSystem: z.string().describe("The starting system for the contract."),
  toSystem: z.string().describe("The destination system for the contract."),
  cargo: z.string().describe("The name of the commodity to be transported."),
  quantity: z.number().describe("The amount of the commodity to be transported."),
  payout: z.number().describe("The credit payout upon successful completion."),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).describe("The assessed risk level of the route."),
  duration: z.number().describe("The estimated duration of the contract in seconds."),
  status: z.enum(['Available', 'Active', 'Completed', 'Failed']).describe("The current status of the contract."),
});
export type TradeRouteContract = z.infer<typeof TradeRouteContractSchema>;

// Schemas for generate-taxi-missions
export const TaxiMissionSchema = z.object({
  id: z.string().describe("A unique identifier for the mission."),
  passengerName: z.string().describe("The name of the passenger or client."),
  description: z.string().describe("A short, flavourful description of the mission and the passenger."),
  fromSystem: z.string().describe("The starting system for the mission."),
  toSystem: z.string().describe("The destination system for the mission."),
  fare: z.number().describe("The base credit payout for successful completion."),
  bonus: z.number().describe("A potential bonus payout for exceptional service (e.g., speed, no incidents)."),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).describe("The assessed risk level of the route, which may involve pirate threats or difficult navigation."),
  duration: z.number().describe("The estimated duration of the trip in seconds."),
  status: z.enum(['Available', 'Active', 'Completed', 'Failed']).describe("The current status of the mission."),
});
export type TaxiMission = z.infer<typeof TaxiMissionSchema>;

// Schemas for generate-escort-missions
export const EscortMissionSchema = z.object({
  id: z.string().describe("A unique identifier for the mission."),
  clientName: z.string().describe("A creative name for the client or vessel being escorted."),
  missionType: z.enum(['VIP Escort', 'Cargo Convoy', 'Data Runner']).describe("The category of the escort mission."),
  description: z.string().describe("A short, flavourful description of the escort target and why they need protection."),
  fromSystem: z.string().describe("The starting system for the mission."),
  toSystem: z.string().describe("The destination system for the mission."),
  payout: z.number().describe("The credit payout upon successful completion."),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).describe("The assessed risk level of the route."),
  duration: z.number().describe("The estimated duration of the trip in seconds."),
  status: z.enum(['Available', 'Active', 'Completed', 'Failed']).describe("The current status of the mission."),
});
export type EscortMission = z.infer<typeof EscortMissionSchema>;

export const GenerateEscortMissionsInputSchema = z.object({
  reputation: z.number().describe("The player's current reputation score."),
  currentSystem: z.string().describe("The player's current star system."),
});
export type GenerateEscortMissionsInput = z.infer<typeof GenerateEscortMissionsInputSchema>;

export const GenerateEscortMissionsOutputSchema = z.object({
    missions: z.array(EscortMissionSchema).describe("An array of 4-5 generated escort missions."),
});
export type GenerateEscortMissionsOutput = z.infer<typeof GenerateEscortMissionsOutputSchema>;


// Schemas for generate-military-missions
export const MilitaryMissionSchema = z.object({
  id: z.string().describe("A unique identifier for the mission."),
  title: z.string().describe("A codename or official title for the mission."),
  missionType: z.enum(['Strike', 'Raid', 'Recon', 'Assassination']).describe("The category of the military operation."),
  description: z.string().describe("A short, tactical briefing of the mission objectives."),
  target: z.string().describe("The primary target of the mission (e.g., a specific ship, station, or individual)."),
  system: z.string().describe("The star system where the mission will take place."),
  payout: z.number().describe("The credit payout upon successful completion."),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).describe("The assessed risk level of the operation."),
  duration: z.number().describe("The estimated duration of the mission in seconds."),
  status: z.enum(['Available', 'Active', 'Completed', 'Failed']).describe("The current status of the mission."),
});
export type MilitaryMission = z.infer<typeof MilitaryMissionSchema>;

export const GenerateMilitaryMissionsInputSchema = z.object({
  reputation: z.number().describe("The player's current reputation score."),
  currentSystem: z.string().describe("The player's current star system."),
});
export type GenerateMilitaryMissionsInput = z.infer<typeof GenerateMilitaryMissionsInputSchema>;

export const GenerateMilitaryMissionsOutputSchema = z.object({
    missions: z.array(MilitaryMissionSchema).describe("An array of 4-5 generated military missions."),
});
export type GenerateMilitaryMissionsOutput = z.infer<typeof GenerateMilitaryMissionsOutputSchema>;

// Schemas for generate-diplomatic-missions
export const DiplomaticMissionSchema = z.object({
  id: z.string().describe("A unique identifier for the mission."),
  title: z.string().describe("The official title of the diplomatic mission."),
  missionType: z.enum(['Treaty', 'Mediation', 'Investigation']).describe("The nature of the diplomatic task."),
  description: z.string().describe("A short, formal description of the mission objectives and context."),
  system: z.string().describe("The star system where the mission will primarily take place."),
  stakeholders: z.array(z.string()).describe("A list of the key factions or individuals involved."),
  payoutCredits: z.number().describe("The credit reward upon successful completion."),
  payoutInfluence: z.number().describe("The influence points awarded upon successful completion."),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).describe("The political and physical risk level of the mission."),
  duration: z.number().describe("The estimated duration of the mission in seconds."),
  status: z.enum(['Available', 'Active', 'Completed', 'Failed']).describe("The current status of the mission."),
});
export type DiplomaticMission = z.infer<typeof DiplomaticMissionSchema>;

export const GenerateDiplomaticMissionsInputSchema = z.object({
  influence: z.number().describe("The player's current influence score."),
  currentSystem: z.string().describe("The player's current star system."),
});
export type GenerateDiplomaticMissionsInput = z.infer<typeof GenerateDiplomaticMissionsInputSchema>;

export const GenerateDiplomaticMissionsOutputSchema = z.object({
    missions: z.array(DiplomaticMissionSchema).describe("An array of 4-5 generated diplomatic missions."),
});
export type GenerateDiplomaticMissionsOutput = z.infer<typeof GenerateDiplomaticMissionsOutputSchema>;


export const GenerateTradeContractsInputSchema = z.object({
    reputation: z.number().describe("The player's current reputation score."),
    currentSystem: z.string().describe("The player's current star system."),
});
export type GenerateTradeContractsInput = z.infer<typeof GenerateTradeContractsInputSchema>;

export const GenerateTradeContractsOutputSchema = z.object({
    contracts: z.array(TradeRouteContractSchema).describe("An array of 4-5 generated trade route contracts."),
});
export type GenerateTradeContractsOutput = z.infer<typeof GenerateTradeContractsOutputSchema>;

export const GenerateTaxiMissionsInputSchema = z.object({
    reputation: z.number().describe("The player's current reputation score."),
    currentSystem: z.string().describe("The player's current star system."),
});
export type GenerateTaxiMissionsInput = z.infer<typeof GenerateTaxiMissionsInputSchema>;

export const GenerateTaxiMissionsOutputSchema = z.object({
    missions: z.array(TaxiMissionSchema).describe("An array of 4-5 generated taxi missions."),
});
export type GenerateTaxiMissionsOutput = z.infer<typeof GenerateTaxiMissionsOutputSchema>;


// Schemas for negotiate-trade-route
export const NegotiateTradeRouteInputSchema = z.object({
  fromSystem: z.string().describe("The starting system of the new trade route."),
  toSystem: z.string().describe("The destination system of the new trade route."),
  negotiationScore: z.number().min(0).max(100).describe("A score from 0 to 100 representing the player's performance in a negotiation minigame. 100 is a perfect score."),
});
export type NegotiateTradeRouteInput = z.infer<typeof NegotiateTradeRouteInputSchema>;

export const NegotiateTradeRouteOutputSchema = z.object({
  cost: z.number().describe("The final cost in credits to establish the trade route, determined by the negotiation score."),
  narrative: z.string().describe("A short, flavourful narrative describing the outcome of the negotiation."),
});
export type NegotiateTradeRouteOutput = z.infer<typeof NegotiateTradeRouteOutputSchema>;
