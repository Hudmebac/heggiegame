'use server';

/**
 * @fileOverview Generates a player biography.
 * 
 * - generateBio - A function that generates a bio based on a name.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateBioInput,
  GenerateBioInputSchema,
  GenerateBioOutput,
  GenerateBioOutputSchema,
} from '@/lib/schemas';

export async function generateBio(input: GenerateBioInput): Promise<GenerateBioOutput> {
  return generateBioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBioPrompt',
  input: { schema: GenerateBioInputSchema },
  output: { schema: GenerateBioOutputSchema },
  prompt: `You are a creative writer for the space trading game HEGGIE.
  Generate a short, interesting, and flavourful biography for a space captain named {{{name}}}.
  The tone should be a bit pulpy and adventurous. Keep it to 2-3 sentences.
  `,
});

const generateBioFlow = ai.defineFlow(
  {
    name: 'generateBioFlow',
    inputSchema: GenerateBioInputSchema,
    outputSchema: GenerateBioOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
