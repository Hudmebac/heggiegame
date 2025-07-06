'use server';

/**
 * @fileOverview Generates a list of NPC traders for the leaderboard.
 * 
 * - generateTraders - A function that returns a list of generated traders.
 */

import { ai } from '@/ai/genkit';
import { GenerateTradersOutput, GenerateTradersOutputSchema } from '@/lib/schemas';

export async function generateTraders(): Promise<GenerateTradersOutput> {
  return generateTradersFlow();
}

const prompt = ai.definePrompt({
  name: 'generateTradersPrompt',
  output: { schema: GenerateTradersOutputSchema },
  prompt: `You are a game designer for the space trading game HEGGIE. Generate a list of 4 interesting and diverse NPC space traders to populate the leaderboard.
  
  Give them cool, evocative names that fit a sci-fi universe. Examples: "Jax 'The Comet' Williams", "Baron Von 'Blackhole' Hess", "Cmdr. Alex 'Void' Ryder".
  
  Assign them a plausible but high net-worth (between 5,000,000 and 20,000,000 credits) and a fleet size (between 5 and 20 ships).
  
  Ensure one of them is clearly an infamous, almost villainous character.

  Return the response in the specified JSON format.
  `,
});

const generateTradersFlow = ai.defineFlow(
  {
    name: 'generateTradersFlow',
    outputSchema: GenerateTradersOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    return output!;
  }
);
