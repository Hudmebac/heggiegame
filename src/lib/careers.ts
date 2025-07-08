
import type { Career, PlayerShip } from '@/lib/types';
import { Truck, CarTaxiFront, Building, CandlestickChart, Shield, Sword, Scale, LucideIcon } from 'lucide-react';

export interface CareerData {
    id: Career;
    name: string;
    icon: LucideIcon;
    description: string;
    perks: string[];
    risks: string[];
    startingFleet: PlayerShip[];
    startingNetWorth: number;
    startingInfluence?: number;
    page: string;
}

const baseShip: Omit<PlayerShip, 'instanceId' | 'shipId' | 'name'> = {
    cargoLevel: 1, weaponLevel: 1, shieldLevel: 1, hullLevel: 1, fuelLevel: 1, sensorLevel: 1, droneLevel: 1,
    powerCoreLevel: 1, overdriveEngine: false, warpStabilizer: false, stealthPlating: false, targetingMatrix: false, anomalyAnalyzer: false, fabricatorBay: false,
    gravAnchor: false, aiCoreInterface: false, bioDomeModule: false, flakDispensers: false, boardingTubeSystem: false, terraformToolkit: false, thermalRegulator: false, diplomaticUplink: false,
};

export const CAREER_DATA: CareerData[] = [
    {
        id: 'Hauler',
        name: 'Hauler',
        icon: Truck,
        description: 'Establish and negotiate interplanetary trade routes, managing cargo and logistics.',
        perks: ['Start with a dedicated freighter', 'Steady income from route contracts', 'Access to cargo capacity and security upgrades'],
        risks: ['Pirate ambushes on trade routes', 'High maintenance and fuel costs for large ships'],
        startingFleet: [{ ...baseShip, instanceId: 1, shipId: 'hauler-mk2', name: "My First Hauler" }],
        startingNetWorth: 20000,
        page: '/hauler'
    },
    {
        id: 'Taxi Pilot',
        name: 'Taxi Pilot',
        icon: CarTaxiFront,
        description: 'Transport diplomats, civilians, and VIPs across the galaxy in short-range shuttles.',
        perks: ['Frequent, fast-turnaround side missions', 'High income variability with bonus tips', 'Build reputation with repeat clients'],
        risks: ['Time-sensitive routes with penalties', 'Hostile encounters targeting VIPs'],
        startingFleet: [{ ...baseShip, instanceId: 1, shipId: 'shuttle-s', name: "My First Taxi" }],
        startingNetWorth: 15000,
        page: '/taxi'
    },
    {
        id: 'Landlord',
        name: 'Landlord',
        icon: Building,
        description: 'Build, rent, upgrade, and flip property across planets for long-term passive income.',
        perks: ['Reliable long-term income stream', 'Engage in property valuation events and bidding wars', 'Upgradeable utilities, aesthetics, and security'],
        risks: ['Property maintenance decay', 'Planetary economy changes affecting rent values'],
        startingFleet: [{ ...baseShip, instanceId: 1, shipId: 'shuttle-s', name: "Proprietor's Shuttle" }],
        startingNetWorth: 75000,
        page: '/landlord'
    },
    {
        id: 'Trader',
        name: 'Trader',
        icon: CandlestickChart,
        description: 'Master the galactic market by buying low and selling high across star systems.',
        perks: ['Start with discounted market access', 'Establish planetary bases and warehouses', 'Access to trade route forecasting tools'],
        risks: ['Pirate theft of cargo', 'Warehouse break-ins and price crashes'],
        startingFleet: [{ ...baseShip, instanceId: 1, shipId: 'shuttle-s', name: "Trader's Skiff" }],
        startingNetWorth: 30000,
        page: '/trader'
    },
    {
        id: 'Defender',
        name: 'Defender',
        icon: Shield,
        description: 'Protect trade ships, defend planets, and upgrade planetary defense networks.',
        perks: ['Government stipends for planetary defense', 'Access to an escort quest board', 'Unique defense grid mini-game'],
        risks: ['Failure penalties for security breaches', 'Targeted retaliation waves from pirates'],
        startingFleet: [{ ...baseShip, instanceId: 1, shipId: 'shuttle-s', name: "Guardian's Escort", weaponLevel: 2 }],
        startingNetWorth: 25000,
        page: '/defence'
    },
    {
        id: 'Fighter',
        name: 'Fighter',
        icon: Sword,
        description: 'Take on strike missions, planetary raids, and conflict quests for galactic factions.',
        perks: ['Access to high-command attack quests', 'Bonuses for tactical precision', 'Unique assault uplink mini-game'],
        risks: ['Faction retaliation events', 'High resource drain from unsuccessful strikes'],
        startingFleet: [{ ...baseShip, instanceId: 1, shipId: 'shuttle-s', name: "Mercenary's Viper", weaponLevel: 2, shieldLevel: 2 }],
        startingNetWorth: 25000,
        page: '/military'
    },
    {
        id: 'Galactic Official',
        name: 'Galactic Official',
        icon: Scale,
        description: 'Rise from Governor to Galactic Ambassador through polls and political influence.',
        perks: ['Assign Defender/Fighter missions', 'Unlock planetary negotiation interface', 'Passive income from governance'],
        risks: ['Reputation loss for ignored duties', 'Diplomatic backlash from failed treaties'],
        startingFleet: [{ ...baseShip, instanceId: 1, shipId: 'shuttle-s', name: "Diplomat's Courier" }],
        startingNetWorth: 50000,
        startingInfluence: 100,
        page: '/official'
    },
];
