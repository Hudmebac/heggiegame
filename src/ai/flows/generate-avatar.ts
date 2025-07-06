'use server';

/**
 * @fileOverview Generates a player avatar image.
 * 
 * - generateAvatar - A function that generates an avatar based on a description.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateAvatarInput,
  GenerateAvatarInputSchema,
  GenerateAvatarOutput,
  GenerateAvatarOutputSchema,
} from '@/lib/schemas';

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
