import type { ZoneType } from '@/lib/types';

export const industryThemes: Record<ZoneType | 'Default', { name: (planetName: string) => string; description: string; buttonText: string; baseIncome: number; }> = {
    'Core World': {
        name: () => "The OmniCorp Fabrication Plant",
        description: "Oversee a state-of-the-art industrial complex producing high-grade components. The production quotas are demanding, but the profits are immense.",
        buttonText: "Initiate Production Cycle",
        baseIncome: 75
    },
    'Trade Hub': {
        name: () => "The Star-Lane Manufacturing Nexus",
        description: "A sprawling factory district that supplies the entire trade hub. The logistics are complex, but the output is constant.",
        buttonText: "Fulfill Order",
        baseIncome: 45
    },
    'Frontier Outpost': {
        name: () => "The Back-Alley Workshop",
        description: "A makeshift workshop that builds and repairs equipment for frontiersmen. The work is dirty, but always in demand.",
        buttonText: "Forge Component",
        baseIncome: 24
    },
    'Mining Colony': {
        name: () => "The Primary Smelting Works",
        description: "Process raw ore from the mines into refined metals. The heat is intense, but so is the profit margin.",
        buttonText: "Start Smelter",
        baseIncome: 36
    },
    'Ancient Ruins': {
        name: () => "The Precursor Re-Compiler",
        description: "A mysterious automated factory that re-purposes alien alloys. The technology is poorly understood but incredibly valuable.",
        buttonText: "Activate Re-Compiler",
        baseIncome: 15
    },
    'Corporate Zone': {
        name: () => "The Aegis Industrial Spire",
        description: "A towering spire dedicated to advanced manufacturing under a strict corporate charter. Efficiency is everything.",
        buttonText: "Optimize Assembly Line",
        baseIncome: 66
    },
    'Diplomatic Station': {
        name: () => "The Treaty Fabrication Annex",
        description: "A high-security facility producing specialized equipment for diplomatic missions. Clients pay a premium for quality and secrecy.",
        buttonText: "Fabricate Secure Device",
        baseIncome: 60
    },
    'Default': {
        name: (planetName) => `The Industrial Plant on ${planetName}`,
        description: "A standard industrial plant. Manage production, meet quotas, and generate substantial revenue.",
        buttonText: "Run Production Line",
        baseIncome: 30
    }
};
