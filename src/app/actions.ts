
'use server';

import { simulateMarketPrices } from '@/ai/flows/simulate-market-prices';
import { resolvePirateEncounter } from '@/ai/flows/resolve-pirate-encounter';
import { generateAvatar } from '@/ai/flows/generate-avatar';
import { generateGameEvent } from '@/ai/flows/generate-game-event';
import { scanPirateVessel } from '@/ai/flows/scan-pirate-vessel';
import { generateQuests } from '@/ai/flows/generate-quests';
import { generateTraders } from '@/ai/flows/generate-traders';
import { generatePartnershipOffers } from '@/ai/flows/generate-partnership-offers';
import { generateResidencePartnershipOffers } from '@/ai/flows/generate-residence-partnership-offers';
import { generateCommercePartnershipOffers } from '@/ai/flows/generate-commerce-partnership-offers';
import { generateIndustryPartnershipOffers } from '@/ai/flows/generate-industry-partnership-offers';
import { generateConstructionPartnershipOffers } from '@/ai/flows/generate-construction-partnership-offers';
import { generateRecreationPartnershipOffers } from '@/ai/flows/generate-recreation-partnership-offers';
import { z } from 'zod';

import {
  SimulateMarketPricesInputSchema,
  type SimulateMarketPricesInput,
  type SimulateMarketPricesOutput,
  ResolvePirateEncounterInputSchema,
  type ResolvePirateEncounterInput,
  type ResolvePirateEncounterOutput,
  GenerateAvatarInputSchema,
  type GenerateAvatarInput,
  type GenerateAvatarOutput,
  type GenerateGameEventOutput,
  ScanPirateVesselInputSchema,
  type ScanPirateVesselInput,
  type ScanPirateVesselOutput,
  type GenerateQuestsOutput,
  type GenerateTradersOutput,
  GeneratePartnershipOffersInputSchema,
  type GeneratePartnershipOffersInput,
  type GeneratePartnershipOffersOutput,
  GenerateResidencePartnershipOffersInputSchema,
  type GenerateResidencePartnershipOffersInput,
  type GenerateResidencePartnershipOffersOutput,
  GenerateCommercePartnershipOffersInputSchema,
  type GenerateCommercePartnershipOffersInput,
  type GenerateCommercePartnershipOffersOutput,
  GenerateIndustryPartnershipOffersInputSchema,
  type GenerateIndustryPartnershipOffersInput,
  type GenerateIndustryPartnershipOffersOutput,
  GenerateConstructionPartnershipOffersInputSchema,
  type GenerateConstructionPartnershipOffersInput,
  type GenerateConstructionPartnershipOffersOutput,
  GenerateRecreationPartnershipOffersInputSchema,
  type GenerateRecreationPartnershipOffersInput,
  type GenerateRecreationPartnershipOffersOutput,
} from '@/lib/schemas';

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

export async function resolveEncounter(input: ResolvePirateEncounterInput): Promise<ResolvePirateEncounterOutput> {
    try {
        const validatedInput = ResolvePirateEncounterInputSchema.parse(input);
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

export async function runPirateScan(input: ScanPirateVesselInput): Promise<ScanPirateVesselOutput> {
    try {
        const validatedInput = ScanPirateVesselInputSchema.parse(input);
        const result = await scanPirateVessel(validatedInput);
        return result;
    } catch (error) {
        console.error('Error running pirate scan:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input for pirate scan: ${error.message}`);
        }
        throw new Error('Failed to scan pirate vessel.');
    }
}

export async function runQuestGeneration(): Promise<GenerateQuestsOutput> {
    try {
        const result = await generateQuests();
        return result;
    } catch (error) {
        console.error('Error running quest generation:', error);
        throw new Error('Failed to generate quests.');
    }
}

export async function runTraderGeneration(): Promise<GenerateTradersOutput> {
    try {
        const result = await generateTraders();
        return result;
    } catch (error) {
        console.error('Error running trader generation:', error);
        throw new Error('Failed to generate traders.');
    }
}

export async function runPartnershipOfferGeneration(input: GeneratePartnershipOffersInput): Promise<GeneratePartnershipOffersOutput> {
    try {
        const validatedInput = GeneratePartnershipOffersInputSchema.parse(input);
        const result = await generatePartnershipOffers(validatedInput);
        return result;
    } catch (error) {
        console.error('Error running partnership offer generation:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input for partnership offer generation: ${error.message}`);
        }
        throw new Error('Failed to generate partnership offers.');
    }
}

export async function runResidencePartnershipOfferGeneration(input: GenerateResidencePartnershipOffersInput): Promise<GenerateResidencePartnershipOffersOutput> {
    try {
        const validatedInput = GenerateResidencePartnershipOffersInputSchema.parse(input);
        const result = await generateResidencePartnershipOffers(validatedInput);
        return result;
    } catch (error) {
        console.error('Error running residence partnership offer generation:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input for residence partnership offer generation: ${error.message}`);
        }
        throw new Error('Failed to generate residence partnership offers.');
    }
}

export async function runCommercePartnershipOfferGeneration(input: GenerateCommercePartnershipOffersInput): Promise<GenerateCommercePartnershipOffersOutput> {
    try {
        const validatedInput = GenerateCommercePartnershipOffersInputSchema.parse(input);
        const result = await generateCommercePartnershipOffers(validatedInput);
        return result;
    } catch (error) {
        console.error('Error running commerce partnership offer generation:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input for commerce partnership offer generation: ${error.message}`);
        }
        throw new Error('Failed to generate commerce partnership offers.');
    }
}

export async function runIndustryPartnershipOfferGeneration(input: GenerateIndustryPartnershipOffersInput): Promise<GenerateIndustryPartnershipOffersOutput> {
    try {
        const validatedInput = GenerateIndustryPartnershipOffersInputSchema.parse(input);
        const result = await generateIndustryPartnershipOffers(validatedInput);
        return result;
    } catch (error) {
        console.error('Error running industry partnership offer generation:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input for industry partnership offer generation: ${error.message}`);
        }
        throw new Error('Failed to generate industry partnership offers.');
    }
}

export async function runConstructionPartnershipOfferGeneration(input: GenerateConstructionPartnershipOffersInput): Promise<GenerateConstructionPartnershipOffersOutput> {
    try {
        const validatedInput = GenerateConstructionPartnershipOffersInputSchema.parse(input);
        const result = await generateConstructionPartnershipOffers(validatedInput);
        return result;
    } catch (error) {
        console.error('Error running construction partnership offer generation:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input for construction partnership offer generation: ${error.message}`);
        }
        throw new Error('Failed to generate construction partnership offers.');
    }
}

export async function runRecreationPartnershipOfferGeneration(input: GenerateRecreationPartnershipOffersInput): Promise<GenerateRecreationPartnershipOffersOutput> {
    try {
        const validatedInput = GenerateRecreationPartnershipOffersInputSchema.parse(input);
        const result = await generateRecreationPartnershipOffers(validatedInput);
        return result;
    } catch (error) {
        console.error('Error running recreation partnership offer generation:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input for recreation partnership offer generation: ${error.message}`);
        }
        throw new Error('Failed to generate recreation partnership offers.');
    }
}
