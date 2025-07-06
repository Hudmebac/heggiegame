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
