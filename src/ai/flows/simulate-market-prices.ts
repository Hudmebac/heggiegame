// src/ai/flows/simulate-market-prices.ts
'use server';

/**
 * @fileOverview Simulates market prices for items in the game based on supply, demand, and in-game events.
 *
 * - simulateMarketPrices - A function that simulates market prices and returns the updated prices.
 */

import {ai} from '@/ai/genkit';
import {
  SimulateMarketPricesInput,
  SimulateMarketPricesInputSchema,
  SimulateMarketPricesOutput,
  SimulateMarketPricesOutputSchema,
} from '@/lib/schemas';

export async function simulateMarketPrices(input: SimulateMarketPricesInput): Promise<SimulateMarketPricesOutput> {
  return simulateMarketPricesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateMarketPricesPrompt',
  input: {schema: SimulateMarketPricesInputSchema},
  output: {schema: SimulateMarketPricesOutputSchema},
  prompt: `You are an economic simulation tool for a space trading game.
You will be given the current market conditions (items, supply, demand) for a star system, along with its economic profile and an optional in-game event.
Your task is to simulate a realistic shift in the supply and demand for each item based on these factors.

**System Profile:**
- Economy Type: {{{systemEconomy}}}
- Market Volatility: {{{systemVolatility}}} (0.0 = stable, 1.0 = chaotic)

**In-Game Event:**
{{#if eventDescription}}
- {{eventDescription}}
{{else}}
- No major event. Standard market fluctuations apply.
{{/if}}

**Current Market Data:**
{{#each items}}
- Item: {{this.name}}, Supply: {{this.supply}}, Demand: {{this.demand}}
{{/each}}

**Instructions:**
1.  **Analyze the Event:** Consider how the event would logically impact the supply and demand of different goods. For example, a "Pirate Blockade" would decrease the supply of most goods and increase demand for essentials like Food and Military items. A "Technological Breakthrough" would increase the supply of high-tech goods.
2.  **Consider the Economy:** The system's economy is crucial. An 'Agricultural' system will react differently to a food shortage than an 'Industrial' one. A "Mining Boom" event should drastically affect an 'Extraction' economy.
3.  **Apply Volatility:** Use the volatility factor to determine the magnitude of the changes. High volatility means more dramatic swings in supply and demand. Low volatility means smaller, more predictable changes.
4.  **Update Supply and Demand:** For each item, provide a 'newSupply' and 'newDemand' value. These should be integers. Do not let supply or demand drop below 10.
5.  **Provide Reasoning:** For each item, give a brief, one-sentence explanation for the change.

Your output must be a JSON array of objects, each containing the item's name, its new supply, its new demand, and the reasoning.`,
});

const simulateMarketPricesFlow = ai.defineFlow(
  {
    name: 'simulateMarketPricesFlow',
    inputSchema: SimulateMarketPricesInputSchema,
    outputSchema: SimulateMarketPricesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
