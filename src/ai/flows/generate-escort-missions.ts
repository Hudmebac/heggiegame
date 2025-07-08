
'use server';

/**
 * @fileOverview Generates escort missions for the Defender career.
 *
 * - generateEscortMissions - A function that generates a list of escort missions.
 */

import { ai } from '@/ai/genkit';
import { GenerateEscortMissionsInputSchema, GenerateEscortMissionsOutputSchema, type GenerateEscortMissionsInput, type GenerateEscortMissionsOutput } from '@/lib/schemas';
import { SYSTEMS, ROUTES } from '@/lib/systems';

const getConnectedSystems = (systemName: string): string[] => {
    const connected = new Set<string>();
    ROUTES.forEach(route => {
        if (route.from === systemName) connected.add(route.to);
        if (route.to === systemName) connected.add(route.from);
    });
    return Array.from(connected);
}

export async function generateEscortMissions(input: GenerateEscortMissionsInput): Promise<GenerateEscortMissionsOutput> {
  return generateEscortMissionsFlow(input);
}

const generateEscortMissionsFlow = ai.defineFlow(
  {
    name: 'generateEscortMissionsFlow',
    inputSchema: GenerateEscortMissionsInputSchema,
    outputSchema: GenerateEscortMissionsOutputSchema,
  },
  async ({ reputation, currentSystem }) => {
    const connectedSystems = getConnectedSystems(currentSystem);
    
    const prompt = `You are a security dispatcher for the game HEGGIE. Your task is to generate 4-5 diverse escort missions for a Defender career pilot.

Player Reputation: ${reputation}
Current Player System: ${currentSystem}
Available Destination Systems: ${connectedSystems.join(', ') || 'None'}

Based on this information, generate a list of missions. Each mission must include:
- **id**: A unique string identifier for the mission.
- **clientName**: A creative name for the client or vessel (e.g., "Ambassador Kaelen's Shuttle", "Red-Sun Mining Hauler", "The 'Whispering Ghost' Data Courier").
- **missionType**: 'VIP Escort', 'Cargo Convoy', or 'Data Runner'.
- **description**: A short, flavourful description of the escort target and the reason for needing protection.
- **fromSystem**: The starting system. This should always be the player's current system: "${currentSystem}".
- **toSystem**: The destination system, chosen from the available list.
- **payout**: The payment in credits. Higher reputation, risk, and VIP status should lead to higher payouts.
- **riskLevel**: 'Low', 'Medium', 'High', or 'Critical'. A valuable target or dangerous route increases risk.
- **duration**: An estimated time in seconds for the trip (e.g., between 120 and 600 seconds). Longer distances should have longer durations.
- **status**: This should always be set to "Available".

Ensure missions are varied. Include a mix of high-value cargo runs, important personnel transports, and secretive data couriers. Do not create missions if there are no available destination systems.
`;

    const { output } = await ai.generate({
        prompt: prompt,
        model: 'googleai/gemini-2.0-flash',
        output: { schema: GenerateEscortMissionsOutputSchema },
    });
    
    return output!;
  }
);
