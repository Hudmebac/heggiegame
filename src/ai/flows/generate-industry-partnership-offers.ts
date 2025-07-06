'use server';

/**
 * @fileOverview Generates partnership offers for a player's industrial hub.
 * 
 * - generateIndustryPartnershipOffers - A function that generates a list of investment offers.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateIndustryPartnershipOffersInput,
  GenerateIndustryPartnershipOffersInputSchema,
  GenerateIndustryPartnershipOffersOutput,
  GenerateIndustryPartnershipOffersOutputSchema
} from '@/lib/schemas';

export async function generateIndustryPartnershipOffers(input: GenerateIndustryPartnershipOffersInput): Promise<GenerateIndustryPartnershipOffersOutput> {
  return generateIndustryPartnershipOffersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateIndustryPartnershipOffersPrompt',
  input: { schema: GenerateIndustryPartnershipOffersInputSchema },
  output: { schema: GenerateIndustryPartnershipOffersOutputSchema },
  prompt: `You are a Galactic Industrial Broker for the space trading game HEGGIE. A player owns an industrial facility with a current market value of {{{marketValue}}} credits.

Your task is to generate 3-4 distinct and interesting partnership offers from various galactic factions and corporations.

For each offer, you must provide:
- **partnerName**: The name of the faction or corporation making the offer. Be creative and use names that fit the sci-fi lore (e.g., "The Cygnus Forge", "Kessler & Holt Manufacturing", "The Titan Syndicate", "Orion Industrial").
- **stakePercentage**: The percentage of the industrial hub they want to buy. This should be a value between 0.05 (5%) and 0.30 (30%).
- **cashOffer**: The amount of credits they are offering. This should be a realistic valuation based on the stakePercentage and marketValue. You can add some slight variance (e.g., a greedy faction might offer a bit less, a desperate one might offer slightly more).
- **dealDescription**: A short, flavourful description of the deal and the partner's reputation. This should hint at the pros and cons of dealing with them.

Make the offers varied in terms of risk and reward. One might be a low-risk, low-reward deal from a reputable corporation, while another could be a high-stakes deal with an infamous syndicate.

Return the response in the specified JSON format.
`,
});

const generateIndustryPartnershipOffersFlow = ai.defineFlow(
  {
    name: 'generateIndustryPartnershipOffersFlow',
    inputSchema: GenerateIndustryPartnershipOffersInputSchema,
    outputSchema: GenerateIndustryPartnershipOffersOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
