
export interface PropertyUpgrade {
    level: number;
    upgrade: string;
    effect: string;
}

export const residentialUpgrades: PropertyUpgrade[] = [
    { level: 1, upgrade: 'Airflow Regulators', effect: 'Boosts oxygen efficiency, minor comfort bonus' },
    { level: 2, upgrade: 'Smart Habitat Pods', effect: 'Automates life support, reduces tenant upkeep' },
    { level: 3, upgrade: 'Gravity Stabilizers', effect: 'Reduces motion sickness, increases occupancy happiness' },
    { level: 4, upgrade: 'Soundproof Bulkheads', effect: 'Improves morale, lowers unrest risk' },
    { level: 5, upgrade: 'Nutrient Dispensers', effect: 'Adds passive health regen for residents' },
    { level: 6, upgrade: 'Holo-TV Suites', effect: 'Entertainment bonus, reduces departure rate' },
    { level: 7, upgrade: 'Bio-Dome Terrace', effect: 'Prestige boost, attracts VIP tenants' },
    { level: 8, upgrade: 'Personal AI Concierge', effect: 'Increases rent, enhances tenant loyalty' },
    { level: 9, upgrade: 'Mood Lighting Matrix', effect: 'Boosts happiness metrics, cosmetic appeal' },
    { level: 10, upgrade: 'Quantum Comfort Grid', effect: 'Maximizes morale, unlocks unique tenant types' },
];

export const commercialUpgrades: PropertyUpgrade[] = [
    { level: 1, upgrade: 'Universal POS System', effect: 'Boosts transaction speed' },
    { level: 2, upgrade: 'Interstellar Delivery Dock', effect: 'Enables remote trading, minor faction gains' },
    { level: 3, upgrade: 'Brand Projection Beacon', effect: 'Increases visibility to passing ships' },
    { level: 4, upgrade: 'Loyalty Program AI', effect: 'Enhances customer retention' },
    { level: 5, upgrade: 'Grav-Trolley Corridors', effect: 'Improves foot traffic and flow' },
    { level: 6, upgrade: 'Ambient Advertising Screens', effect: 'Boosts passive income' },
    { level: 7, upgrade: 'Exotic Goods License', effect: 'Unlocks rare inventory options' },
    { level: 8, upgrade: 'Trader Lounge', effect: 'Increases trade value and NPC interest' },
    { level: 9, upgrade: 'Solar-Backed Financing Node', effect: 'Reduces operational costs' },
    { level: 10, upgrade: 'Cross-Faction Franchise Network', effect: 'Massive income spike, prestige boost' },
];

export const industrialUpgrades: PropertyUpgrade[] = [
    { level: 1, upgrade: 'Drone Forklift Fleet', effect: 'Increases material throughput' },
    { level: 2, upgrade: 'Automated Recycler', effect: 'Boosts efficiency, lowers waste' },
    { level: 3, upgrade: 'Radiation Shielding', effect: 'Prevents production downtime' },
    { level: 4, upgrade: 'AI Process Controller', effect: 'Enhances production speed' },
    { level: 5, upgrade: 'Faction-Specific Tech Line', effect: 'Unlocks unique blueprints' },
    { level: 6, upgrade: 'Waste-to-Energy Converter', effect: 'Adds energy credits per cycle' },
    { level: 7, upgrade: 'Modular Assembly Grid', effect: 'Enables high-volume processing' },
    { level: 8, upgrade: 'Hazard Response Station', effect: 'Minimizes disaster penalties' },
    { level: 9, upgrade: 'Quantum Sync Distributor', effect: 'Multi-property output bonus' },
    { level: 10, upgrade: 'Nanite Fabrication Reactor', effect: 'Produces rare commodities, huge upgrade' },
];

export const recreationalUpgrades: PropertyUpgrade[] = [
    { level: 1, upgrade: 'Astro Arcade Booths', effect: 'Boosts foot traffic' },
    { level: 2, upgrade: 'Gravity Wave Slide', effect: 'Attracts younger NPC types' },
    { level: 3, upgrade: 'Alien Cuisine Vendor', effect: 'Adds cultural rating bonus' },
    { level: 4, upgrade: 'Virtual Safari Dome', effect: 'Increases tourism draw' },
    { level: 5, upgrade: 'Faction-Themed Zones', effect: 'Enhances faction approval' },
    { level: 6, upgrade: 'Celebrity Appearance Holo-Suite', effect: 'Spike in event attendance' },
    { level: 7, upgrade: 'Memory Capture Pods', effect: 'Adds nostalgia currency' },
    { level: 8, upgrade: 'Nebula Light Show Projector', effect: 'Unique visual appeal, boosts mood' },
    { level: 9, upgrade: 'Zero-G Dance Hall', effect: 'Bonus for nightlife rating' },
    { level: 10, upgrade: 'Multiverse Carnival Portal', effect: 'Rare NPC types, high revenue spike' },
];

export const militaryUpgrades: PropertyUpgrade[] = [
    { level: 1, upgrade: 'Tactical Surveillance Grid', effect: 'Minor intel gain' },
    { level: 2, upgrade: 'Automated Defense Turrets', effect: 'Protects nearby assets' },
    { level: 3, upgrade: 'Combat Simulation Facility', effect: 'Trains faction soldiers' },
    { level: 4, upgrade: 'Emergency Barricade System', effect: 'Reduces damage during raids' },
    { level: 5, upgrade: 'Stealth Signal Jammer', effect: 'Disrupts enemy scans' },
    { level: 6, upgrade: 'Interceptor Hangar', effect: 'Launches pursuit ships' },
    { level: 7, upgrade: 'Faction War Command Nexus', effect: 'Unlocks elite missions' },
    { level: 8, upgrade: 'Quantum Ammo Depot', effect: 'Boosts allied weapon stats' },
    { level: 9, upgrade: 'Exo-Trooper Garrison', effect: 'Defense and prestige' },
    { level: 10, upgrade: 'Orbital Planetary Cannon', effect: 'Top-tier security rating, intimidation aura' },
];
