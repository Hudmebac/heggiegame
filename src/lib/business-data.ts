
import { Martini, Home, Briefcase, Factory, Building2, Ticket, Landmark, Spade, Coins, ChevronsUp, Bot, Percent } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface BusinessCost {
    label: string;
    starterPrice: number;
    growth: number;
    icon: LucideIcon;
    isEstablishment?: boolean;
}

export interface BusinessData {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    costs: BusinessCost[];
}

/**
 * Calculates the compounding cost for a given level.
 * @param level - The current level of the item (0-indexed).
 * @param starterPrice - The base cost at level 1.
 * @param growth - The percentage increase per level (e.g., 0.15 for 15%).
 * @param modifier - An additional multiplier for difficulty, planet, etc.
 * @returns The cost to upgrade from `level` to `level + 1`.
 */
export const calculateCost = (level: number, starterPrice: number, growth: number, modifier: number = 1): number => {
    let cost = starterPrice * modifier;
    for (let i = 0; i < level; i++) {
        cost *= (1 + growth);
    }
    return Math.round(cost);
};


export const businessData: BusinessData[] = [
    {
        id: "bar",
        icon: Martini,
        title: "Bar",
        description: "The social and economic cornerstone of any starport. Serve drinks, gather intel, and build a reputation. Upgrades increase income per patron, while bots automate service for passive revenue. A well-run bar can be expanded into a galactic franchise, influencing trade and culture across systems.",
        costs: [
            { label: "Upgrade Bar", starterPrice: 200, growth: 0.15, icon: ChevronsUp },
            { label: "Bot Deployment", starterPrice: 400, growth: 0.25, icon: Bot },
            { label: "Establishment", starterPrice: 100000, growth: 0.50, icon: Coins, isEstablishment: true },
        ]
    },
    {
        id: "residence",
        icon: Home,
        title: "Residence",
        description: "A stable, long-term investment. Collect rent from tenants across the galaxy. Upgrades improve property value and rental income, while service bots handle automated collection. Successful property management can lead to the development of a vast galactic estate.",
        costs: [
            { label: "Upgrade Residence", starterPrice: 250, growth: 0.30, icon: ChevronsUp },
            { label: "Bot Deployment", starterPrice: 300, growth: 0.30, icon: Bot },
            { label: "Deed Issuance", starterPrice: 400000, growth: 1.00, icon: Coins, isEstablishment: true },
        ]
    },
    {
        id: "commerce",
        icon: Briefcase,
        title: "Commerce Hub",
        description: "The heart of interstellar trade. Broker deals between factions, manage complex logistics, and profit from every transaction. Hub upgrades increase deal value, while trading bots automate transactions. A powerful hub can be developed into a galaxy-spanning commercial conglomerate.",
        costs: [
            { label: "Upgrade Hub", starterPrice: 300, growth: 0.35, icon: ChevronsUp },
            { label: "Bot Deployment", starterPrice: 400, growth: 0.35, icon: Bot },
            { label: "Expansion", starterPrice: 800000, growth: 1.50, icon: Coins, isEstablishment: true },
        ]
    },
    {
        id: "industry",
        icon: Factory,
        title: "Industrial Facility",
        description: "The engine of production. Manufacture goods from raw materials, fulfilling large-scale orders for factions and markets. Upgrades boost production speed and efficiency, while assembly bots ensure the facility runs 24/7. Can be expanded into a massive industrial complex, dominating the supply chain.",
        costs: [
            { label: "Upgrade Facility", starterPrice: 350, growth: 0.40, icon: ChevronsUp },
            { label: "Bot Deployment", starterPrice: 200, growth: 0.50, icon: Bot },
            { label: "Permit", starterPrice: 1200000, growth: 1.75, icon: Coins, isEstablishment: true },
        ]
    },
    {
        id: "construction",
        icon: Building2,
        title: "Construction Project",
        description: "Shape the galaxy itself. Undertake massive building projects, from planetary habitats to orbital megastructures. A high-capital venture where each upgrade increases project scope and payout. Can be developed into a legendary megastructure project.",
        costs: [
            { label: "Upgrade Project", starterPrice: 400, growth: 0.75, icon: ChevronsUp },
            { label: "Bot Deployment", starterPrice: 750, growth: 0.80, icon: Bot },
            { label: "Deed Licensing", starterPrice: 2400000, growth: 2.50, icon: Coins, isEstablishment: true },
        ]
    },
    {
        id: "recreation",
        icon: Ticket,
        title: "Recreation Facility",
        description: "The galaxy's escape from the void. Operate entertainment venues, from vibrant arcades to luxurious holo-theaters. Upgrades enhance the quality of attractions, drawing more patrons. Can be expanded into a premier galactic resort, a destination for the wealthy and influential.",
        costs: [
            { label: "Upgrade Facility", starterPrice: 500, growth: 0.80, icon: ChevronsUp },
            { label: "Bot Deployment", starterPrice: 1000, growth: 0.90, icon: Bot },
            { label: "Facility Expansion", starterPrice: 3000000, growth: 3.00, icon: Coins, isEstablishment: true },
        ]
    },
    {
        id: "bank",
        icon: Landmark,
        title: "Galactic Bank",
        description: "The ultimate seat of financial power. As owner, you manage vast capital flows, underwrite galactic ventures, and offer loans, turning it into the most powerful income-generating asset in your portfolio.",
        costs: [
            { label: "Upgrade Infrastructure", starterPrice: 2000000, growth: 0.85, icon: ChevronsUp },
            { label: "Deploy Financial Bot", starterPrice: 5000000, growth: 0.95, icon: Bot },
        ]
    },
    {
        id: "casino",
        icon: Spade,
        title: "Casino",
        description: "Engage in games of chance, from slots to high-stakes poker, at casinos across the galaxy. While not a business you can own, it's a high-risk, high-reward venue to directly leverage your credits. Success depends on luck, reputation, and nerve.",
        costs: []
    }
];
