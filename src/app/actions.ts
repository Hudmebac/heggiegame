
'use server';

import { simulateMarketPrices } from '@/ai/flows/simulate-market-prices';
import { resolvePirateEncounter } from '@/ai/flows/resolve-pirate-encounter';
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
import { generateBankPartnershipOffers } from '@/ai/flows/generate-bank-partnership-offers';
import { negotiateTradeRoute } from '@/ai/flows/negotiate-trade-route';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';


import {
  SimulateMarketPricesInputSchema,
  type SimulateMarketPricesInput,
  type SimulateMarketPricesOutput,
  ResolvePirateEncounterInputSchema,
  type ResolvePirateEncounterInput,
  type ResolvePirateEncounterOutput,
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
  GenerateBankPartnershipOffersInputSchema,
  type GenerateBankPartnershipOffersInput,
  type GenerateBankPartnershipOffersOutput,
  NegotiateTradeRouteInputSchema,
  type NegotiateTradeRouteInput,
  type NegotiateTradeRouteOutput,
} from '@/lib/schemas';

export async function runMarketSimulation(input: SimulateMarketPricesInput): Promise<SimulateMarketPricesOutput> {
  try {
    const validatedInput = SimulateMarketPricesInputSchema.parse(input);
    
    const retries = 3;
    for (let i = 0; i < retries; i++) {
      try {
        const result = await simulateMarketPrices(validatedInput);
        return result;
      } catch (error: any) {
        if (error.message && error.message.includes('503 Service Unavailable') && i < retries - 1) {
          console.log(`Market simulation attempt ${i + 1} failed. Retrying...`);
          await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i))); // exponential backoff
        } else {
          // Re-throw if it's not a 503 or it's the last retry
          throw error;
        }
      }
    }
    // This line is technically unreachable if the loop always throws on the last iteration.
    // Adding it to satisfy TypeScript and as a fallback.
    throw new Error('Market simulation failed after multiple retries.');

  } catch (error) {
    console.error('Error running market simulation:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input for market simulation: ${error.message}`);
    }
    // Re-throw the original error to be handled by the caller
    throw error;
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
        console.error("Error running quest generation:", error);
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

export async function runBankPartnershipOfferGeneration(input: GenerateBankPartnershipOffersInput): Promise<GenerateBankPartnershipOffersOutput> {
    try {
        const validatedInput = GenerateBankPartnershipOffersInputSchema.parse(input);
        const result = await generateBankPartnershipOffers(validatedInput);
        return result;
    } catch (error) {
        console.error('Error running bank partnership offer generation:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input for bank partnership offer generation: ${error.message}`);
        }
        throw new Error('Failed to generate bank partnership offers.');
    }
}

export async function runNegotiateTradeRoute(input: NegotiateTradeRouteInput): Promise<NegotiateTradeRouteOutput> {
    try {
        const validatedInput = NegotiateTradeRouteInputSchema.parse(input);
        const result = await negotiateTradeRoute(validatedInput);
        return result;
    } catch (error) {
        console.error('Error running trade route negotiation:', error);
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input for trade route negotiation: ${error.message}`);
        }
        throw new Error('Failed to negotiate trade route.');
    }
}

export async function redeemPromoCode(code: string): Promise<{ tokens: number } | { error: string }> {
    try {
        const filePath = path.join(process.cwd(), 'src', 'lib', 'promo-codes.json');
        const fileContents = await fs.readFile(filePath, 'utf8');
        const promoCodes = JSON.parse(fileContents);
        
        const promo = promoCodes[code.toUpperCase()];

        if (promo) {
            return { tokens: promo.tokens };
        } else {
            return { error: 'Invalid promo code.' };
        }
    } catch (error) {
        console.error("Error reading promo codes:", error);
        return { error: 'Could not validate promo code at this time.' };
    }
}
