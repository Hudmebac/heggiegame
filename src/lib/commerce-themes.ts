import type { ZoneType } from '@/lib/types';

export const commerceThemes: Record<ZoneType | 'Default', { name: (planetName: string) => string; description: string; buttonText: string; baseIncome: number; }> = {
    'Core World': {
        name: () => "The Galactic Exchange Plaza",
        description: "Manage a high-traffic commercial plaza where mega-corporations trade assets. The volume is immense, and so are the commissions.",
        buttonText: "Finalize Trade Route",
        baseIncome: 38
    },
    'Trade Hub': {
        name: () => "The Grand Starport Market",
        description: "Oversee a bustling bazaar filled with merchants from every known sector. Every transaction adds to your coffers.",
        buttonText: "Broker Deal",
        baseIncome: 23
    },
    'Frontier Outpost': {
        name: () => "The Scrap & Salvage Depot",
        description: "A rough-and-tumble trading post dealing in salvaged parts and frontier goods. High risk, high reward.",
        buttonText: "Appraise Goods",
        baseIncome: 12
    },
    'Mining Colony': {
        name: () => "The Ore Exchange",
        description: "Run the central hub for all mineral and metal trades in the colony. The demand is constant.",
        buttonText: "Weigh & Log Cargo",
        baseIncome: 18
    },
    'Ancient Ruins': {
        name: () => "The Artifact Brokerage",
        description: "A shadowy market dealing in alien relics and precursor technology. Your clients are few, but they pay handsomely.",
        buttonText: "Authenticate Relic",
        baseIncome: 8
    },
    'Corporate Zone': {
        name: () => "The Aegis Corp Trading Floor",
        description: "A state-of-the-art trading floor where corporate assets are liquidated and acquired. The stakes are astronomical.",
        buttonText: "Execute Merger",
        baseIncome: 33
    },
    'Diplomatic Station': {
        name: () => "The Treaty Annex Emporium",
        description: "A high-security exchange dealing in goods sanctioned by galactic treaties. Your clientele is exclusive and powerful.",
        buttonText: "Ratify Shipment",
        baseIncome: 30
    },
    'Default': {
        name: (planetName) => `The ${planetName} Trading Post`,
        description: "A standard commerce hub. Manage shipments, broker deals, and earn your commission.",
        buttonText: "Process Shipment",
        baseIncome: 15
    }
};
