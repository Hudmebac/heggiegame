'use server';

/**
 * @fileOverview Generates taxi missions for the Taxi Pilot career.
 *
 * - generateTaxiMissions - A function that generates a list of taxi missions.
 */

import { ai } from '@/ai/genkit';
import { GenerateTaxiMissionsInputSchema, GenerateTaxiMissionsOutputSchema, type GenerateTaxiMissionsInput, type GenerateTaxiMissionsOutput } from '@/lib/schemas';
import { SYSTEMS, ROUTES } from '@/lib/systems';

const getConnectedSystems = (systemName: string): string[] => {
    const connected = new Set<string>();
    ROUTES.forEach(route => {
        if (route.from === systemName) connected.add(route.to);
        if (route.to === systemName) connected.add(route.from);
    });
    return Array.from(connected);
}

export async function generateTaxiMissions(input: GenerateTaxiMissionsInput): Promise<GenerateTaxiMissionsOutput> {
  return generateTaxiMissionsFlow(input);
}

const generateTaxiMissionsFlow = ai.defineFlow(
  {
    name: 'generateTaxiMissionsFlow',
    inputSchema: GenerateTaxiMissionsInputSchema,
    outputSchema: GenerateTaxiMissionsOutputSchema,
  },
  async ({ reputation, currentSystem }) => {
    const connectedSystems = getConnectedSystems(currentSystem);
    
    const prompt = `You are a dispatcher for a galactic taxi service in the game HEGGIE. Your task is to generate 4-5 diverse taxi missions for a pilot.

Player Reputation: ${reputation}
Current Player System: ${currentSystem}
Available Destination Systems: ${connectedSystems.join(', ') || 'None'}

Based on this information, generate a list of missions. Each mission must include:
- **id**: A unique string identifier for the mission.
- **passengerName**: A creative, evocative name for the passenger (e.g., "Corpo-auditor Klex", "Down-on-his-luck prospector", "Glitched Pleasure-bot").
- **description**: A short, flavourful description of the passenger and their reason for travel.
- **fromSystem**: The starting system. This should always be the player's current system: "${currentSystem}".
- **toSystem**: The destination system, chosen from the available list.
- **fare**: The payment in credits. Higher reputation and risk should lead to higher fares.
- **bonus**: A potential bonus for speed and safety, usually 10-25% of the fare.
- **riskLevel**: 'Low', 'Medium', 'High', or 'Critical'. A shady passenger or dangerous route increases risk.
- **duration**: An estimated time in seconds for the trip (e.g., between 120 and 600 seconds). Longer distances should have longer durations.
- **status**: This should always be set to "Available".

Ensure missions are varied. Include a mix of VIPs, tourists, shady characters, and regular folks. Do not create missions if there are no available destination systems.
`;

    const { output } = await ai.generate({
        prompt: prompt,
        model: 'googleai/gemini-2.0-flash',
        output: { schema: GenerateTaxiMissionsOutputSchema },
    });
    
    return output!;
  }
);
