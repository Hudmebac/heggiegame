'use server';

/**
 * @fileOverview A Game Master AI that resolves pirate encounters in a space trading game.
 * 
 * - resolvePirateEncounter - A function that resolves the pirate encounter based on player action.
 * - ResolvePirateEncounterInput - The input type for the resolvePirateEncounter function.
 * - ResolvePirateEncounterOutput - The return type for the resolvePirateEncounter function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ResolvePirateEncounterInputSchema = z.object({
  action: z.enum(['fight', 'evade', 'bribe']).describe("The player's chosen action."),
  playerNetWorth: z.number().describe("The player's current net worth in credits."),
  playerCargo: z.number().describe("The amount of cargo the player is currently carrying."),
  pirateName: z.string().describe('The name of the pirate.'),
  pirateThreatLevel: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The threat level of the pirate.'),
});
export type ResolvePirateEncounterInput = z.infer<typeof ResolvePirateEncounterInputSchema>;

const ResolvePirateEncounterOutputSchema = z.object({
  outcome: z.enum(['success', 'failure', 'partial_success']).describe('The result of the encounter.'),
  narrative: z.string().describe('A dramatic, short description of what happened.'),
  cargoLost: z.number().describe('Amount of cargo units lost.'),
  creditsLost: z.number().describe('Amount of credits lost (from bribes or damages).'),
  damageTaken: z.string().describe('A brief description of any damage taken to the ship.'),
});
export type ResolvePirateEncounterOutput = z.infer<typeof ResolvePirateEncounterOutputSchema>;

export async function resolvePirateEncounter(input: ResolvePirateEncounterInput): Promise<ResolvePirateEncounterOutput> {
  return resolvePirateEncounterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resolvePirateEncounterPrompt',
  input: { schema: ResolvePirateEncounterInputSchema },
  output: { schema: ResolvePirateEncounterOutputSchema },
  prompt: `You are the Game Master for the space trading game HEGGIE. A player has encountered a pirate and must make a decision. Based on the player's action and the context, determine the outcome.

**Player's Action:** {{{action}}}
**Player's Net Worth:** {{{playerNetWorth}}} credits
**Player's Current Cargo:** {{{playerCargo}}} units
**Pirate:** {{{pirateName}}}
**Pirate Threat Level:** {{{pirateThreatLevel}}}

**Your Task:**
- Evaluate the player's action against the pirate's threat level.
- Fighting a high-threat pirate is risky. Evading might be easier against a slow ship but could fail. Bribing depends on the player's net worth and the pirate's greed.
- Generate a compelling, short narrative describing the event's resolution.
- Determine the consequences: cargo lost, credits lost (for bribes or repairs), and ship damage.
- The outcome should be logical. A low-threat pirate might be easily fought off or accept a small bribe. A critical-threat pirate will be very dangerous.
- If the player bribes, the 'creditsLost' should be a reasonable amount based on their net worth and the pirate threat.
- If the player fights and loses, they might lose some cargo.
- If the player successfully evades, there should be no losses.

Provide the response in the specified JSON format.`,
});


const resolvePirateEncounterFlow = ai.defineFlow(
  {
    name: 'resolvePirateEncounterFlow',
    inputSchema: ResolvePirateEncounterInputSchema,
    outputSchema: ResolvePirateEncounterOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
