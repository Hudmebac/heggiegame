
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
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `You are the Game Master for the space trading game HEGGIE. Generate a list of 5 interesting and varied quests for the player.

Include a mix of quest types:
- **Daily:** A high-reward mission that should feel urgent and repeatable.
- **Bounty:** Hunting down a notorious criminal. Should feel dangerous.
- **Quest:** A more story-driven mission, like exploration or resource gathering.
- **Objective:** A timed challenge related to the player's business operations. These should involve achieving a certain number of actions within a time limit. You can also create objectives that require a combination of actions from different business types ('bar', 'residence', 'commerce', 'industry', 'construction', 'recreation').

For **ALL** quest types, you must define:
- **title**: A descriptive title.
- **description**: A short summary of the quest.
- **reward**: The credit amount as a string (e.g., "25000 ¢").
- **type**: One of 'Daily', 'Bounty', 'Quest', or 'Objective'.
- **difficulty**: One of 'Low', 'Medium', or 'High'.

Only for **Objective** quests, you must ALSO define 'tasks' and 'timeLimit'.

Example Non-Objective quest:
{
  "title": "Bounty: The Void Reaper",
  "description": "A notorious pirate known as the Void Reaper has been terrorizing the Kepler sector. Hunt them down and claim the substantial bounty.",
  "reward": "150000 ¢",
  "type": "Bounty",
  "difficulty": "High"
}

Example Objective quest:
{
  "title": "Industrial Push",
  "description": "A corporation needs a rush order. Fulfill as many industrial orders as you can.",
  "reward": "25000 ¢",
  "type": "Objective",
  "difficulty": "Medium",
  "tasks": [
    { "type": "industry", "target": 100, "description": "Fulfill Industry Orders" }
  ],
  "timeLimit": 120
}

Example Combo Objective quest:
{
  "title": "Metropolis Development",
  "description": "A new urban center requires rapid development across multiple sectors.",
  "reward": "75000 ¢",
  "type": "Objective",
  "difficulty": "High",
  "tasks": [
    { "type": "construction", "target": 50, "description": "Complete Construction Jobs" },
    { "type": "commerce", "target": 50, "description": "Broker Commercial Deals" }
  ],
  "timeLimit": 180
}

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
