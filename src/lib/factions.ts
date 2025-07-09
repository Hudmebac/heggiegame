
import { Handshake, Shield, CandlestickChart, Scale, Truck, LucideIcon, LandPlot } from 'lucide-react';
import type { FactionId } from './types';

export interface Faction {
    id: FactionId;
    name: string;
    icon: LucideIcon;
    description: string;
    perks: string[];
    risks: string[];
    color: {
        primary: string; // HSL value for --primary
        accent: string; // HSL value for --accent
    };
    alliances: Partial<Record<FactionId, number>>;
}

export const FACTIONS_DATA: Faction[] = [
    {
        id: 'Independent',
        name: 'Independent',
        icon: Handshake,
        description: "You owe allegiance to no one but yourself. You are free to work with any faction without prejudice, but you also lack the powerful backing and perks a major power can provide.",
        perks: ["No inherent reputation penalties with other factions.", "Complete freedom of choice."],
        risks: ["No access to faction-specific perks or rewards.", "Considered an outsider by major powers."],
        color: {
            primary: "210 90% 60%", // Default Blue
            accent: "210 90% 50%"
        },
        alliances: {}
    },
    {
        id: 'Federation of Sol',
        name: 'Federation of Sol',
        icon: Shield,
        description: "The old guard of humanity, focused on security, stability, and maintaining human dominance in the core worlds. They value order and military strength.",
        perks: ["10% discount on ship repairs.", "Increased rewards for security-based missions.", "Access to exclusive military-grade ship modules."],
        risks: ["-15 reputation with the Frontier Alliance.", "Attracts more attention from corporate spies."],
        color: {
            primary: "142 76% 36%", // Green
            accent: "142 76% 26%"
        },
        alliances: { 'Frontier Alliance': -15, 'Corporate Hegemony': 5, 'Veritas Concord': 5 }
    },
    {
        id: 'Corporate Hegemony',
        name: 'Corporate Hegemony',
        icon: CandlestickChart,
        description: "A coalition of mega-corporations that believe the galaxy should be run like a business. Profit is the ultimate goal, and everything has a price.",
        perks: ["5% bonus on all trade profits.", "Access to advanced economic forecasting data.", "Exclusive partnership opportunities for businesses."],
        risks: ["-15 reputation with the Veritas Concord.", "Higher risk of industrial sabotage events."],
        color: {
            primary: "262 80% 58%", // Purple
            accent: "262 80% 48%"
        },
        alliances: { 'Veritas Concord': -15, 'Federation of Sol': 5, 'Independent Miners Guild': -5 }
    },
    {
        id: 'Veritas Concord',
        name: 'Veritas Concord',
        icon: Scale,
        description: "A quasi-religious order dedicated to the sanctity of contracts and the purity of trade. They see commerce as a sacred act and despise corporate greed.",
        perks: ["All contracts and missions have a 5% higher payout.", "Immunity from certain types of market manipulation events.", "Improved outcomes in diplomatic negotiations."],
        risks: ["-15 reputation with the Corporate Hegemony.", "Refusal to deal in illegal goods, even for missions."],
        color: {
            primary: "350 82% 61%", // Pink/Rose
            accent: "350 82% 51%"
        },
        alliances: { 'Corporate Hegemony': -15, 'Federation of Sol': 5 }
    },
    {
        id: 'Frontier Alliance',
        name: 'Frontier Alliance',
        icon: Truck,
        description: "A loose alliance of pioneers, settlers, and haulers who value freedom and self-determination above all. They distrust the centralized power of the core worlds.",
        perks: ["10% reduction in fuel costs.", "Increased availability of high-risk, high-reward hauling contracts.", "Better salvage outcomes from derelicts."],
        risks: ["-15 reputation with the Federation of Sol.", "Limited access to high-tech ship upgrades."],
        color: {
            primary: "24 94% 51%", // Orange
            accent: "24 94% 41%"
        },
        alliances: { 'Federation of Sol': -15, 'Independent Miners Guild': 10 }
    },
    {
        id: 'Independent Miners Guild',
        name: 'Independent Miners Guild',
        icon: LandPlot,
        description: "A rugged collective of miners and prospectors who control the flow of raw materials from the outer rim. They respect hard work and distrust corporate interference.",
        perks: ["15% discount on all raw mineral purchases.", "Access to exclusive, high-yield mining contracts.", "Advanced onboard scanners for resource prospecting."],
        risks: ["-10 reputation with the Corporate Hegemony.", "Higher chance of industrial accidents and pirate raids on mining operations."],
        color: {
            primary: "48 96% 50%", // Yellow/Gold
            accent: "48 96% 40%"
        },
        alliances: { 'Corporate Hegemony': -10, 'Frontier Alliance': 10 }
    }
];
