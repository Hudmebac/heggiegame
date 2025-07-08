import type { ZoneType } from '@/lib/types';

export const bankThemes: Record<ZoneType | 'Default', { name: (planetName: string) => string; description: string; buttonText: string; baseIncome: number; }> = {
    'Core World': {
        name: () => "Galactic Central Bank",
        description: "Oversee the primary financial institution of the core worlds. Manage massive capital flows and earn staggering commissions from interplanetary transactions.",
        buttonText: "Process Galactic Transfer",
        baseIncome: 500
    },
    'Trade Hub': {
        name: () => "The Star-Trader's Credit Union",
        description: "A bustling financial hub catering to merchants and corporations. Every deal brokered in the system adds to your vault.",
        buttonText: "Approve Trade Credit",
        baseIncome: 300
    },
    'Frontier Outpost': {
        name: () => "The Prospector's Gold Standard",
        description: "A rugged, secure vault on the galaxy's edge. Provide financial security for pioneers and prospectors for a handsome fee.",
        buttonText: "Secure Prospector's Haul",
        baseIncome: 120
    },
    'Mining Colony': {
        name: () => "The Ore & Ingot Depository",
        description: "Manage the financial backbone of a mining colony. Every ounce of precious metal extracted passes through your ledgers.",
        buttonText: "Underwrite Mineral Futures",
        baseIncome: 200
    },
    'Ancient Ruins': {
        name: () => "The Relic Depository Trust",
        description: "A secret bank dealing in ancient artifacts and lost technologies. The clients are anonymous, the assets are priceless.",
        buttonText: "Appraise Artifact Value",
        baseIncome: 75
    },
    'Corporate Zone': {
        name: () => "Aegis Interstellar Bank",
        description: "The official bank of the corporate sector. Handle mergers, acquisitions, and hostile takeovers on a galactic scale.",
        buttonText: "Finance Hostile Takeover",
        baseIncome: 450
    },
    'Diplomatic Station': {
        name: () => "The Ambassadorial Treasury",
        description: "A high-security bank that manages the funds for entire empires and factions. Your discretion is your greatest asset.",
        buttonText: "Clear Diplomatic Funds",
        baseIncome: 400
    },
    'Default': {
        name: (planetName) => `The First Bank of ${planetName}`,
        description: "A respectable financial institution. Manage accounts, process transactions, and grow your wealth.",
        buttonText: "Process Transaction",
        baseIncome: 150
    }
};
