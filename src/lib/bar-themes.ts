import type { ZoneType } from '@/lib/types';

export const barThemes: Record<ZoneType | 'Default', { name: (planetName: string) => string; description: string; buttonText: string; baseIncome: number; }> = {
    'Core World': {
        name: () => "The Gilded Orbit Lounge",
        description: "Serve high-end cocktails to diplomats and corporate executives in this luxurious, high-security establishment. The payouts are substantial, but discretion is paramount.",
        buttonText: "Mix Hyper-Gin Martini",
        baseIncome: 25
    },
    'Trade Hub': {
        name: () => "The Drifting Bazaar Cantina",
        description: "This chaotic bar is always packed with traders from a hundred worlds. The work is fast-paced, but the tips are good and the rumors are better.",
        buttonText: "Pour Spiced Ale",
        baseIncome: 15
    },
    'Frontier Outpost': {
        name: () => "The Dusty Mug",
        description: "A gritty outpost bar where prospectors and smugglers share stories over cheap synth-ale. Listen closely for valuable intel.",
        buttonText: "Serve Synth-Ale",
        baseIncome: 8
    },
    'Mining Colony': {
        name: () => "The Quarry Inn",
        description: "Serve hardworking miners after a long shift in this no-frills watering hole. They aren't picky, but they drink a lot.",
        buttonText: "Pour Asteroid Brew",
        baseIncome: 12
    },
    'Ancient Ruins': {
        name: () => "The Whispering Echo",
        description: "A strange, silent establishment built into the ruins. Patrons are few, but they pay in strange and valuable currency for even stranger drinks.",
        buttonText: "Dispense Relic Elixir",
        baseIncome: 5
    },
    'Corporate Zone': {
        name: () => "The Executive Retreat",
        description: "A pristine, exclusive bar for corporate bigwigs. Discretion is key, and the rewards for good service reflect it.",
        buttonText: "Serve Vintage Nectar",
        baseIncome: 22
    },
    'Diplomatic Station': {
        name: () => "The Ambassador's Respite",
        description: "A sophisticated lounge where galactic treaties are made and broken over glasses of aged brandy. Every drink served could influence galactic policy.",
        buttonText: "Pour Aldebaran Brandy",
        baseIncome: 20
    },
    'Default': {
        name: (planetName) => `The Cantina on ${planetName}`,
        description: "A typical spaceport bar. Serve drinks, earn credits, and listen for whispers of opportunity.",
        buttonText: "Serve Drink",
        baseIncome: 10
    }
};
