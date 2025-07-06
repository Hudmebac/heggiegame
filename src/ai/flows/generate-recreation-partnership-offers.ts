
'use server';

/**
 * @fileOverview Generates partnership offers for a player's recreation facility.
 * 
 * - generateRecreationPartnershipOffers - A function that generates a list of investment offers.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateRecreationPartnershipOffersInput,
  GenerateRecreationPartnershipOffersInputSchema,
  GenerateRecreationPartnershipOffersOutput,
  GenerateRecreationPartnershipOffersOutputSchema
} from '@/lib/schemas';

export async function generateRecreationPartnershipOffers(input: GenerateRecreationPartnershipOffersInput): Promise<GenerateRecreationPartnershipOffersOutput> {
  return generateRecreationPartnershipOffersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecreationPartnershipOffersPrompt',
  input: { schema: GenerateRecreationPartnershipOffersInputSchema },
  output: { schema: GenerateRecreationPartnershipOffersOutputSchema },
  prompt: `You are a Galactic Entertainment Broker for the space trading game HEGGIE. A player owns a recreation facility with a current market value of {{{marketValue}}} credits.

Your task is to generate 3-4 distinct and interesting partnership offers from various galactic entertainment corporations and leisure guilds.

For each offer, you must provide:
- **partnerName**: The name of the faction or corporation making the offer. Be creative and use names that fit the sci-fi lore (e.g., "Starlight Entertainment Group", "The Veritas Leisure Guild", "Cygnus Holo-Simulations", "Zero-G Resorts").
- **stakePercentage**: The percentage of the recreation facility they want to buy. This should be a value between 0.05 (5%) and 0.30 (30%).
- **cashOffer**: The amount of credits they are offering. This should be a realistic valuation based on the stakePercentage and marketValue. You can add some slight variance (e.g., a greedy faction might offer a bit less, a desperate one might offer slightly more).
- **dealDescription**: A short, flavourful description of the deal and the partner's reputation. This should hint at the pros and cons of dealing with them.

Make the offers varied in terms of risk and reward. One might be a low-risk, low-reward deal from a reputable corporation, while another could be a high-stakes deal with an infamous entertainment syndicate.

Return the response in the specified JSON format.
`,
});

const generateRecreationPartnershipOffersFlow = ai.defineFlow(
  {
    name: 'generateRecreationPartnershipOffersFlow',
    inputSchema: GenerateRecreationPartnershipOffersInputSchema,
    outputSchema: GenerateRecreationPartnershipOffersOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
