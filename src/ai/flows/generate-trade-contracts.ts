
'use server';

/**
 * @fileOverview Generates trade route contracts for the Hauler career.
 * 
 * - generateTradeContracts - A function that generates a list of trade contracts.
 */

import { ai } from '@/ai/genkit';
import { GenerateTradeContractsInputSchema, GenerateTradeContractsOutputSchema, type GenerateTradeContractsInput, type GenerateTradeContractsOutput } from '@/lib/schemas';
import { SYSTEMS, ROUTES } from '@/lib/systems';
import { STATIC_ITEMS } from '@/lib/items';

const getConnectedSystems = (systemName: string): string[] => {
    const connected = new Set<string>();
    ROUTES.forEach(route => {
        if (route.from === systemName) connected.add(route.to);
        if (route.to === systemName) connected.add(route.from);
    });
    return Array.from(connected);
}

export async function generateTradeContracts(input: GenerateTradeContractsInput): Promise<GenerateTradeContractsOutput> {
  return generateTradeContractsFlow(input);
}

const generateTradeContractsFlow = ai.defineFlow(
  {
    name: 'generateTradeContractsFlow',
    inputSchema: GenerateTradeContractsInputSchema,
    outputSchema: GenerateTradeContractsOutputSchema,
  },
  async ({ reputation, currentSystem }) => {
    // This flow can be improved by using a proper tool for system/item data.
    // For now, we pass it directly in the context.
    const connectedSystems = getConnectedSystems(currentSystem);
    const availableItems = STATIC_ITEMS.filter(item => item.grade === 'Standard' && item.category !== 'Illegal').map(i => i.name).join(', ');

    const prompt = `You are a logistics dispatcher for the space trading game HEGGIE. Your task is to generate 4-5 trade route contracts for a Hauler career player.

Player Reputation: ${reputation}
Current Player System: ${currentSystem}
Available Destination Systems: ${connectedSystems.join(', ') || 'None'}
Available Cargo Types (examples): ${availableItems}

Based on this information, generate a list of contracts. Each contract must include:
- **id**: A unique string identifier for the contract.
- **fromSystem**: The starting system. This should always be the player's current system: "${currentSystem}".
- **toSystem**: The destination system, chosen from the available list.
- **cargo**: The name of the commodity to be transported. Choose from the available cargo types.
- **quantity**: The amount of cargo to transport (e.g., between 50 and 200 units).
- **payout**: The payment in credits. Higher risk, longer distance, and higher reputation should result in a higher payout.
- **riskLevel**: 'Low', 'Medium', 'High', or 'Critical'. This should be influenced by the destination system's security. Anarchy systems are always Critical risk.
- **duration**: An estimated time in seconds for the contract (e.g., between 120 and 600 seconds). Longer distances should have longer durations.
- **status**: This should always be set to "Available".

Ensure the contracts are varied in terms of destination, cargo, risk, and reward. Do not create contracts if there are no available destination systems.
`;

    const { output } = await ai.generate({
        prompt: prompt,
        model: 'googleai/gemini-2.0-flash',
        output: { schema: GenerateTradeContractsOutputSchema },
    });
    
    return output!;
  }
);
