'use server';

/**
 * @fileOverview Generates partnership offers for a player's bank.
 * 
 * - generateBankPartnershipOffers - A function that generates a list of investment offers.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateBankPartnershipOffersInput,
  GenerateBankPartnershipOffersInputSchema,
  GenerateBankPartnershipOffersOutput,
  GenerateBankPartnershipOffersOutputSchema
} from '@/lib/schemas';

export async function generateBankPartnershipOffers(input: GenerateBankPartnershipOffersInput): Promise<GenerateBankPartnershipOffersOutput> {
  return generateBankPartnershipOffersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBankPartnershipOffersPrompt',
  input: { schema: GenerateBankPartnershipOffersInputSchema },
  output: { schema: GenerateBankPartnershipOffersOutputSchema },
  prompt: `You are a Galactic Financial Advisor for the space trading game HEGGIE. A player owns a bank with a current market value of {{{marketValue}}} credits.

Your task is to generate 3-4 distinct and interesting partnership offers from various galactic financial institutions and powerful consortiums.

For each offer, you must provide:
- **partnerName**: The name of the institution making the offer. Be creative and use names that fit the sci-fi lore (e.g., "The Cygnus Credit Union", "Orion Interstellar Bank", "The Titan Trust", "Veridian Financial Group").
- **stakePercentage**: The percentage of the bank they want to buy. This should be a value between 0.05 (5%) and 0.30 (30%).
- **cashOffer**: The amount of credits they are offering. This should be a realistic valuation based on the stakePercentage and marketValue. A prestigious bank might offer a premium.
- **dealDescription**: A short, flavourful description of the deal and the partner's reputation. This should hint at the pros and cons of dealing with them.

Make the offers varied. One might be a stable, long-term investment from a reputable bank, while another could be a high-risk, high-reward deal from a shadowy financial syndicate.

Return the response in the specified JSON format.
`,
});

const generateBankPartnershipOffersFlow = ai.defineFlow(
  {
    name: 'generateBankPartnershipOffersFlow',
    inputSchema: GenerateBankPartnershipOffersInputSchema,
    outputSchema: GenerateBankPartnershipOffersOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
