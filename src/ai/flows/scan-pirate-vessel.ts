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
Generate a short, tactical scan report based on the pirate's details.

The report should provide a useful hint to the player about how to handle the encounter. The tone should be like a computer read-out.

**Pirate:** {{{pirateName}}}
**Ship Type:** {{{pirateShipType}}}
**Threat Level:** {{{pirateThreatLevel}}}

**Example Reports:**
- For a low threat pirate: "Scan complete. The vessel's shields are fluctuating. Minimal weapon signatures detected. The ship appears to be running on a skeleton crew."
- For a high threat pirate: "Warning: High energy readings detected. The ship is heavily armed with plasma cannons. Hull integrity is at 100%. Evasive maneuvers may be difficult due to their advanced engine signature."
- Hinting at a bribe: "Life support readings indicate the crew is running low on provisions. The captain is known to be motivated by greed over glory."
- Hinting at a fight: "The ship's thrusters are damaged, suggesting low maneuverability. A direct assault may be effective."
- Hinting at evasion: "The vessel's sensor array is primitive. A quick jump to warp might go undetected."

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
