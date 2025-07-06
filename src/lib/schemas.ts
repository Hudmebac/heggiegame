import { z } from 'zod';

// Schemas for simulate-market-prices
export const SimulateMarketPricesInputSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().describe('The name of the item.'),
        currentPrice: z.number().describe('The current price of the item.'),
        supply: z.number().describe('The current supply of the item.'),
        demand: z.number().describe('The current demand for the item.'),
      })
    )
    .describe('An array of items with their current prices, supply, and demand.'),
  eventDescription: z
    .string()
    .optional()
    .describe('An optional description of a recent in-game event that may affect market prices.'),
});
export type SimulateMarketPricesInput = z.infer<typeof SimulateMarketPricesInputSchema>;

export const SimulateMarketPricesOutputSchema = z.array(
  z.object({
    name: z.string().describe('The name of the item.'),
    newPrice: z.number().describe('The new simulated price of the item.'),
    reasoning: z.string().describe('The reasoning behind the price change.'),
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
});
export type ResolvePirateEncounterInput = z.infer<typeof ResolvePirateEncounterInputSchema>;

export const ResolvePirateEncounterOutputSchema = z.object({
  outcome: z.enum(['success', 'failure', 'partial_success']).describe('The result of the encounter.'),
  narrative: z.string().describe('A dramatic, short description of what happened.'),
  cargoLost: z.number().describe('Amount of cargo units lost.'),
  creditsLost: z.number().describe('Amount of credits lost (from bribes or damages).'),
  damageTaken: z.string().describe('A brief description of any damage taken to the ship.'),
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
