'use server';

/**
 * @fileOverview Generates lease proposals for a landlord's properties.
 * 
 * - generateLeaseProposals - A function that returns a list of potential tenants.
 */

import { ai } from '@/ai/genkit';
import { GenerateLeaseProposalsInputSchema, GenerateLeaseProposalsOutputSchema, type GenerateLeaseProposalsInput, type GenerateLeaseProposalsOutput } from '@/lib/schemas';

const prompt = ai.definePrompt({
    name: 'generateLeaseProposalsPrompt',
    input: { schema: GenerateLeaseProposalsInputSchema },
    output: { schema: GenerateLeaseProposalsOutputSchema },
    prompt: `You are a Galactic Real Estate Broker for the game HEGGIE. A player with the Landlord career needs tenants for their properties.

The player has {{propertyCount}} available properties. Generate a list of {{proposalCount}} diverse and interesting lease proposals.

For each proposal, you must provide:
- **id**: A unique string identifier.
- **tenantName**: A creative, sci-fi appropriate name for the tenant (e.g., "The Xylan Archae-Historian", "The Crimson Syndicate (Front Office)", "Zero-G Dance Troupe", "Ex-Military Arms Dealer").
- **propertyType**: The specific type of property the tenant requires: 'Residential', 'Commercial', 'Industrial', 'Recreational', or 'Military'.
- **requiredLevel**: The minimum property upgrade level required to meet the tenant's needs. This should range from 1 to 10. Higher-level tenants pay more.
- **rent**: The amount of credits the tenant will pay per cycle. This should be a realistic amount based on the property type and required level. A level 1 property might yield 500-2000 credits, while a level 10 could yield 50,000-200,000.
- **duration**: The duration of the lease in hours. This should be a value between 1 and 48 hours.
- **description**: A short, flavourful description of the tenant and their needs.

Make the proposals varied. Some should be standard, low-risk tenants, while others could be high-paying but high-risk tenants from shady factions. Ensure you generate proposals for different property types.
`,
});

export async function generateLeaseProposals(input: GenerateLeaseProposalsInput): Promise<GenerateLeaseProposalsOutput> {
    const { output } = await prompt(input);
    return output!;
}
