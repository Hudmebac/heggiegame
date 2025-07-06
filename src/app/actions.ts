'use server';

import { simulateMarketPrices, type SimulateMarketPricesInput, type SimulateMarketPricesOutput } from '@/ai/flows/simulate-market-prices';
import { z } from 'zod';

const SimulateMarketPricesInputSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string(),
        currentPrice: z.number(),
        supply: z.number(),
        demand: z.number(),
      })
    ),
  eventDescription: z.string().optional(),
});


export async function runMarketSimulation(input: SimulateMarketPricesInput): Promise<SimulateMarketPricesOutput> {
  try {
    const validatedInput = SimulateMarketPricesInputSchema.parse(input);
    const result = await simulateMarketPrices(validatedInput);
    return result;
  } catch (error) {
    console.error('Error running market simulation:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input for market simulation: ${error.message}`);
    }
    throw new Error('Failed to simulate market prices.');
  }
}
