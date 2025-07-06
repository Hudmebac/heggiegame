'use server';

/**
 * @fileOverview Generates partnership offers for a player's construction project.
 * 
 * - generateConstructionPartnershipOffers - A function that generates a list of investment offers.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateConstructionPartnershipOffersInput,
  GenerateConstructionPartnershipOffersInputSchema,
  GenerateConstructionPartnershipOffersOutput,
  GenerateConstructionPartnershipOffersOutputSchema
} from '@/lib/schemas';

export async function generateConstructionPartnershipOffers(input: GenerateConstructionPartnershipOffersInput): Promise<GenerateConstructionPartnershipOffersOutput> {
  return generateConstructionPartnershipOffersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConstructionPartnershipOffersPrompt',
  input: { schema: GenerateConstructionPartnershipOffersInputSchema },
  output: { schema: GenerateConstructionPartnershipOffersOutputSchema },
  prompt: `You are a Galactic Development Broker for the space trading game HEGGIE. A player owns a construction project with a current market value of {{{marketValue}}} credits.

Your task is to generate 3-4 distinct and interesting partnership offers from various galactic corporations and real estate magnates.

For each offer, you must provide:
- **partnerName**: The name of the faction or corporation making the offer. Be creative and use names that fit the sci-fi lore (e.g., "The Cygnus Combine", "Weyland-Yutani Corp", "The Titan Construction Guild", "Starlight Developments").
- **stakePercentage**: The percentage of the construction project they want to buy. This should be a value between 0.05 (5%) and 0.30 (30%).
- **cashOffer**: The amount of credits they are offering. This should be a realistic valuation based on the stakePercentage and marketValue. You can add some slight variance (e.g., a greedy faction might offer a bit less, a desperate one might offer slightly more).
- **dealDescription**: A short, flavourful description of the deal and the partner's reputation. This should hint at the pros and cons of dealing with them.

Make the offers varied in terms of risk and reward. One might be a low-risk, low-reward deal from a reputable corporation, while another could be a high-stakes deal with an infamous syndicate.

Return the response in the specified JSON format.
`,
});

const generateConstructionPartnershipOffersFlow = ai.defineFlow(
  {
    name: 'generateConstructionPartnershipOffersFlow',
    inputSchema: GenerateConstructionPartnershipOffersInputSchema,
    outputSchema: GenerateConstructionPartnershipOffersOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
