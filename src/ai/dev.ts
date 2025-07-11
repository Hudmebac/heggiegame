
import { config } from 'dotenv';
config();

import '@/ai/flows/resolve-pirate-encounter.ts';
import '@/ai/flows/generate-game-event.ts';
import '@/ai/flows/scan-pirate-vessel.ts';
import '@/ai/flows/generate-partnership-offers.ts';
import '@/ai/flows/generate-residence-partnership-offers.ts';
import '@/ai/flows/generate-commerce-partnership-offers.ts';
import '@/ai/flows/generate-industry-partnership-offers.ts';
import '@/ai/flows/generate-construction-partnership-offers.ts';
import '@/ai/flows/generate-recreation-partnership-offers.ts';
import '@/ai/flows/generate-bank-partnership-offers.ts';
import '@/ai/flows/negotiate-trade-route.ts';
