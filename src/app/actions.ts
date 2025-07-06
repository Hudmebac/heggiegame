'use server';

import { simulateMarketPrices, type SimulateMarketPricesInput, type SimulateMarketPricesOutput } from '@/ai/flows/simulate-market-prices';
import { resolvePirateEncounter, type ResolvePirateEncounterInput, type ResolvePirateEncounterOutput } from '@/ai/flows/resolve-pirate-encounter';
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

const ResolvePirateEncounterInputClientSchema = z.object({
    action: z.enum(['fight', 'evade', 'bribe']),
    playerNetWorth: z.number(),
    playerCargo: z.number(),
    pirateName: z.string(),
    pirateThreatLevel: z.enum(['Low', 'Medium', 'High', 'Critical']),
});

export async function resolveEncounter(input: ResolvePirateEncounterInput): Promise<ResolvePirateEncounterOutput> {
    try {
        const validatedInput = ResolvePirateEncounterInputClientSchema.parse(input);
        const result = await resolvePirateEncounter(validatedInput);
        return result;
    } catch (error) {
        console.error('Error resolving encounter:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input for encounter resolution: ${error.message}`);
        }
        throw new Error('Failed to resolve encounter.');
    }
}
