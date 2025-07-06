'use server';

/**
 * @fileOverview Generates a random in-game event for the space trading game.
 * 
 * - generateGameEvent - A function that returns a description of a random event.
 * - GenerateGameEventOutput - The return type for the generateGameEvent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateGameEventOutputSchema = z.object({
  eventDescription: z.string().describe('A short, dramatic description of an in-game event that could affect market prices.'),
});
export type GenerateGameEventOutput = z.infer<typeof GenerateGameEventOutputSchema>;

export async function generateGameEvent(): Promise<GenerateGameEventOutput> {
  return generateGameEventFlow();
}

const prompt = ai.definePrompt({
  name: 'generateGameEventPrompt',
  output: { schema: GenerateGameEventOutputSchema },
  prompt: `You are the Game Master for the space trading game HEGGIE. Generate a single, random event that could impact the in-game economy.

Keep the description concise and impactful. The tone should be like a news bulletin.

Examples:
- "A new trade agreement has been signed with the Xylos Corporation, opening up new markets for high-tech goods."
- "Pirate activity has surged in the Orion Spur, making trade routes for raw materials more dangerous."
- "A rare mineral rush has begun in the Kepler system after a massive asteroid was discovered."
- "A diplomatic incident has led to a trade embargo on all goods from the Cygnus sector."
- "Technological breakthrough in hydroponics has led to a surplus of exotic foodstuffs."
`,
});


const generateGameEventFlow = ai.defineFlow(
  {
    name: 'generateGameEventFlow',
    outputSchema: GenerateGameEventOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    return output!;
  }
);
