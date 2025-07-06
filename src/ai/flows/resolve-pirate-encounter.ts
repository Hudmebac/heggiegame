'use server';

/**
 * @fileOverview A Game Master AI that resolves pirate encounters in a space trading game.
 * 
 * - resolvePirateEncounter - A function that resolves the pirate encounter based on player action.
 */

import { ai } from '@/ai/genkit';
import {
  ResolvePirateEncounterInput,
  ResolvePirateEncounterInputSchema,
  ResolvePirateEncounterOutput,
  ResolvePirateEncounterOutputSchema,
} from '@/lib/schemas';

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
**Player's Ship Health:** {{{shipHealth}}}/100
**Player's Ship Upgrades:** Weapons Mk. {{{weaponLevel}}}, Shields Class {{{shieldLevel}}}
**Player's Crew:** Gunner Present: {{hasGunner}}, Negotiator Present: {{hasNegotiator}}
**Pirate:** {{{pirateName}}}
**Pirate Threat Level:** {{{pirateThreatLevel}}}

**Your Task:**
- Evaluate the player's action against the pirate's threat level and the player's ship capabilities.
- Fighting a high-threat pirate is risky. A damaged ship (low health) will be less effective in combat. Conversely, a player with upgraded weapons (higher weaponLevel) will have a better chance of success.
- If 'hasGunner' is true, the player has a significant combat advantage. This should greatly increase their chances of winning a fight and should reduce the damage taken.
- Evading might be easier against a slow ship but could fail. Bribing depends on the player's net worth and the pirate's greed. A negotiator ('hasNegotiator' is true) should significantly reduce the bribe amount needed for a successful outcome and may turn a failure into a partial success.
- Generate a compelling, short narrative describing the event's resolution.
- Determine the consequences: cargo lost, credits lost (for bribes or repairs), and ship damage.
- The outcome should be logical. A low-threat pirate might be easily fought off or accept a small bribe. A critical-threat pirate will be very dangerous, even for a well-equipped player.
- If the player bribes, the 'creditsLost' should be a reasonable amount based on their net worth and the pirate threat. If a negotiator is present, this amount should be lower.
- If the player fights and loses, they might lose some cargo.
- Determine the 'damageTaken' as a numerical value representing health points lost. Better shields (higher shieldLevel) should reduce the amount of damage taken. A minor hit might be 5-10 points, while a critical failure could be 30-50 points.
- If the player successfully evades, there should be no losses or damage.

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
