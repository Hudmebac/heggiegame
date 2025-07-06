import type { ZoneType } from '@/lib/types';

export const constructionThemes: Record<ZoneType | 'Default', { name: (planetName: string) => string; description: string; buttonText: string; baseIncome: number; }> = {
    'Core World': {
        name: () => "The Sky Spire Project",
        description: "Manage the construction of luxurious arcologies for the galactic elite. Precision and quality are paramount, and the returns are astronomical.",
        buttonText: "Approve Blueprints",
        baseIncome: 50
    },
    'Trade Hub': {
        name: () => "The Orbital Dockyards",
        description: "Oversee the expansion of a bustling starport. The work is constant, with ships always needing new berths and facilities.",
        buttonText: "Lay Foundation",
        baseIncome: 30
    },
    'Frontier Outpost': {
        name: () => "The Frontier Settlement",
        description: "Build a new settlement from the ground up on the galaxy's edge. The work is hard, but you're building a new home for pioneers.",
        buttonText: "Assemble Hab-Unit",
        baseIncome: 16
    },
    'Mining Colony': {
        name: () => "The Deep Core Excavation",
        description: "Construct reinforced mining tunnels and processing plants. The conditions are hazardous, but the mineral wealth is immense.",
        buttonText: "Reinforce Tunnel",
        baseIncome: 24
    },
    'Ancient Ruins': {
        name: () => "The Archeological Restoration",
        description: "A sensitive project to restore and preserve ancient alien structures. The work is slow and meticulous, but of great historical value.",
        buttonText: "Analyze Structure",
        baseIncome: 10
    },
    'Corporate Zone': {
        name: () => "The Corporate Campus Complex",
        description: "Construct a sprawling corporate headquarters with state-of-the-art facilities. Your client demands perfection.",
        buttonText: "Raise Mainframe Core",
        baseIncome: 44
    },
    'Diplomatic Station': {
        name: () => "The Embassy Construction",
        description: "Build secure and opulent embassies for various galactic factions. A project where diplomacy and construction intersect.",
        buttonText: "Erect Shielded Walls",
        baseIncome: 40
    },
    'Default': {
        name: (planetName) => `The ${planetName} Development`,
        description: "A standard construction project. Manage resources, oversee workers, and turn a profit.",
        buttonText: "Start Construction",
        baseIncome: 20
    }
};
