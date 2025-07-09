'use server';

/**
 * @fileOverview Generates a list of quests for the space trading game from a static list.
 * 
 * - generateQuests - A function that returns a list of generated quests.
 */

import type { GenerateQuestsOutput } from '@/lib/schemas';
import { GenerateQuestsOutputSchema, QuestSchema } from '@/lib/schemas';
import { STATIC_QUESTS } from '@/lib/quests';
import { z } from 'zod';
import type { Quest } from '@/lib/types';


export async function generateQuests(): Promise<GenerateQuestsOutput> {
  const shuffled = [...STATIC_QUESTS].sort(() => 0.5 - Math.random());
  
  // Ensure we have one of each type if possible, then fill the rest randomly
  const bounty = shuffled.find(q => q.type === 'Bounty');
  const daily = shuffled.find(q => q.type === 'Daily');
  const quest = shuffled.find(q => q.type === 'Quest');
  const objective = shuffled.find(q => q.type === 'Objective');

  const baseQuests = [bounty, daily, quest, objective].filter((q): q is Quest => q !== undefined);
  const usedTitles = new Set(baseQuests.map(q => q.title));
  
  const remainingQuests = shuffled.filter(q => !usedTitles.has(q.title));
  
  const finalQuests = [...baseQuests];
  const questsToFill = 5 - finalQuests.length;

  if (questsToFill > 0) {
      finalQuests.push(...remainingQuests.slice(0, questsToFill));
  }
  
  const result = { quests: finalQuests as z.infer<typeof QuestSchema>[] };
  
  try {
      GenerateQuestsOutputSchema.parse(result);
      return result;
  } catch (error) {
      console.error("Static quest data failed validation:", error);
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid static quest data: ${error.message}`);
      }
      throw error;
  }
}
