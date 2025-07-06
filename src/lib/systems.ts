import type { System, Route } from '@/lib/types';

export const SYSTEMS: System[] = [
    { name: 'Sol', x: 20, y: 30, security: 'High', economy: 'Industrial', volatility: 0.1, zoneType: 'Core World', description: 'The cradle of humanity, a bustling hub of industry and political power. Heavily patrolled and regulated, Sol is the safest but most expensive system to operate in.' },
    { name: 'Kepler-186f', x: 45, y: 65, security: 'Medium', economy: 'Agricultural', volatility: 0.3, zoneType: 'Frontier Outpost', description: 'A lush, terraformed world known as the "Galactic Breadbasket." Its fertile lands produce vast quantities of foodstuffs, but its position on the frontier makes it a target for opportunistic raids.' },
    { name: 'Sirius', x: 75, y: 25, security: 'High', economy: 'High-Tech', volatility: 0.2, zoneType: 'Trade Hub', description: 'A dazzling binary star system, home to the galaxy\'s leading technology corporations. The latest ship components and experimental tech flow from its orbital research stations.' },
    { name: 'Proxima Centauri', x: 80, y: 80, security: 'Low', economy: 'Extraction', volatility: 0.5, zoneType: 'Mining Colony', description: 'Rich in rare minerals, Proxima Centauri is a chaotic, dusty system dominated by powerful mining guilds. Law enforcement is scarce, and pirate activity is common.' },
    { name: 'TRAPPIST-1', x: 5, y: 85, security: 'Anarchy', economy: 'Refinery', volatility: 0.8, zoneType: 'Ancient Ruins', description: 'A lawless system shrouded in mystery, littered with the ruins of a precursor civilization. Smugglers and treasure hunters flock here to refine illicit goods and explore the unknown, but few return.' },
];

export const ROUTES: Route[] = [
    { from: 'Sol', to: 'Kepler-186f' },
    { from: 'Sol', to: 'Sirius' },
    { from: 'Kepler-186f', to: 'Proxima Centauri' },
    { from: 'Sirius', to: 'Proxima Centauri' },
    { from: 'Kepler-186f', to: 'TRAPPIST-1' },
];
