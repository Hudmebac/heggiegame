
'use server';

import { z } from 'zod';
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
  NegotiateTradeRouteInputSchema,
  type NegotiateTradeRouteInput,
  type NegotiateTradeRouteOutput,
  GenerateBankPartnershipOffersInputSchema,
  type GenerateBankPartnershipOffersInput,
  type GenerateBankPartnershipOffersOutput,
  GenerateCommercePartnershipOffersInputSchema,
  type GenerateCommercePartnershipOffersInput,
  type GenerateCommercePartnershipOffersOutput,
  GenerateResidencePartnershipOffersInputSchema,
  type GenerateResidencePartnershipOffersInput,
  type GenerateResidencePartnershipOffersOutput,
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
import { simulateMarket } from '@/lib/utils';
import { generateQuests } from '@/lib/generation/quests';
import { generateTraders } from '@/lib/generation/traders';

// Import the JSON file directly
import promoCodes from '@/lib/promo-codes.json';

// --- SIMULATED AI FUNCTIONS ---

const STATIC_EVENTS = [
  "A new trade agreement has been signed with the Xylos Corporation, opening up new markets for high-tech goods.",
  "Pirate activity has surged in the Orion Spur, making trade routes for raw materials more dangerous.",
  "A rare mineral rush has begun in the Kepler system after a massive asteroid was discovered.",
  "A diplomatic incident has led to a trade embargo on all goods from the Cygnus sector.",
  "Technological breakthrough in hydroponics has led to a surplus of exotic foodstuffs."
];

export async function runEventGeneration(): Promise<GenerateGameEventOutput> {
  const eventDescription = STATIC_EVENTS[Math.floor(Math.random() * STATIC_EVENTS.length)];
  return { eventDescription };
}

export async function runPirateScan(input: ScanPirateVesselInput): Promise<ScanPirateVesselOutput> {
    const { sensorLevel } = input;
    let scanReport = "Scan failed to resolve a clear signature.";
    if (sensorLevel >= 7) {
        scanReport = "High energy readings from overcharged plasma cannons detected. A sustained attack on their stern section could trigger a reactor cascade failure. Recommend targeting engines to disable and force a surrender.";
    } else if (sensorLevel >= 4) {
        scanReport = "Vessel is showing active shields and laser cannons. Engine output appears stable.";
    } else {
        scanReport = "Scan complete. Vessel is showing active shields. Weapon signatures detected.";
    }
    return { scanReport };
}

export async function runMarketSimulation(input: SimulateMarketPricesInput): Promise<SimulateMarketPricesOutput> {
  try {
    const validatedInput = SimulateMarketPricesInputSchema.parse(input);
    const result = simulateMarket(
      validatedInput.items,
      validatedInput.systemEconomy,
      validatedInput.systemVolatility,
      validatedInput.eventDescription
    );
    return result;
  } catch (error) {
    console.error('Error running market simulation:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input for market simulation: ${error.message}`);
    }
    throw error;
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

const PARTNER_NAMES = ["The Crimson Syndicate", "Faulcon deLacy Holdings", "The Veritas Guild", "Xylos Corporation", "The Cygnus Credit Union", "Orion Interstellar Bank", "The Titan Trust", "Veridian Financial Group"];
const DEAL_DESCRIPTIONS = [
    "A stable, long-term investment from a reputable corporation.",
    "A high-risk, high-reward deal from a shadowy financial syndicate.",
    "This guild is known for its ruthless efficiency and expects a return on investment, no matter the cost.",
    "A desperate holding company looking to offload liquid assets for a quick stake in a promising venture.",
    "An offer from a prestigious institution known for its fair dealings and long-term growth strategies.",
];

const generateOffers = (marketValue: number) => {
    return Array.from({ length: 3 + Math.floor(Math.random() * 2) }).map(() => {
        const stakePercentage = 0.05 + Math.random() * 0.25; // 5% to 30%
        const valuationMultiplier = 0.8 + Math.random() * 0.4; // 80% to 120% valuation
        const cashOffer = Math.round(marketValue * stakePercentage * valuationMultiplier);
        return {
            partnerName: PARTNER_NAMES[Math.floor(Math.random() * PARTNER_NAMES.length)],
            stakePercentage,
            cashOffer,
            dealDescription: DEAL_DESCRIPTIONS[Math.floor(Math.random() * DEAL_DESCRIPTIONS.length)],
        };
    });
};


export async function runPartnershipOfferGeneration(input: GeneratePartnershipOffersInput): Promise<GeneratePartnershipOffersOutput> {
    const validatedInput = GeneratePartnershipOffersInputSchema.parse(input);
    const offers = generateOffers(validatedInput.marketValue);
    return { offers };
}

export async function runBankPartnershipOfferGeneration(input: GenerateBankPartnershipOffersInput): Promise<GenerateBankPartnershipOffersOutput> {
    const validatedInput = GenerateBankPartnershipOffersInputSchema.parse(input);
    const offers = generateOffers(validatedInput.marketValue);
    return { offers };
}

export async function runCommercePartnershipOfferGeneration(input: GenerateCommercePartnershipOffersInput): Promise<GenerateCommercePartnershipOffersOutput> {
    const validatedInput = GenerateCommercePartnershipOffersInputSchema.parse(input);
    const offers = generateOffers(validatedInput.marketValue);
    return { offers };
}

export async function runResidencePartnershipOfferGeneration(input: GenerateResidencePartnershipOffersInput): Promise<GenerateResidencePartnershipOffersOutput> {
    const validatedInput = GenerateResidencePartnershipOffersInputSchema.parse(input);
    const offers = generateOffers(validatedInput.marketValue);
    return { offers };
}

export async function runIndustryPartnershipOfferGeneration(input: GenerateIndustryPartnershipOffersInput): Promise<GenerateIndustryPartnershipOffersOutput> {
    const validatedInput = GenerateIndustryPartnershipOffersInputSchema.parse(input);
    const offers = generateOffers(validatedInput.marketValue);
    return { offers };
}

export async function runConstructionPartnershipOfferGeneration(input: GenerateConstructionPartnershipOffersInput): Promise<GenerateConstructionPartnershipOffersOutput> {
    const validatedInput = GenerateConstructionPartnershipOffersInputSchema.parse(input);
    const offers = generateOffers(validatedInput.marketValue);
    return { offers };
}

export async function runRecreationPartnershipOfferGeneration(input: GenerateRecreationPartnershipOffersInput): Promise<GenerateRecreationPartnershipOffersOutput> {
    const validatedInput = GenerateRecreationPartnershipOffersInputSchema.parse(input);
    const offers = generateOffers(validatedInput.marketValue);
    return { offers };
}


export async function runNegotiateTradeRoute(input: NegotiateTradeRouteInput): Promise<NegotiateTradeRouteOutput> {
    const { negotiationScore } = NegotiateTradeRouteInputSchema.parse(input);
    const baseCost = 250000;
    const minCost = 50000;
    const maxCost = 2500000;

    const cost = Math.round(maxCost - (negotiationScore / 100) * (maxCost - minCost));
    
    let narrative = "The deal was struck, but the terms feel... heavy. The establishment cost is significant.";
    if (negotiationScore > 80) {
        narrative = "A masterful negotiation! The logistics officials were impressed, offering you a deal with exceptionally favorable terms.";
    } else if (negotiationScore > 40) {
        narrative = "After some back and forth, you've settled on a reasonable price. A fair, if unexceptional, outcome.";
    }

    return { cost, narrative };
}

export async function redeemPromoCode(code: string): Promise<{ tokens: number } | { error: string }> {
    try {
        const promo = promoCodes[code.toUpperCase() as keyof typeof promoCodes];

        if (promo) {
            return { tokens: promo.tokens };
        } else {
            return { error: 'Invalid promo code.' };
        }
    } catch (error) {
        console.error("Error processing promo code:", error);
        return { error: 'Could not validate promo code at this time.' };
    }
}
