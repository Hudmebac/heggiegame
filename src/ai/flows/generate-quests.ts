'use server';

/**
 * @fileOverview Generates a list of quests for the space trading game.
 * 
 * - generateQuests - A function that returns a list of generated quests.
 */

import { ai } from '@/ai/genkit';
import { GenerateQuestsOutputSchema } from '@/lib/schemas';
import { GenerateQuestsOutput } from '@/lib/schemas';


export async function generateQuests(): Promise<GenerateQuestsOutput> {
  return generateQuestsFlow();
}

const prompt = ai.definePrompt({
  name: 'generateQuestsPrompt',
  output: { schema: GenerateQuestsOutputSchema },
  prompt: `You are the Game Master for the space trading game HEGGIE. Generate a list of 5 interesting and varied quests for the player.

Include a mix of quest types:
- **Daily:** A high-reward mission that should feel urgent and repeatable.
- **Bounty:** Hunting down a notorious criminal. Should feel dangerous.
- **Quest:** A more story-driven mission, like exploration or resource gathering.

Make the titles and descriptions evocative and fit the pulpy, sci-fi tone of the game. The rewards should be appropriate for the difficulty.

Return the response in the specified JSON format.
`,
});

const generateQuestsFlow = ai.defineFlow(
  {
    name: 'generateQuestsFlow',
    outputSchema: GenerateQuestsOutputSchema,
  },
  async () => {
    const { output } = await prompt();
    return output!;
  }
);
