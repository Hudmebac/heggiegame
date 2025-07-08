'use server';

/**
 * @fileOverview Generates diplomatic missions for the Galactic Official career.
 *
 * - generateDiplomaticMissions - A function that generates a list of diplomatic missions.
 */

import { ai } from '@/ai/genkit';
import { GenerateDiplomaticMissionsInputSchema, GenerateDiplomaticMissionsOutputSchema, type GenerateDiplomaticMissionsInput, type GenerateDiplomaticMissionsOutput } from '@/lib/schemas';
import { SYSTEMS } from '@/lib/systems';

export async function generateDiplomaticMissions(input: GenerateDiplomaticMissionsInput): Promise<GenerateDiplomaticMissionsOutput> {
  return generateDiplomaticMissionsFlow(input);
}

const generateDiplomaticMissionsFlow = ai.defineFlow(
  {
    name: 'generateDiplomaticMissionsFlow',
    inputSchema: GenerateDiplomaticMissionsInputSchema,
    outputSchema: GenerateDiplomaticMissionsOutputSchema,
  },
  async ({ influence, currentSystem }) => {
    const availableSystems = SYSTEMS.map(s => s.name).join(', ');
    
    const prompt = `You are a chief of staff for a Galactic Official in the game HEGGIE. Your task is to generate 4-5 diverse diplomatic missions.

Player Influence: ${influence}
Current Player System: ${currentSystem}
Available Systems: ${availableSystems}

Based on this information, generate a list of missions. Each mission must include:
- **id**: A unique string identifier for the mission.
- **title**: A formal and evocative title (e.g., "The Cygnus Accord Mediation", "Veridian Trade Dispute Investigation").
- **missionType**: 'Treaty', 'Mediation', or 'Investigation'.
- **description**: A short, official briefing on the situation and objectives.
- **system**: The target system for the mission, chosen from the available list.
- **stakeholders**: An array of 2-3 creative faction names involved (e.g., "The Xylos Corporation", "The Crimson Syndicate", "Veritas Guild").
- **payoutCredits**: A credit payout. Higher influence and risk should lead to higher payouts.
- **payoutInfluence**: An influence payout. This is the primary reward. Higher risk missions grant more influence.
- **riskLevel**: 'Low', 'Medium', 'High', or 'Critical'. A politically sensitive issue or dangerous system increases risk.
- **duration**: An estimated time in seconds for the mission (e.g., between 300 and 900 seconds).
- **status**: This should always be set to "Available".

Ensure missions are varied. A 'Treaty' might involve negotiating trade terms. A 'Mediation' could be resolving a border skirmish. An 'Investigation' might be looking into corporate espionage.
`;

    const { output } = await ai.generate({
        prompt: prompt,
        model: 'googleai/gemini-2.0-flash',
        output: { schema: GenerateDiplomaticMissionsOutputSchema },
    });
    
    return output!;
  }
);
