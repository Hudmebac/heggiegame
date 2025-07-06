import { config } from 'dotenv';
config();

import '@/ai/flows/simulate-market-prices.ts';
import '@/ai/flows/resolve-pirate-encounter.ts';
import '@/ai/flows/generate-avatar.ts';
import '@/ai/flows/generate-game-event.ts';
import '@/ai/flows/scan-pirate-vessel.ts';
import '@/ai/flows/generate-bio.ts';
import '@/ai/flows/generate-quests.ts';
