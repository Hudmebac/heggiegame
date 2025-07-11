
import type { GameEvent, GameEventType } from './types';
import type { LucideIcon } from 'lucide-react';
import { Package, Shield, Rocket, Briefcase, Route, Star, Handshake } from "lucide-react";

export const EventIconMap: Record<GameEventType, LucideIcon> = {
    Trade: Package,
    Combat: Shield,
    Upgrade: Rocket,
    Mission: Briefcase,
    System: Route,
    Career: Star,
    Faction: Handshake,
};

export const MOCK_EVENTS: GameEvent[] = [
    {
        id: 'evt_1',
        timestamp: Date.now() - 86400000 * 2, // 2 days ago
        type: 'Career',
        description: 'Began career as a Hauler.',
        value: 0,
        isMilestone: true,
    },
    {
        id: 'evt_2',
        timestamp: Date.now() - 86000000 * 2,
        type: 'Trade',
        description: 'Sold 50 units of Silicon Nuggets for a profit of 15,000¢.',
        value: 15000,
        isMilestone: false,
    },
    {
        id: 'evt_3',
        timestamp: Date.now() - 85000000 * 2,
        type: 'Upgrade',
        description: 'Upgraded Cargo Hold to Mk. II.',
        value: -25000,
        isMilestone: false,
    },
    {
        id: 'evt_4',
        timestamp: Date.now() - 84000000 * 2,
        type: 'Combat',
        description: 'Defeated pirate vessel "The Rustbucket". Gained 10 reputation.',
        value: 10,
        isMilestone: false,
    },
    {
        id: 'evt_5',
        timestamp: Date.now() - 76400000 * 1.5,
        type: 'Mission',
        description: 'Completed contract: Urgent Fuel Delivery to Sirius.',
        value: 50000,
        isMilestone: true,
    },
    {
        id: 'evt_6',
        timestamp: Date.now() - 66400000 * 1.2,
        type: 'System',
        description: 'Traveled from Sol to Sirius.',
        value: 0,
        isMilestone: false,
    },
    {
        id: 'evt_7',
        timestamp: Date.now() - 26400000,
        type: 'Faction',
        description: 'Pledged allegiance to the Corporate Hegemony.',
        value: -50000,
        isMilestone: true,
    },
    {
        id: 'evt_8',
        timestamp: Date.now() - 16400000,
        type: 'Upgrade',
        description: 'Purchased a new ship: Hauler Mk. II.',
        value: -125000,
        isMilestone: true,
    },
    {
        id: 'evt_9',
        timestamp: Date.now() - 10400000,
        type: 'Combat',
        description: 'Evaded an ambush by the Crimson Syndicate.',
        value: 0,
        isMilestone: false,
    },
    {
        id: 'evt_10',
        timestamp: Date.now() - 5400000,
        type: 'Trade',
        description: 'Bought 10 units of Quantum Entangled Datacore for 1,500,000¢.',
        value: -1500000,
        isMilestone: false,
    },
];
