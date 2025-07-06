
import type { ZoneType } from '@/lib/types';

export const recreationThemes: Record<ZoneType | 'Default', { name: (planetName: string) => string; description: string; buttonText: string; baseIncome: number; }> = {
    'Core World': {
        name: () => "The Celestial Theater",
        description: "Operate a prestigious theater showcasing holographic ballets and zero-g performances for the galactic elite. High culture means high returns.",
        buttonText: "Sell Holo-Ticket",
        baseIncome: 31
    },
    'Trade Hub': {
        name: () => "The Star-Sailor's Arcade",
        description: "A loud, vibrant arcade filled with the latest simulations and games. A popular spot for traders and pilots to unwind.",
        buttonText: "Start VR Session",
        baseIncome: 19
    },
    'Frontier Outpost': {
        name: () => "The Gravity Bar & Grill",
        description: "A simple establishment offering basic games and entertainment. It's the only fun for light-years around.",
        buttonText: "Organize Dart Tournament",
        baseIncome: 10
    },
    'Mining Colony': {
        name: () => "The Deep-Core Casino",
        description: "A subterranean casino where miners bet their hard-earned credits on games of chance. The house always wins... eventually.",
        buttonText: "Spin Holo-Roulette",
        baseIncome: 15
    },
    'Ancient Ruins': {
        name: () => "The Echoes Museum",
        description: "A curated exhibit of alien artifacts. Tourists and researchers pay a premium for a glimpse into the past.",
        buttonText: "Lead Guided Tour",
        baseIncome: 6
    },
    'Corporate Zone': {
        name: () => "The Aegis Relaxation Spire",
        description: "An exclusive, high-tech spa and wellness center for stressed executives. The services are expensive, and so are the profits.",
        buttonText: "Activate Serenity Pod",
        baseIncome: 28
    },
    'Diplomatic Station': {
        name: () => "The Neutral Ground Lounge",
        description: "A sophisticated venue for diplomatic galas and private functions. Every event is a high-stakes affair.",
        buttonText: "Host Diplomatic Gala",
        baseIncome: 25
    },
    'Default': {
        name: (planetName) => `The ${planetName} Holo-plex`,
        description: "A standard-issue entertainment complex. Provide recreation, earn credits, and keep the populace happy.",
        buttonText: "Start Holo-Movie",
        baseIncome: 13
    }
};
