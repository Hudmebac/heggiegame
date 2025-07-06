'use server';

import { simulateMarketPrices, type SimulateMarketPricesInput, type SimulateMarketPricesOutput } from '@/ai/flows/simulate-market-prices';
import { resolvePirateEncounter, type ResolvePirateEncounterInput, type ResolvePirateEncounterOutput } from '@/ai/flows/resolve-pirate-encounter';
import { generateAvatar, type GenerateAvatarInput, type GenerateAvatarOutput } from '@/ai/flows/generate-avatar';
import { generateGameEvent, type GenerateGameEventOutput } from '@/ai/flows/generate-game-event';
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

const GenerateAvatarInputSchema = z.object({
    description: z.string(),
});

export async function runAvatarGeneration(input: GenerateAvatarInput): Promise<GenerateAvatarOutput> {
    try {
        const validatedInput = GenerateAvatarInputSchema.parse(input);
        const result = await generateAvatar(validatedInput);
        return result;
    } catch (error) {
        console.error('Error running avatar generation:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input for avatar generation: ${error.message}`);
        }
        throw new Error('Failed to generate avatar.');
    }
}

export async function runEventGeneration(): Promise<GenerateGameEventOutput> {
    try {
        const result = await generateGameEvent();
        return result;
    } catch (error) {
        console.error('Error running event generation:', error);
        throw new Error('Failed to generate game event.');
    }
}
