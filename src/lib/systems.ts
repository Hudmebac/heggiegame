
import type { System, Route, Planet } from '@/lib/types';

const solPlanets: Planet[] = [
    { name: 'Mercury', type: 'Barren', description: 'A scorched rock, rich in heavy metals but devoid of life.'},
    { name: 'Venus', type: 'Volcanic', description: 'A toxic greenhouse world with immense atmospheric pressure.' },
    { name: 'Earth', type: 'Terrestrial', description: 'Humanity\'s homeworld, a vibrant and diverse planet.' },
    { name: 'Mars', type: 'Terrestrial', description: 'The red planet, home to sprawling colonies and terraforming projects.' },
    { name: 'Ceres', type: 'Barren', description: 'The largest object in the asteroid belt, now a hub for mining and trade.' },
    { name: 'Jupiter', type: 'Gas Giant', description: 'A colossal gas giant with a powerful magnetic field and dozens of moons.' },
    { name: 'Io', type: 'Volcanic', description: 'A moon of Jupiter, its surface constantly reshaped by hundreds of active volcanoes.' },
    { name: 'Europa', type: 'Oceanic', description: 'An icy moon of Jupiter with a vast subsurface ocean, believed to harbor life.' },
    { name: 'Ganymede', type: 'Ice Giant', description: 'Jupiter\'s largest moon, a world of ice and rock with a thin oxygen atmosphere.' },
    { name: 'Callisto', type: 'Barren', description: 'A heavily cratered moon of Jupiter, its ancient surface holding secrets of the early solar system.' },
    { name: 'Saturn', type: 'Gas Giant', description: 'Famous for its magnificent ring system, a sight to behold.' },
    { name: 'Titan', type: 'Terrestrial', description: 'A moon of Saturn with a thick, nitrogen-rich atmosphere and rivers of liquid methane.' },
    { name: 'Uranus', type: 'Ice Giant', description: 'An icy giant tilted on its side, with a cold, mysterious atmosphere.' },
    { name: 'Neptune', type: 'Ice Giant', description: 'A dark, cold world with supersonic winds and a turbulent atmosphere.' },
    { name: 'Pluto', type: 'Ice Giant', description: 'A distant dwarf planet, a world of frozen plains and icy mountains.' },
    { name: 'Eris', type: 'Ice Giant', description: 'A dwarf planet in the scattered disc, one of the most distant objects in the Sol system.' },
];

const keplerPlanets: Planet[] = [
    { name: 'Kepler-186f', type: 'Terrestrial', description: 'The crown jewel of the system, a lush world with sprawling farmlands.' },
    { name: 'Veridia', type: 'Oceanic', description: 'An ocean world with massive floating agricultural platforms.' },
    { name: 'Harbor', type: 'Terrestrial', description: 'A trading outpost planet, bustling with ships and merchants.' },
    { name: 'Kepler-186b', type: 'Barren', description: 'A barren rock scorched by its proximity to the star.'},
    { name: 'Kepler-186c', type: 'Barren', description: 'A desolate wasteland, rich in heavy metals.'},
    { name: 'Kepler-186d', type: 'Terrestrial', description: 'A desert world with a thin, breathable atmosphere.'},
    { name: 'Kepler-186e', type: 'Oceanic', description: 'A world of shallow seas and volcanic islands.'},
    { name: 'Kepler-186g', type: 'Gas Giant', description: 'A swirling gas giant with violent atmospheric storms.'},
    { name: 'Kepler-186h', type: 'Ice Giant', description: 'A frozen world at the edge of the system, rich in frozen volatiles.'},
];

const siriusPlanets: Planet[] = [
    { name: 'Sirius Prime', type: 'Terrestrial', description: 'A city-planet, covered in glittering skyscrapers and advanced tech labs.' },
    { name: 'Innovate', type: 'Barren', description: 'A desert world used for large-scale technology testing and manufacturing.' },
    { name: 'The Archive', type: 'Ice Giant', description: 'A frozen planet housing colossal data centers for the galaxy\'s information.' },
    { name: 'Sirius Secundus', type: 'Terrestrial', description: 'A corporate retreat world with curated biomes and exclusive resorts.' },
    { name: 'The Citadel', type: 'Terrestrial', description: 'An orbital station of immense size, functioning as a planetoid-sized fortress and trade hub.' },
    { name: 'Aethel', type: 'Gas Giant', description: 'A majestic gas giant with shimmering rings of rare elements, harvested by automated drones.' },
    { name: 'Volcryn', type: 'Volcanic', description: 'A tidally locked volcanic world, its dark side covered in obsidian glass from cooled lava flows.' },
    { name: 'The Mirror', type: 'Ice Giant', description: 'A perfectly smooth ice giant that reflects the light of Sirius in dazzling displays.' },
    { name: 'The Core', type: 'Barren', description: 'A planet stripped of its crust, now a high-tech waste disposal site and salvage yard.' },
];

const proximaPlanets: Planet[] = [
    { name: 'Proxima b', type: 'Barren', description: 'A heavily mined world, its surface scarred by massive excavation sites.' },
    { name: 'The Quarry', type: 'Volcanic', description: 'A volcanic moon where rare earth minerals are extracted.' },
    { name: 'Dustbowl', type: 'Barren', description: 'An arid world known for its lawless mining camps and frequent dust storms.' },
    { name: 'Proxima c', type: 'Ice Giant', description: 'A massive ice giant with a turbulent atmosphere, rumored to hide abandoned mining operations.' },
    { name: 'Proxima d', type: 'Gas Giant', description: 'A small gas giant with faint rings, a common refueling stop for local haulers.' },
    { name: 'Argent', type: 'Barren', description: 'A world rich in silver and other precious metals, fought over by rival mining corps.' },
    { name: 'Cinder', type: 'Volcanic', description: 'A world of perpetual twilight and simmering lava flows, home to extremophile miners.' },
    { name: 'Haven', type: 'Terrestrial', description: 'A small, terraformed moon with a single, heavily fortified dome city.' },
    { name: 'Last-Stand', type: 'Barren', description: 'A fortified asteroid outpost, the last bastion of a failed corporate venture.' },
];

const trappistPlanets: Planet[] = [
    { name: 'TRAPPIST-1e', type: 'Terrestrial', description: 'A mysterious world with strange, alien flora and rumored ruins.' },
    { name: 'The Shadow', type: 'Ice Giant', description: 'A dark, icy planet that never sees the light of its parent star.' },
    { name: 'The Echo', type: 'Gas Giant', description: 'A gas giant that emits strange, rhythmic radio signals.' },
    { name: 'The Relic', type: 'Barren', description: 'A barren rock covered in the remnants of an ancient, unknown civilization.' },
    { name: 'TRAPPIST-1b', type: 'Volcanic', description: 'A scorched world with seas of molten rock, too close to its star for comfort.'},
    { name: 'TRAPPIST-1c', type: 'Volcanic', description: 'A greenhouse planet with a toxic atmosphere and violent volcanic activity.'},
    { name: 'TRAPPIST-1d', type: 'Oceanic', description: 'A water world with a single, massive ocean and deep, unexplored trenches.'},
    { name: 'TRAPPIST-1f', type: 'Terrestrial', description: 'A temperate world with continents of red-hued vegetation.'},
    { name: 'TRAPPIST-1g', type: 'Terrestrial', description: 'A tidally-locked world with a permanent terminator line between ice and desert.'},
    { name: 'TRAPPIST-1h', type: 'Ice Giant', description: 'A frozen wasteland at the system\'s edge, hiding vast reserves of frozen methane.'},
    { name: 'The Murmur', type: 'Gas Giant', description: 'A gas giant with strange atmospheric phenomena that whisper on comm channels.'},
    { name: 'The Labyrinth', type: 'Barren', description: 'A moon with a maze of deep canyons, a haven for smugglers and fugitives.'},
];

const alphaCentauriPlanets: Planet[] = [
    { name: 'Centauri Prime', type: 'Terrestrial', description: 'A corporate headquarters world, gleaming with chrome and ambition.' },
    { name: 'Rigil Kent', type: 'Barren', description: 'A tidally-locked world with one side perpetually scorched and the other frozen.' },
    { name: 'Toliman', type: 'Terrestrial', description: 'A planet orbiting Alpha Centauri B, known for its rigid corporate culture and high-end manufacturing.' },
    { name: 'Ceto', type: 'Oceanic', description: 'A vast water world with floating cities and advanced aquaculture.' },
    { name: 'Erebus', type: 'Ice Giant', description: 'A dark, cold gas giant on the system\'s fringe, used for secret corporate research.' },
    { name: 'Aion', type: 'Barren', description: 'An ancient, weathered planet with colossal, naturally-formed crystal structures.' },
];

const tauCetiPlanets: Planet[] = [
    { name: 'New Eden', type: 'Terrestrial', description: 'Vast, genetically-engineered plains that feed a dozen systems.' },
    { name: 'Greenhouse', type: 'Oceanic', description: 'A humid ocean world covered in floating hydroponic farms.' },
    { name: 'Harvest Moon', type: 'Terrestrial', description: 'A small moon dedicated entirely to cultivating luxury organic goods.' },
    { name: 'The Paddock', type: 'Terrestrial', description: 'A world where genetically engineered livestock are raised on continent-sized ranches.' },
    { name: 'Granary', type: 'Barren', description: 'A planetoid hollowed out to serve as a massive, long-term food storage facility.' },
    { name: 'Verdant', type: 'Terrestrial', description: 'A newly terraformed world, its ecosystems still wild and untamed.' },
];

const luytensStarPlanets: Planet[] = [
    { name: 'Luyten\'s Rock', type: 'Barren', description: 'A planet-wide factory floor, shrouded in industrial smog.' },
    { name: 'The Forge', type: 'Volcanic', description: 'A moon dedicated entirely to refining rare and volatile ores.' },
    { name: 'Slag', type: 'Barren', description: 'A world covered in the industrial waste of a dozen systems, a paradise for salvagers.' },
    { name: 'The Chimney', type: 'Gas Giant', description: 'A gas giant with orbital platforms that vent refined gases into space.' },
    { name: 'Crucible', type: 'Volcanic', description: 'A super-heated planetoid used for experimental alloy smelting.' },
    { name: 'The Grid', type: 'Terrestrial', description: 'An old orbital station, now a maze of workshops and black-market deals.' },
];

const wolf359Planets: Planet[] = [
    { name: 'The Den', type: 'Barren', description: 'A notorious pirate haven carved into a massive asteroid.' },
    { name: 'The Graveyard', type: 'Ice Giant', description: 'A frigid gas giant whose rings are a maze of derelict ships.' },
    { name: 'The Maw', type: 'Barren', description: 'An asteroid field so dense it resembles an accretion disk around a black hole.' },
    { name: 'Styx', type: 'Ice Giant', description: 'A frozen world with a river of frozen nitrogen carving through its surface.' },
    { name: 'Lethe', type: 'Gas Giant', description: 'A gas giant whose magnetic field is rumored to cause short-term memory loss.' },
    { name: 'Tartarus', type: 'Volcanic', description: 'A volcanic moon used as a high-security penal colony.' },
];

const epsilonEridaniPlanets: Planet[] = [
    { name: 'Epsilon Eridani b', type: 'Terrestrial', description: 'A planet-sized factory floor, shrouded in industrial smog and corporate ambition.' },
    { name: 'Eridani Prime', type: 'Terrestrial', description: 'The glittering corporate headquarters moon, a testament to wealth and power.' },
    { name: 'Epsilon Eridani c', type: 'Gas Giant', description: 'A gas giant rich in helium-3, fueling the system\'s industrial might.' },
    { name: 'Epsilon Eridani d', type: 'Barren', description: 'A world used for testing experimental corporate hardware.' },
    { name: 'The Assembly', type: 'Terrestrial', description: 'A moon dedicated to the final assembly of massive starships and stations.' },
    { name: 'The Boardroom', type: 'Terrestrial', description: 'A tiny, luxurious worldlet reserved for the system\'s corporate elite.' },
];

const gliese581Planets: Planet[] = [
    { name: 'Gliese 581g', type: 'Barren', description: 'A barely habitable rock, its surface pockmarked by relentless mining operations.' },
    { name: 'The Belt', type: 'Barren', description: 'A series of interconnected asteroid mining stations, known for its rough inhabitants and valuable ores.' },
    { name: 'Gliese 581c', type: 'Volcanic', description: 'A tidally locked world with one side a molten sea, the other a frozen waste.' },
    { name: 'Gliese 581d', type: 'Oceanic', description: 'A cold ocean world with deep, methane-rich seas.' },
    { name: 'Gliese 581e', type: 'Barren', description: 'A small, barren rock, too close to its star for any meaningful development.' },
    { name: 'The Claim', type: 'Barren', description: 'A recently discovered moon with a massive, untapped deposit of rare minerals.' },
];

const vegaPlanets: Planet[] = [
    { name: 'Vega Prime', type: 'Terrestrial', description: 'A dazzling city-planet, where technology and luxury converge in a radiant display.' },
    { name: 'The Lyre', type: 'Terrestrial', description: 'A moon transformed into a massive research and trade station, famed for its beautiful, harp-like design.' },
    { name: 'Vega Minor', type: 'Terrestrial', description: 'A smaller, but equally advanced world dedicated to theoretical sciences.' },
    { name: 'The Spire', type: 'Gas Giant', description: 'An orbital city built on a colossal spire rising from the clouds of a gas giant.' },
    { name: 'Lyra\'s Tear', type: 'Oceanic', description: 'A world of crystalline seas and floating research labs.' },
    { name: 'The Observatory', type: 'Barren', description: 'A moon housing the largest deep-space telescope array in the known galaxy.' },
];

const barnardsStarPlanets: Planet[] = [
    { name: 'Barnard\'s Star b', type: 'Terrestrial', description: 'A cold but surprisingly fertile world, home to vast, domed hydroponic farms producing organic delicacies.' },
    { name: 'Barnard\'s Star c', type: 'Ice Giant', description: 'A frigid ice giant, its surface scoured by winds of frozen ammonia.' },
    { name: 'Barnard\'s Star d', type: 'Barren', description: 'A small, barren world used as a quiet retreat by reclusive artists.' },
];

const zetaReticuliPlanets: Planet[] = [
    { name: 'Zeta Reticuli I', type: 'Barren', description: 'A world of shifting sands and whispered legends.' },
    { name: 'The Glitch', type: 'Terrestrial', description: 'A terraformed moon where physics occasionally... flickers.' },
];

const groombridge1618Planets: Planet[] = [
    { name: 'Groombridge Prime', type: 'Terrestrial', description: 'A rugged world of mesas and canyons, home to hardy settlers.' },
    { name: 'The Ledge', type: 'Barren', description: 'A massive asteroid converted into a vertical city.' },
];

const ross128Planets: Planet[] = [
    { name: 'Ross 128 b', type: 'Terrestrial', description: 'A temperate world known for its strange, bioluminescent flora.' },
    { name: 'Veridian', type: 'Oceanic', description: 'An ocean world with floating cities made of woven coral.' },
];

const epsilonIndiPlanets: Planet[] = [
    { name: 'Epsilon Indi A', type: 'Gas Giant', description: 'A brown dwarf whose faint light supports a strange ecosystem on its moons.' },
    { name: 'Indi\'s Rock', type: 'Barren', description: 'A resource-rich moon orbiting the brown dwarf.' },
];

const deltaPavonisPlanets: Planet[] = [
    { name: 'Pavonis Prime', type: 'Terrestrial', description: 'A golden-hued world, one of the oldest and most stable core worlds.' },
    { name: 'The Senate', type: 'Terrestrial', description: 'A moon dedicated entirely to galactic politics and diplomacy.' },
];

const cygni61Planets: Planet[] = [
    { name: '61 Cygni A', type: 'Terrestrial', description: 'A bustling planet in a binary star system, known for its 24/7 markets.' },
    { name: '61 Cygni B', type: 'Terrestrial', description: 'The "shadow" planet, a mirror of its twin but with a more... discreet economy.' },
];

const hd40307Planets: Planet[] = [
    { name: 'HD 40307 g', type: 'Terrestrial', description: 'A "Super-Earth" with high gravity, home to advanced research outposts.' },
    { name: 'The Lab', type: 'Barren', description: 'A moon dedicated to zero-gravity experiments.' },
];

const kapteynsStarPlanets: Planet[] = [
    { name: 'Kapteyn b', type: 'Terrestrial', description: 'Believed to be one of the oldest terrestrial planets, littered with ruins.' },
    { name: 'The Ghost', type: 'Gas Giant', description: 'A faint gas giant that seems to absorb light.' },
];

const fomalhautPlanets: Planet[] = [
    { name: 'Fomalhaut b', type: 'Barren', description: 'A young, hot world still forming within a massive debris disk.' },
    { name: 'The Dust Ring', type: 'Barren', description: 'A series of orbital stations built within the debris disk itself.' },
];

const altairPlanets: Planet[] = [
    { name: 'Altair IV', type: 'Terrestrial', description: 'A world with a rapid rotation, leading to extreme weather and a culture of speed.' },
    { name: 'The Blur', type: 'Gas Giant', description: 'A gas giant whose rapid spin causes its clouds to form hypersonic bands.' },
];

const polluxPlanets: Planet[] = [
    { name: 'Pollux Prime', type: 'Terrestrial', description: 'A world basking in the orange glow of its giant star, known for its grand architecture.' },
    { name: 'Castor\'s Twin', type: 'Barren', description: 'A barren moon, named in myth after its star\'s lost twin.' },
];

const arcturusPlanets: Planet[] = [
    { name: 'Arcturus Station', type: 'Terrestrial', description: 'A massive orbital station that serves as a gateway to the outer systems.' },
    { name: 'The Shepherd', type: 'Gas Giant', description: 'A gas giant whose gravity "shepherds" a massive flock of asteroids.' },
];

const aldebaranPlanets: Planet[] = [
    { name: 'Aldebaran Prime', type: 'Terrestrial', description: 'A major core world, known for its wealth, power, and the bull-like obstinacy of its inhabitants.' },
    { name: 'The Eye', type: 'Volcanic', description: 'A volcanic moon that glows a brilliant red in the sky of Aldebaran Prime.' },
];


export const SYSTEMS: System[] = [
    { name: 'Sol', x: 100, y: 100, security: 'High', economy: 'Industrial', volatility: 0.1, zoneType: 'Core World', faction: 'Federation of Sol', description: 'The cradle of humanity, a bustling hub of industry and political power. Heavily patrolled and regulated, Sol is the safest but most expensive system to operate in.', planets: solPlanets },
    { name: 'Kepler-186f', x: 130, y: 150, security: 'Medium', economy: 'Agricultural', volatility: 0.3, zoneType: 'Frontier Outpost', faction: 'Frontier Alliance', description: 'A lush, terraformed world known as the "Galactic Breadbasket." Its fertile lands produce vast quantities of foodstuffs, but its position on the frontier makes it a target for opportunistic raids.', planets: keplerPlanets },
    { name: 'Sirius', x: 150, y: 70, security: 'High', economy: 'High-Tech', volatility: 0.2, zoneType: 'Trade Hub', faction: 'Corporate Hegemony', description: 'A dazzling binary star system, home to the galaxy\'s leading technology corporations. The latest ship components and experimental tech flow from its orbital research stations.', planets: siriusPlanets },
    { name: 'Proxima Centauri', x: 160, y: 170, security: 'Low', economy: 'Extraction', volatility: 0.5, zoneType: 'Mining Colony', faction: 'Independent Miners Guild', description: 'Rich in rare minerals, Proxima Centauri is a chaotic, dusty system dominated by powerful mining guilds. Law enforcement is scarce, and pirate activity is common.', planets: proximaPlanets },
    { name: 'TRAPPIST-1', x: 80, y: 180, security: 'Anarchy', economy: 'Refinery', volatility: 0.8, zoneType: 'Ancient Ruins', faction: 'Unclaimed Systems', description: 'A lawless system shrouded in mystery, littered with the ruins of a precursor civilization. Smugglers and treasure hunters flock here to refine illicit goods and explore the unknown, but few return.', planets: trappistPlanets },
    { name: 'Alpha Centauri', x: 180, y: 40, security: 'High', economy: 'High-Tech', volatility: 0.15, zoneType: 'Corporate Zone', faction: 'Corporate Hegemony', description: 'The gleaming heart of corporate power, where deals are made that shape the galaxy.', planets: alphaCentauriPlanets },
    { name: 'Tau Ceti', x: 110, y: 190, security: 'Medium', economy: 'Agricultural', volatility: 0.4, zoneType: 'Frontier Outpost', faction: 'Frontier Alliance', description: 'A breadbasket system known for its independent spirit and robust organic exports.', planets: tauCetiPlanets },
    { name: 'Luyten\'s Star', x: 60, y: 75, security: 'Low', economy: 'Refinery', volatility: 0.6, zoneType: 'Industrial', faction: 'Independent Miners Guild', description: 'A gritty, hard-working system that refines the raw materials for the core worlds.', planets: luytensStarPlanets },
    { name: 'Wolf 359', x: 190, y: 195, security: 'Anarchy', economy: 'Extraction', volatility: 0.9, zoneType: 'Ancient Ruins', faction: 'Unclaimed Systems', description: 'A notorious pirate stronghold. Enter at your own peril.', planets: wolf359Planets },
    { name: 'Epsilon Eridani', x: 40, y: 50, security: 'Medium', economy: 'Industrial', volatility: 0.4, zoneType: 'Corporate Zone', faction: 'Corporate Hegemony', description: 'A system dominated by corporate-run shipyards and manufacturing plants, where efficiency is king.', planets: epsilonEridaniPlanets },
    { name: 'Gliese 581', x: 210, y: 180, security: 'Low', economy: 'Extraction', volatility: 0.7, zoneType: 'Mining Colony', faction: 'Independent Miners Guild', description: 'A wild frontier system known for its rich asteroid belts and the lawless outposts that cling to them.', planets: gliese581Planets },
    { name: 'Vega', x: 200, y: 20, security: 'High', economy: 'High-Tech', volatility: 0.1, zoneType: 'Trade Hub', faction: 'Corporate Hegemony', description: 'A bright, vibrant system famous for its advanced research facilities and luxurious trade stations.', planets: vegaPlanets },
    { name: 'Barnard\'s Star', x: 80, y: 120, security: 'Medium', economy: 'Agricultural', volatility: 0.3, zoneType: 'Frontier Outpost', faction: 'Frontier Alliance', description: 'An old, quiet system with a reputation for producing the finest organic foodstuffs in the sector.', planets: barnardsStarPlanets },
    { name: 'Zeta Reticuli', x: 230, y: 150, security: 'Anarchy', economy: 'Refinery', volatility: 1.0, zoneType: 'Ancient Ruins', faction: 'Unclaimed Systems', description: 'A system steeped in unsettling myths and strange gravitational phenomena. Standard nav-computers are known to fail here.', planets: zetaReticuliPlanets },
    { name: 'Groombridge 1618', x: 180, y: 220, security: 'Low', economy: 'Extraction', volatility: 0.6, zoneType: 'Frontier Outpost', faction: 'Frontier Alliance', description: 'A remote system at the edge of explored space, where pioneers carve out a living from the unforgiving worlds.', planets: groombridge1618Planets },
    { name: 'Ross 128', x: 100, y: 220, security: 'Medium', economy: 'Agricultural', volatility: 0.3, zoneType: 'Frontier Outpost', faction: 'Frontier Alliance', description: 'A quiet, isolationist system focused on cultivating exotic and rare bioluminescent crops.', planets: ross128Planets },
    { name: 'Epsilon Indi', x: 50, y: 150, security: 'Low', economy: 'Extraction', volatility: 0.5, zoneType: 'Mining Colony', faction: 'Independent Miners Guild', description: 'A dim system orbiting a brown dwarf, its economy fueled by the continuous mining of its resource-rich but cold moons.', planets: epsilonIndiPlanets },
    { name: 'Delta Pavonis', x: 20, y: 100, security: 'High', economy: 'Industrial', volatility: 0.2, zoneType: 'Core World', faction: 'Federation of Sol', description: 'An old, prosperous system with a reputation for quality manufacturing and powerful trade guilds.', planets: deltaPavonisPlanets },
    { name: '61 Cygni', x: 140, y: 10, security: 'High', economy: 'Trade Hub', volatility: 0.2, zoneType: 'Trade Hub', faction: 'Corporate Hegemony', description: 'A binary star system with twin hub worlds, creating a dynamic, 24/7 marketplace of immense volume.', planets: cygni61Planets },
    { name: 'HD 40307', x: 240, y: 60, security: 'Medium', economy: 'High-Tech', volatility: 0.4, zoneType: 'Corporate Zone', faction: 'Corporate Hegemony', description: 'Home to a "Super-Earth," this system is a hotbed of gravitational research and experimental technology.', planets: hd40307Planets },
    { name: 'Kapteyn\'s Star', x: 250, y: 120, security: 'Anarchy', economy: 'Refinery', volatility: 0.9, zoneType: 'Ancient Ruins', faction: 'Unclaimed Systems', description: 'One of the oldest known systems, filled with drifting, silent ruins and scavengers picking over the bones of forgotten empires.', planets: kapteynsStarPlanets },
    { name: 'Fomalhaut', x: 260, y: 190, security: 'Low', economy: 'Industrial', volatility: 0.7, zoneType: 'Industrial', faction: 'Independent Miners Guild', description: 'A young, chaotic system surrounded by a massive debris disk, where mobile foundries forge materials from captured asteroids.', planets: fomalhautPlanets },
    { name: 'Altair', x: 280, y: 80, security: 'Medium', economy: 'High-Tech', volatility: 0.5, zoneType: 'Corporate Zone', faction: 'Corporate Hegemony', description: 'Known for its rapidly rotating star, Altair is a hub for high-speed computing and advanced propulsion research.', planets: altairPlanets },
    { name: 'Pollux', x: 280, y: 20, security: 'Low', economy: 'Refinery', volatility: 0.6, zoneType: 'Industrial', faction: 'Independent Miners Guild', description: 'A system basking in the orange glow of its giant star, specializing in the refining of rare gases and stellar materials.', planets: polluxPlanets },
    { name: 'Arcturus', x: 220, y: -10, security: 'High', economy: 'Trade Hub', volatility: 0.2, zoneType: 'Diplomatic Station', faction: 'Veritas Concord', description: 'A major navigational waypoint and diplomatic hub, Arcturus is a crossroads for the entire galactic arm.', planets: arcturusPlanets },
    { name: 'Aldebaran', x: 180, y: -20, security: 'High', economy: 'Industrial', volatility: 0.1, zoneType: 'Core World', faction: 'Veritas Concord', description: 'The "Eye of the Bull," a massive orange giant and a cornerstone of core world industry and finance.', planets: aldebaranPlanets },
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
    { from: 'Epsilon Eridani', to: 'Luyten\'s Star' },
    { from: 'Sol', to: 'Barnard\'s Star' },
    { from: 'Barnard\'s Star', to: 'Kepler-186f' },
    { from: 'Vega', to: 'Alpha Centauri' },
    { from: 'Vega', to: 'Sirius' },
    { from: 'Gliese 581', to: 'Wolf 359' },
    { from: 'Gliese 581', to: 'Proxima Centauri' },
    { from: 'Wolf 359', to: 'Groombridge 1618' },
    { from: 'Tau Ceti', to: 'Ross 128' },
    { from: 'Luyten\'s Star', to: 'Epsilon Indi' },
    { from: 'Epsilon Eridani', to: 'Delta Pavonis' },
    { from: 'Vega', to: '61 Cygni' },
    { from: 'Alpha Centauri', to: 'HD 40307' },
    { from: 'Sirius', to: 'Zeta Reticuli' },
    { from: 'Zeta Reticuli', to: 'Kapteyn\'s Star' },
    { from: 'Gliese 581', to: 'Fomalhaut' },
    { from: 'HD 40307', to: 'Altair' },
    { from: '61 Cygni', to: 'Pollux' },
    { from: 'Pollux', to: 'Arcturus' },
    { from: 'Arcturus', to: 'Aldebaran' },
    { from: 'Aldebaran', to: 'Vega' },
];
