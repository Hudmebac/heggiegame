'use server';

/**
 * @fileOverview Generates a list of NPC traders for the leaderboard from a static list.
 * 
 * - generateTraders - A function that returns a list of generated traders.
 */

import { GenerateTradersOutput, GenerateTradersOutputSchema, TraderSchema } from '@/lib/schemas';
import { traderNames } from '@/lib/traders';
import { bios } from '@/lib/bios';
import { z } from 'zod';

export async function generateTraders(): Promise<GenerateTradersOutput> {
  const shuffledNames = [...traderNames].sort(() => 0.5 - Math.random());
  const shuffledBios = [...bios].sort(() => 0.5 - Math.random());

  const traders = shuffledNames.slice(0, 4).map((name, index) => {
    const bioTemplate = shuffledBios[index % shuffledBios.length];
    return {
      name: name,
      netWorth: Math.floor(5_000_000 + Math.random() * 15_000_000),
      fleetSize: Math.floor(5 + Math.random() * 15),
      bio: bioTemplate.replace(/{Captain}/g, name),
    };
  });
  
  const result = { traders: traders as z.infer<typeof TraderSchema>[] };

  try {
      GenerateTradersOutputSchema.parse(result);
      return result;
  } catch (error) {
      console.error("Static trader data failed validation:", error);
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid static trader data: ${error.message}`);
      }
      throw error;
  }
}
