'use server';

/**
 * @fileOverview Generates property sale listings for the Landlord career.
 * 
 * - generatePropertyListings - A function that returns a list of properties for sale.
 */

import { ai } from '@/ai/genkit';
import { GeneratePropertyListingsInputSchema, GeneratePropertyListingsOutputSchema, type GeneratePropertyListingsInput, type GeneratePropertyListingsOutput } from '@/lib/schemas';
import { propertyUpgrades } from '@/lib/property-upgrades';

export async function generatePropertyListings(input: GeneratePropertyListingsInput): Promise<GeneratePropertyListingsOutput> {
  return generatePropertyListingsFlow(input);
}

const generatePropertyListingsFlow = ai.defineFlow(
    {
      name: 'generatePropertyListingsFlow',
      inputSchema: GeneratePropertyListingsInputSchema,
      outputSchema: GeneratePropertyListingsOutputSchema,
    },
    async ({ count, systemName }) => {
        const propertyTypes = Object.keys(propertyUpgrades);

        const prompt = `You are a Galactic Real Estate Market Analyst for the game HEGGIE. Your task is to generate ${count} unique property listings currently for sale in the "${systemName}" system.

For each property, you must provide:
- **id**: A unique string identifier.
- **name**: A creative and evocative name for the property (e.g., "The Crimson Spire Penthouse", "Dockside Goods & Storage Unit 7", "The Rust-bucket Cantina").
- **type**: The property type, chosen from this list: ${propertyTypes.join(', ')}.
- **level**: The current upgrade level of the property (between 1 and 5).
- **systemName**: This should always be "${systemName}".
- **askingPrice**: A realistic asking price in credits, considering the type and level. Higher level and more valuable types (like Military or Commercial) should cost significantly more than a low-level Residential. A level 1 Residential might be 200k-400k, while a level 5 Military could be 20M-50M.
- **description**: A short, flavourful description of the property, hinting at its history or potential.

Ensure the listings are diverse in type and level.
`;
  
      const { output } = await ai.generate({
          prompt,
          model: 'googleai/gemini-2.0-flash',
          output: { schema: GeneratePropertyListingsOutputSchema },
      });
      
      return output!;
    }
);
