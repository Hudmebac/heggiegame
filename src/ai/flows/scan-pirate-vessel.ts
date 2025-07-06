'use server';

/**
 * @fileOverview Generates a tactical scan of a pirate vessel.
 * 
 * - scanPirateVessel - A function that returns a scan report.
 */

import { ai } from '@/ai/genkit';
import {
  ScanPirateVesselInput,
  ScanPirateVesselInputSchema,
  ScanPirateVesselOutput,
  ScanPirateVesselOutputSchema,
} from '@/lib/schemas';

export async function scanPirateVessel(input: ScanPirateVesselInput): Promise<ScanPirateVesselOutput> {
  return scanPirateVesselFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanPirateVesselPrompt',
  input: { schema: ScanPirateVesselInputSchema },
  output: { schema: ScanPirateVesselOutputSchema },
  prompt: `You are the ship's tactical computer for the space trading game HEGGIE. A player is scanning a pirate vessel.
Generate a short, tactical scan report based on the pirate's details and the player's sensor capabilities.

**Pirate:** {{{pirateName}}}
**Ship Type:** {{{pirateShipType}}}
**Threat Level:** {{{pirateThreatLevel}}}
**Player Sensor Level:** {{{sensorLevel}}}/10

**Instructions:**
- The quality of the scan report depends on the Player's Sensor Level.
- **Low Sensor Level (1-3):** Provide basic, vague information. Mention shield status and weapon presence without specifics.
- **Medium Sensor Level (4-6):** Give more concrete details. Mention specific weapon types (e.g., "laser cannons"), approximate shield strength, and a hint about engine status.
- **High Sensor Level (7-9):** Offer precise tactical data. Identify specific vulnerabilities (e.g., "fluctuating power signature in their aft shields," "damaged port engine thruster"), estimate crew size or experience, and provide a clear tactical recommendation.
- **Max Sensor Level (10):** Provide exceptional, almost predictive intel. Reveal the pirate captain's known tactics, specific cargo they might be targeting, or even potential internal malfunctions on the pirate ship.

**Example Reports:**
- For a low threat pirate with low sensors: "Scan complete. Vessel is showing active shields. Weapon signatures detected."
- For a high threat pirate with high sensors: "Warning: High energy readings from advanced plasma cannons. Shields are overcharged to 120%, but their main reactor is showing signs of instability. A sustained attack on the stern section could trigger a cascade failure. Recommend targeting engines to disable and force a surrender."

Provide the response in the specified JSON format.`,
});


const scanPirateVesselFlow = ai.defineFlow(
  {
    name: 'scanPirateVesselFlow',
    inputSchema: ScanPirateVesselInputSchema,
    outputSchema: ScanPirateVesselOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
