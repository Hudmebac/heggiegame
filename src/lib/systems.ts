import type { System, Route, Planet } from '@/lib/types';

const solPlanets: Planet[] = [
    { name: 'Mercury', type: 'Barren', description: 'A scorched rock, rich in heavy metals but devoid of life.'},
    { name: 'Venus', type: 'Volcanic', description: 'A toxic greenhouse world with immense atmospheric pressure.' },
    { name: 'Earth', type: 'Terrestrial', description: 'Humanity\'s homeworld, a vibrant and diverse planet.' },
    { name: 'Mars', type: 'Terrestrial', description: 'The red planet, home to sprawling colonies and terraforming projects.' },
    { name: 'Jupiter', type: 'Gas Giant', description: 'A colossal gas giant with a powerful magnetic field and dozens of moons.' },
    { name: 'Saturn', type: 'Gas Giant', description: 'Famous for its magnificent ring system, a sight to behold.' },
    { name: 'Uranus', type: 'Ice Giant', description: 'An icy giant tilted on its side, with a cold, mysterious atmosphere.' },
    { name: 'Neptune', type: 'Ice Giant', description: 'A dark, cold world with supersonic winds and a turbulent atmosphere.' },
];

const keplerPlanets: Planet[] = [
    { name: 'Kepler-186f', type: 'Terrestrial', description: 'The crown jewel of the system, a lush world with sprawling farmlands.' },
    { name: 'Veridia', type: 'Oceanic', description: 'An ocean world with massive floating agricultural platforms.' },
    { name: 'Harbor', type: 'Terrestrial', description: 'A trading outpost planet, bustling with ships and merchants.' },
];

const siriusPlanets: Planet[] = [
    { name: 'Sirius Prime', type: 'Terrestrial', description: 'A city-planet, covered in glittering skyscrapers and advanced tech labs.' },
    { name: 'Innovate', type: 'Barren', description: 'A desert world used for large-scale technology testing and manufacturing.' },
    { name: 'The Archive', type: 'Ice Giant', description: 'A frozen planet housing colossal data centers for the galaxy\'s information.' },
];

const proximaPlanets: Planet[] = [
    { name: 'Proxima b', type: 'Barren', description: 'A heavily mined world, its surface scarred by massive excavation sites.' },
    { name: 'The Quarry', type: 'Volcanic', description: 'A volcanic moon where rare earth minerals are extracted.' },
    { name: 'Dustbowl', type: 'Barren', description: 'An arid world known for its lawless mining camps and frequent dust storms.' },
];

const trappistPlanets: Planet[] = [
    { name: 'TRAPPIST-1e', type: 'Terrestrial', description: 'A mysterious world with strange, alien flora and rumored ruins.' },
    { name: 'The Shadow', type: 'Ice Giant', description: 'A dark, icy planet that never sees the light of its parent star.' },
    { name: 'The Echo', type: 'Gas Giant', description: 'A gas giant that emits strange, rhythmic radio signals.' },
    { name: 'The Relic', type: 'Barren', description: 'A barren rock covered in the remnants of an ancient, unknown civilization.' },
];


export const SYSTEMS: System[] = [
    { name: 'Sol', x: 20, y: 30, security: 'High', economy: 'Industrial', volatility: 0.1, zoneType: 'Core World', description: 'The cradle of humanity, a bustling hub of industry and political power. Heavily patrolled and regulated, Sol is the safest but most expensive system to operate in.', planets: solPlanets },
    { name: 'Kepler-186f', x: 45, y: 65, security: 'Medium', economy: 'Agricultural', volatility: 0.3, zoneType: 'Frontier Outpost', description: 'A lush, terraformed world known as the "Galactic Breadbasket." Its fertile lands produce vast quantities of foodstuffs, but its position on the frontier makes it a target for opportunistic raids.', planets: keplerPlanets },
    { name: 'Sirius', x: 75, y: 25, security: 'High', economy: 'High-Tech', volatility: 0.2, zoneType: 'Trade Hub', description: 'A dazzling binary star system, home to the galaxy\'s leading technology corporations. The latest ship components and experimental tech flow from its orbital research stations.', planets: siriusPlanets },
    { name: 'Proxima Centauri', x: 80, y: 80, security: 'Low', economy: 'Extraction', volatility: 0.5, zoneType: 'Mining Colony', description: 'Rich in rare minerals, Proxima Centauri is a chaotic, dusty system dominated by powerful mining guilds. Law enforcement is scarce, and pirate activity is common.', planets: proximaPlanets },
    { name: 'TRAPPIST-1', x: 5, y: 85, security: 'Anarchy', economy: 'Refinery', volatility: 0.8, zoneType: 'Ancient Ruins', description: 'A lawless system shrouded in mystery, littered with the ruins of a precursor civilization. Smugglers and treasure hunters flock here to refine illicit goods and explore the unknown, but few return.', planets: trappistPlanets },
];

export const ROUTES: Route[] = [
    { from: 'Sol', to: 'Kepler-186f' },
    { from: 'Sol', to: 'Sirius' },
    { from: 'Kepler-186f', to: 'Proxima Centauri' },
    { from: 'Sirius', to: 'Proxima Centauri' },
    { from: 'Kepler-186f', to: 'TRAPPIST-1' },
];
