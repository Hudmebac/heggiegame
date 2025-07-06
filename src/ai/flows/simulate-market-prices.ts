// src/ai/flows/simulate-market-prices.ts
'use server';

/**
 * @fileOverview Simulates market prices for items in the game based on supply, demand, and in-game events.
 *
 * - simulateMarketPrices - A function that simulates market prices and returns the updated prices.
 * - SimulateMarketPricesInput - The input type for the simulateMarketPrices function.
 * - SimulateMarketPricesOutput - The return type for the simulateMarketPrices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateMarketPricesInputSchema = z.object({
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

const SimulateMarketPricesOutputSchema = z.array(
  z.object({
    name: z.string().describe('The name of the item.'),
    newPrice: z.number().describe('The new simulated price of the item.'),
    reasoning: z.string().describe('The reasoning behind the price change.'),
  })
);
export type SimulateMarketPricesOutput = z.infer<typeof SimulateMarketPricesOutputSchema>;

export async function simulateMarketPrices(input: SimulateMarketPricesInput): Promise<SimulateMarketPricesOutput> {
  return simulateMarketPricesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateMarketPricesPrompt',
  input: {schema: SimulateMarketPricesInputSchema},
  output: {schema: SimulateMarketPricesOutputSchema},
  prompt: `You are an economic simulation tool for a space trading game. Given a list of items with their current prices, supply, and demand, and an optional description of a recent in-game event, you will simulate new market prices for each item.

  The output should be a JSON array containing each item's name, a new simulated price, and a short explanation for the price change.

  Here's the current market data:
  {{#each items}}
  - Item: {{this.name}}, Current Price: {{this.currentPrice}}, Supply: {{this.supply}}, Demand: {{this.demand}}
  {{/each}}

  {{#if eventDescription}}
  Recent In-Game Event: {{eventDescription}}
  {{/if}}

  Consider these factors:
  - **Supply and Demand:** Higher supply generally leads to lower prices, and higher demand leads to higher prices.
  - **In-Game Events:** Events can cause sudden shifts in supply or demand.
  - **Reasonable Price Fluctuations:** Prices should not change drastically unless there is a very good reason.
  `,
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
