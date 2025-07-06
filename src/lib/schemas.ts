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
  shipHealth: z.number().describe("The player's current ship health (0-100)."),
});
export type ResolvePirateEncounterInput = z.infer<typeof ResolvePirateEncounterInputSchema>;

export const ResolvePirateEncounterOutputSchema = z.object({
  outcome: z.enum(['success', 'failure', 'partial_success']).describe('The result of the encounter.'),
  narrative: z.string().describe('A dramatic, short description of what happened.'),
  cargoLost: z.number().describe('Amount of cargo units lost.'),
  creditsLost: z.number().describe('Amount of credits lost (from bribes or damages).'),
  damageTaken: z.number().describe('The amount of hull damage taken, from 0 to 100.'),
});
export type ResolvePirateEncounterOutput = z.infer<typeof ResolvePirateEncounterOutputSchema>;


// Schemas for generate-avatar
export const GenerateAvatarInputSchema = z.object({
  description: z.string().describe('A brief description of the desired avatar style. e.g., "grizzled male space pilot", "young female explorer with vibrant hair"'),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

export const GenerateAvatarOutputSchema = z.object({
  avatarDataUri: z.string().describe("The generated avatar image as a data URI."),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;


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
});
export type ScanPirateVesselInput = z.infer<typeof ScanPirateVesselInputSchema>;

export const ScanPirateVesselOutputSchema = z.object({
    scanReport: z.string().describe('A tactical report of the scan, providing hints about the pirate vessel.'),
});
export type ScanPirateVesselOutput = z.infer<typeof ScanPirateVesselOutputSchema>;

// Schemas for generate-bio
export const GenerateBioInputSchema = z.object({
  name: z.string().describe("The name of the captain."),
});
export type GenerateBioInput = z.infer<typeof GenerateBioInputSchema>;

export const GenerateBioOutputSchema = z.object({
  bio: z.string().describe("A short, flavourful biography for the space captain, based on their name."),
});
export type GenerateBioOutput = z.infer<typeof GenerateBioOutputSchema>;

// Schemas for generate-quests
export const QuestSchema = z.object({
    title: z.string().describe("The title of the quest."),
    description: z.string().describe("A brief, engaging description of the quest."),
    reward: z.string().describe("The reward for completing the quest, e.g., '15,000 ¢' or 'Variable'."),
    type: z.enum(['Bounty', 'Daily', 'Quest']).describe("The type of the quest."),
    difficulty: z.enum(['Low', 'Medium', 'High']).describe("The difficulty of the quest."),
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
});

export const GenerateTradersOutputSchema = z.object({
    traders: z.array(TraderSchema).describe("An array of 4 generated NPC traders for the leaderboard."),
});
export type GenerateTradersOutput = z.infer<typeof GenerateTradersOutputSchema>;
