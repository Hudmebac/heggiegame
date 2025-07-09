
'use server';

/**
 * @fileOverview A flow to determine the cost of establishing a new trade route based on negotiation performance.
 *
 * - negotiateTradeRoute - A function that returns the cost and narrative for establishing a new trade route.
 */

import { ai } from '@/ai/genkit';
import { NegotiateTradeRouteInputSchema, NegotiateTradeRouteOutputSchema, type NegotiateTradeRouteInput, type NegotiateTradeRouteOutput } from '@/lib/schemas';

export async function negotiateTradeRoute(input: NegotiateTradeRouteInput): Promise<NegotiateTradeRouteOutput> {
  return negotiateTradeRouteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'negotiateTradeRoutePrompt',
  input: { schema: NegotiateTradeRouteInputSchema },
  output: { schema: NegotiateTradeRouteOutputSchema },
  prompt: `You are a HEGGIE Logistics Official, finalizing the cost to establish a new trade route.

The captain wishes to open a route between **{{{fromSystem}}}** and **{{{toSystem}}}**.
Their performance in a timing-based negotiation minigame resulted in a score of **{{{negotiationScore}}}/100**.

- A perfect score (100) should result in a very low establishment cost (e.g., 50,000 - 150,000 credits).
- An average score (around 50) should be moderately expensive (e.g., 250,000 - 500,000 credits).
- A poor score (near 0) should be prohibitively expensive (e.g., 1,000,000 - 2,500,000 credits).

Based on this score, determine the final **cost** to establish the route.

Then, write a short, flavourful **narrative** that reflects the negotiation outcome.
- For a high score, the narrative should sound like a slick, impressive deal.
- For a low score, the narrative should sound like a grudging, expensive concession.

Return the result in the specified JSON format.
`,
});

const negotiateTradeRouteFlow = ai.defineFlow(
  {
    name: 'negotiateTradeRouteFlow',
    inputSchema: NegotiateTradeRouteInputSchema,
    outputSchema: NegotiateTradeRouteOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
