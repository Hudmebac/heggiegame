'use server';

/**
 * @fileOverview A Game Master AI that resolves casino game outcomes.
 * 
 * - resolveCasinoGame - A function that resolves a casino game based on type and stake.
 */

import { ai } from '@/ai/genkit';
import { ResolveCasinoGameInputSchema, ResolveCasinoGameOutputSchema, type ResolveCasinoGameInput, type ResolveCasinoGameOutput } from '@/lib/schemas';

export async function resolveCasinoGame(input: ResolveCasinoGameInput): Promise<ResolveCasinoGameOutput> {
  return resolveCasinoGameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resolveCasinoGamePrompt',
  input: { schema: ResolveCasinoGameInputSchema },
  output: { schema: ResolveCasinoGameOutputSchema },
  prompt: `You are the Casino Game Master for the space trading game HEGGIE. A player is trying their luck.
Your task is to determine the outcome of the game based on the provided rules, calculate the result, and write a short, flavourful narrative for what happened.

**Game Details:**
- Game Type: {{{gameType}}}
- Player Stake: {{{stake}}} credits
- Player Reputation: {{{playerReputation}}} (Higher reputation might slightly nudge luck in their favor)

**Game Rules & Probabilities:**
- **slots**: 0.75 win chance. Payout up to 3x stake.
- **table**: 0.5 win chance. Payout up to 10x stake.
- **poker**: 0.5 win chance. Payout up to 15x stake. 0.1 bonus win chance.
- **vip**: 0.3 win chance. Payout up to 10x stake. 0.5 bonus win chance.
- **sportsbook**: 0.45 win chance. Payout up to 3x stake. 0.05 bonus win chance.
- **lottery**: 0.02 win chance. Payout is 1000x stake. 0.15 bonus win chance.

**Your Steps:**
1.  **Determine Win/Loss:** Based on the \`gameType\` and its win chance, decide if the player won or lost. A higher \`playerReputation\` should slightly improve their odds.
2.  **Calculate Winnings:**
    - If the player lost, \`winnings\` is 0.
    - If the player won, calculate a random payout within the specified multiplier range (e.g., for slots, a random number between 1.1x and 3x the stake). For the lottery, the payout is fixed at 1000x.
3.  **Determine Bonus Win:** If the game has a bonus chance, roll for that separately. If they win a bonus, set \`bonusWin\` to true and calculate a \`bonusAmount\`. The bonus should be a significant, memorable amount (e.g., 5,000 to 50,000 credits).
4.  **Write Narrative:** Create a short (1-2 sentences), engaging narrative describing the outcome. Be creative!
    - *Win Example:* "The reels click into place... 7-7-7! A cascade of credits pours from the machine as the alarms blare your victory."
    - *Loss Example:* "You call the opponent's bluff, only to see them lay down a royal flush. A costly lesson in reading tells."
    - *Bonus Win Example:* "As you cash out your winnings, the casino manager approaches. 'The house is so impressed, we'd like to offer you a... token of our appreciation.'"

Return the result in the specified JSON format.
`,
});

const resolveCasinoGameFlow = ai.defineFlow(
  {
    name: 'resolveCasinoGameFlow',
    inputSchema: ResolveCasinoGameInputSchema,
    outputSchema: ResolveCasinoGameOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
