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

const alphaCentauriPlanets: Planet[] = [
    { name: 'Centauri Prime', type: 'Terrestrial', description: 'A corporate headquarters world, gleaming with chrome and ambition.' },
    { name: 'Proxima b', type: 'Barren', description: 'A tidally-locked world with one side perpetually scorched and the other frozen.' },
];

const tauCetiPlanets: Planet[] = [
    { name: 'New Eden', type: 'Terrestrial', description: 'Vast, genetically-engineered plains that feed a dozen systems.' },
    { name: 'Greenhouse', type: 'Oceanic', description: 'A humid ocean world covered in floating hydroponic farms.' },
];

const luytensStarPlanets: Planet[] = [
    { name: 'Luyten\'s Rock', type: 'Barren', description: 'A planet-wide factory floor, shrouded in industrial smog.' },
    { name: 'The Forge', type: 'Volcanic', description: 'A moon dedicated entirely to refining rare and volatile ores.' },
];

const wolf359Planets: Planet[] = [
    { name: 'The Den', type: 'Barren', description: 'A notorious pirate haven carved into a massive asteroid.' },
    { name: 'The Graveyard', type: 'Ice Giant', description: 'A frigid gas giant whose rings are a maze of derelict ships.' },
];


export const SYSTEMS: System[] = [
    { name: 'Sol', x: 100, y: 100, security: 'High', economy: 'Industrial', volatility: 0.1, zoneType: 'Core World', description: 'The cradle of humanity, a bustling hub of industry and political power. Heavily patrolled and regulated, Sol is the safest but most expensive system to operate in.', planets: solPlanets },
    { name: 'Kepler-186f', x: 130, y: 150, security: 'Medium', economy: 'Agricultural', volatility: 0.3, zoneType: 'Frontier Outpost', description: 'A lush, terraformed world known as the "Galactic Breadbasket." Its fertile lands produce vast quantities of foodstuffs, but its position on the frontier makes it a target for opportunistic raids.', planets: keplerPlanets },
    { name: 'Sirius', x: 150, y: 70, security: 'High', economy: 'High-Tech', volatility: 0.2, zoneType: 'Trade Hub', description: 'A dazzling binary star system, home to the galaxy\'s leading technology corporations. The latest ship components and experimental tech flow from its orbital research stations.', planets: siriusPlanets },
    { name: 'Proxima Centauri', x: 160, y: 170, security: 'Low', economy: 'Extraction', volatility: 0.5, zoneType: 'Mining Colony', description: 'Rich in rare minerals, Proxima Centauri is a chaotic, dusty system dominated by powerful mining guilds. Law enforcement is scarce, and pirate activity is common.', planets: proximaPlanets },
    { name: 'TRAPPIST-1', x: 80, y: 180, security: 'Anarchy', economy: 'Refinery', volatility: 0.8, zoneType: 'Ancient Ruins', description: 'A lawless system shrouded in mystery, littered with the ruins of a precursor civilization. Smugglers and treasure hunters flock here to refine illicit goods and explore the unknown, but few return.', planets: trappistPlanets },
    { name: 'Alpha Centauri', x: 180, y: 40, security: 'High', economy: 'High-Tech', volatility: 0.15, zoneType: 'Corporate Zone', description: 'The gleaming heart of corporate power, where deals are made that shape the galaxy.', planets: alphaCentauriPlanets },
    { name: 'Tau Ceti', x: 110, y: 190, security: 'Medium', economy: 'Agricultural', volatility: 0.4, zoneType: 'Frontier Outpost', description: 'A breadbasket system known for its independent spirit and robust organic exports.', planets: tauCetiPlanets },
    { name: 'Luyten\'s Star', x: 60, y: 75, security: 'Low', economy: 'Refinery', volatility: 0.6, zoneType: 'Industrial', description: 'A gritty, hard-working system that refines the raw materials for the core worlds.', planets: luytensStarPlanets },
    { name: 'Wolf 359', x: 190, y: 195, security: 'Anarchy', economy: 'Extraction', volatility: 0.9, zoneType: 'Ancient Ruins', description: 'A notorious pirate stronghold. Enter at your own peril.', planets: wolf359Planets },
];

export const ROUTES: Route[] = [
    { from: 'Sol', to: 'Sirius' },
    { from: 'Sol', to: 'Luyten\'s Star' },
    { from: 'Sirius', to: 'Alpha Centauri' },
    { from: 'Luyten\'s Star', to: 'Kepler-186f' },
    { from: 'Kepler-186f', to: 'Proxima Centauri' },
    { from: 'Kepler-186f', to: 'Tau Ceti' },
    { from: 'Proxima Centauri', to: 'Wolf 359' },
    { from: 'Tau Ceti', to: 'TRAPPIST-1' },
];
