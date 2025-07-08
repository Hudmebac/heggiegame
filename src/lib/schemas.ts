
import { z } from 'zod';

// Schemas for simulate-market-prices
export const MarketItemSchema = z.object({
  name: z.string().describe('The name of the item.'),
  currentPrice: z.number().describe('The current price of the item.'),
  supply: z.number().describe('The current supply of the item.'),
  demand: z.number().describe('The current demand for the item.'),
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

export const QuestSchema = z.object({
    title: z.string().describe("The title of the quest."),
    description: z.string().describe("A brief, engaging description of the quest."),
    reward: z.string().describe("The reward for completing the quest, e.g., '15,000 ¢' or 'Variable'."),
    type: z.enum(['Bounty', 'Daily', 'Quest', 'Objective']).describe("The type of the quest."),
    difficulty: z.enum(['Low', 'Medium', 'High']).describe("The difficulty of the quest."),
    tasks: z.array(QuestTaskSchema).optional().describe("For 'Objective' quests, an array of one or more tasks to complete."),
    timeLimit: z.number().optional().describe("For 'Objective' quests, the time limit in seconds to complete all tasks."),
});

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


// Schemas for resolve-casino-game
export const ResolveCasinoGameInputSchema = z.object({
    gameType: z.enum(['slots', 'table', 'poker', 'vip', 'sportsbook', 'lottery']).describe("The type of casino game being played."),
    stake: z.number().describe("The amount of credits the player is staking."),
    playerReputation: z.number().describe("The player's reputation score, which can slightly influence luck."),
});
export type ResolveCasinoGameInput = z.infer<typeof ResolveCasinoGameInputSchema>;

export const ResolveCasinoGameOutputSchema = z.object({
    didWin: z.boolean().describe("Whether the player won the game."),
    winnings: z.number().describe("The amount of credits won, excluding the initial stake. 0 if the player lost."),
    narrative: z.string().describe("A short, flavourful description of the game's outcome."),
    bonusWin: z.boolean().describe("Whether a special bonus was triggered."),
    bonusAmount: z.number().describe("The amount of bonus credits won. 0 if no bonus."),
});
export type ResolveCasinoGameOutput = z.infer<typeof ResolveCasinoGameOutputSchema>;
