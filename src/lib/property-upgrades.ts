
export interface PropertyUpgrade {
    level: number;
    upgrade: string;
    effect: string;
    cost: number;
}

export const residentialUpgrades: PropertyUpgrade[] = [
    { level: 1, upgrade: 'Airflow Regulators', effect: 'Boosts oxygen efficiency, minor comfort bonus', cost: 10000 },
    { level: 2, upgrade: 'Smart Habitat Pods', effect: 'Automates life support, reduces tenant upkeep', cost: 25000 },
    { level: 3, upgrade: 'Gravity Stabilizers', effect: 'Reduces motion sickness, increases occupancy happiness', cost: 50000 },
    { level: 4, upgrade: 'Soundproof Bulkheads', effect: 'Improves morale, lowers unrest risk', cost: 100000 },
    { level: 5, upgrade: 'Nutrient Dispensers', effect: 'Adds passive health regen for residents', cost: 200000 },
    { level: 6, upgrade: 'Holo-TV Suites', effect: 'Entertainment bonus, reduces departure rate', cost: 400000 },
    { level: 7, upgrade: 'Bio-Dome Terrace', effect: 'Prestige boost, attracts VIP tenants', cost: 800000 },
    { level: 8, upgrade: 'Personal AI Concierge', effect: 'Increases rent, enhances tenant loyalty', cost: 1600000 },
    { level: 9, upgrade: 'Mood Lighting Matrix', effect: 'Boosts happiness metrics, cosmetic appeal', cost: 3200000 },
    { level: 10, upgrade: 'Quantum Comfort Grid', effect: 'Maximizes morale, unlocks unique tenant types', cost: 6400000 },
];

export const commercialUpgrades: PropertyUpgrade[] = [
    { level: 1, upgrade: 'Universal POS System', effect: 'Boosts transaction speed', cost: 15000 },
    { level: 2, upgrade: 'Interstellar Delivery Dock', effect: 'Enables remote trading, minor faction gains', cost: 35000 },
    { level: 3, upgrade: 'Brand Projection Beacon', effect: 'Increases visibility to passing ships', cost: 70000 },
    { level: 4, upgrade: 'Loyalty Program AI', effect: 'Enhances customer retention', cost: 140000 },
    { level: 5, upgrade: 'Grav-Trolley Corridors', effect: 'Improves foot traffic and flow', cost: 280000 },
    { level: 6, upgrade: 'Ambient Advertising Screens', effect: 'Boosts passive income', cost: 560000 },
    { level: 7, upgrade: 'Exotic Goods License', effect: 'Unlocks rare inventory options', cost: 1120000 },
    { level: 8, upgrade: 'Trader Lounge', effect: 'Increases trade value and NPC interest', cost: 2240000 },
    { level: 9, upgrade: 'Solar-Backed Financing Node', effect: 'Reduces operational costs', cost: 4480000 },
    { level: 10, upgrade: 'Cross-Faction Franchise Network', effect: 'Massive income spike, prestige boost', cost: 8960000 },
];

export const industrialUpgrades: PropertyUpgrade[] = [
    { level: 1, upgrade: 'Drone Forklift Fleet', effect: 'Increases material throughput', cost: 20000 },
    { level: 2, upgrade: 'Automated Recycler', effect: 'Boosts efficiency, lowers waste', cost: 45000 },
    { level: 3, upgrade: 'Radiation Shielding', effect: 'Prevents production downtime', cost: 90000 },
    { level: 4, upgrade: 'AI Process Controller', effect: 'Enhances production speed', cost: 180000 },
    { level: 5, upgrade: 'Faction-Specific Tech Line', effect: 'Unlocks unique blueprints', cost: 360000 },
    { level: 6, upgrade: 'Waste-to-Energy Converter', effect: 'Adds energy credits per cycle', cost: 720000 },
    { level: 7, upgrade: 'Modular Assembly Grid', effect: 'Enables high-volume processing', cost: 1440000 },
    { level: 8, upgrade: 'Hazard Response Station', effect: 'Minimizes disaster penalties', cost: 2880000 },
    { level: 9, upgrade: 'Quantum Sync Distributor', effect: 'Multi-property output bonus', cost: 5760000 },
    { level: 10, upgrade: 'Nanite Fabrication Reactor', effect: 'Produces rare commodities, huge upgrade', cost: 11520000 },
];

export const recreationalUpgrades: PropertyUpgrade[] = [
    { level: 1, upgrade: 'Astro Arcade Booths', effect: 'Boosts foot traffic', cost: 12000 },
    { level: 2, upgrade: 'Gravity Wave Slide', effect: 'Attracts younger NPC types', cost: 30000 },
    { level: 3, upgrade: 'Alien Cuisine Vendor', effect: 'Adds cultural rating bonus', cost: 60000 },
    { level: 4, upgrade: 'Virtual Safari Dome', effect: 'Increases tourism draw', cost: 120000 },
    { level: 5, upgrade: 'Faction-Themed Zones', effect: 'Enhances faction approval', cost: 240000 },
    { level: 6, upgrade: 'Celebrity Appearance Holo-Suite', effect: 'Spike in event attendance', cost: 480000 },
    { level: 7, upgrade: 'Memory Capture Pods', effect: 'Adds nostalgia currency', cost: 960000 },
    { level: 8, upgrade: 'Nebula Light Show Projector', effect: 'Unique visual appeal, boosts mood', cost: 1920000 },
    { level: 9, upgrade: 'Zero-G Dance Hall', effect: 'Bonus for nightlife rating', cost: 3840000 },
    { level: 10, upgrade: 'Multiverse Carnival Portal', effect: 'Rare NPC types, high revenue spike', cost: 7680000 },
];

export const militaryUpgrades: PropertyUpgrade[] = [
    { level: 1, upgrade: 'Tactical Surveillance Grid', effect: 'Minor intel gain', cost: 50000 },
    { level: 2, upgrade: 'Automated Defense Turrets', effect: 'Protects nearby assets', cost: 120000 },
    { level: 3, upgrade: 'Combat Simulation Facility', effect: 'Trains faction soldiers', cost: 250000 },
    { level: 4, upgrade: 'Emergency Barricade System', effect: 'Reduces damage during raids', cost: 500000 },
    { level: 5, upgrade: 'Stealth Signal Jammer', effect: 'Disrupts enemy scans', cost: 1000000 },
    { level: 6, upgrade: 'Interceptor Hangar', effect: 'Launches pursuit ships', cost: 2000000 },
    { level: 7, upgrade: 'Faction War Command Nexus', effect: 'Unlocks elite missions', cost: 4000000 },
    { level: 8, upgrade: 'Quantum Ammo Depot', effect: 'Boosts allied weapon stats', cost: 8000000 },
    { level: 9, upgrade: 'Exo-Trooper Garrison', effect: 'Defense and prestige', cost: 16000000 },
    { level: 10, upgrade: 'Orbital Planetary Cannon', effect: 'Top-tier security rating, intimidation aura', cost: 32000000 },
];

export const propertyUpgrades = {
    residential: { upgrades: residentialUpgrades },
    commercial: { upgrades: commercialUpgrades },
    industrial: { upgrades: industrialUpgrades },
    recreational: { upgrades: recreationalUpgrades },
    military: { upgrades: militaryUpgrades },
};
