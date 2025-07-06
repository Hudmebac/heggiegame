'use server';

/**
 * @fileOverview Generates a player avatar image.
 * 
 * - generateAvatar - A function that generates an avatar based on a description.
 * - GenerateAvatarInput - The input type for the generateAvatar function.
 * - GenerateAvatarOutput - The return type for the generateAvatar function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAvatarInputSchema = z.object({
  description: z.string().describe('A brief description of the desired avatar style. e.g., "grizzled male space pilot", "young female explorer with vibrant hair"'),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  avatarDataUri: z.string().describe("The generated avatar image as a data URI."),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;


export async function generateAvatar(input: GenerateAvatarInput): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input);
}

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a square avatar image for a space trading game. The style should be detailed, sci-fi concept art. The character should be: ${input.description}.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed or returned no media.');
    }

    return { avatarDataUri: media.url };
  }
);
