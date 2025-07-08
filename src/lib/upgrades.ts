import type { CargoUpgrade, WeaponUpgrade, ShieldUpgrade, HullUpgrade, FuelUpgrade, SensorUpgrade, DroneUpgrade } from '@/lib/types';

const costMultiplier = 1.4;
const costGrowthFactor = 2.0;
const upgradeLevelCount = 30;

const generateUpgradeCosts = (count: number, baseCost: number, costGrowth: number): number[] => {
    const costs: number[] = [];
    let cumulativeCost = 0;
    for (let i = 1; i <= count; i++) {
        const levelCost = i === 1 ? 0 : Math.round(baseCost * Math.pow(costGrowth, i - 2));
        cumulativeCost += levelCost;
        costs.push(cumulativeCost);
    }
    return costs;
};

// --- Cargo Upgrades ---
const cargoCosts = generateUpgradeCosts(upgradeLevelCount, 5000 * costMultiplier, costGrowthFactor);
const cargoNames = [
  'Standard Cargo Rack', 'Reinforced Rack', 'Expanded Bay', 'High-Capacity Hold', 'Automated Loader',
  'Magnetic Containment', 'Pressurized Pods', 'Shielded Cargo Hold', 'Heavy Freight Module', 'Bulk Transport System',
  'Quantum-Compressed Storage', 'Null-Space Canisters', 'Bio-Sealed Containers', 'Exotic Matter Hold', 'Phase-Locked Vault',
  'Dimensional Pockets', 'Tesseract Latticing', 'Adaptive Cargo Matrix', 'Zero-Point Hold', 'Matter-Stream Container',
  'Event Horizon Silo', 'Pocket Universe Bay', 'Singularity Storage', 'Hyper-Mass Container', 'Reality-Fold Canister',
  'Mythic Cargo Vault', 'Continuum Silo', 'Omni-Container', 'Acausal Storage Unit', 'The Void Maw'
];
export const cargoUpgrades: CargoUpgrade[] = cargoNames.map((name, i) => ({
    level: i + 1,
    name,
    cost: cargoCosts[i],
    capacity: 25 * (i + 1)
}));

// --- Weapon Upgrades ---
const weaponCosts = generateUpgradeCosts(upgradeLevelCount, 10000 * costMultiplier, costGrowthFactor);
const weaponNames = [
  'Pulse Lasers', 'Heavy Pulse Lasers', 'Burst Fire Cannons', 'Overcharged Cannons', 'Focused Beam Lasers',
  'Ion Disruptors', 'High-Yield Ion Cannons', 'Plasma Repeaters', 'Superheated Plasma Accelerators', 'Phased Ion Cannons',
  'Tachyon Lances', 'Subspace Repeaters', 'Rift Projectors', 'Precursor Beam Emitters', 'Focused Tachyon Beams',
  'Quantum Cascade Lasers', 'Entangled Particle Repeaters', 'Unstable Matter Cannons', 'Chroniton Torpedoes', 'Singularity Projectors',
  'Null-Void Emitters', 'Reality-Breaker Cannons', 'Metadimensional Lances', 'Event Horizon Repeaters', 'Temporal Disruptors',
  'Mythic Phase Cannon', 'Acausal Shard Launcher', 'Omega Particle Burst', 'Void-Tipped Missiles', 'The Godkiller Array'
];
export const weaponUpgrades: WeaponUpgrade[] = weaponNames.map((name, i) => ({
    level: i + 1,
    name,
    cost: weaponCosts[i]
}));

// --- Shield Upgrades ---
const shieldCosts = generateUpgradeCosts(upgradeLevelCount, 7500 * costMultiplier, costGrowthFactor);
const shieldNames = [
  'Basic Deflectors', 'Improved Deflectors', 'Bi-Weave Shields', 'Reinforced Emitters', 'High-Capacity Capacitors',
  'Aegis Barrier', 'Prismatic Shields', 'Cyclical Regeneration Fields', 'Reactive Shield Matrix', 'Layered Defense System',
  'Guardian Shield Array', 'Resonance Projectors', 'Adaptive Shielding', 'Hardlight Barriers', 'Precursor Deflector Grid',
  'Quantum Harmonic Fields', 'Entropic Ward Projectors', 'Temporal Shielding', 'Subspace Bubble Emitter', 'Singularity Ward',
  'Null-Entropy Barrier', 'Metastable Deflectors', 'Causal Dissipation Field', 'Event Horizon Shielding', 'Reality Anchor',
  'Mythic Aegis Projector', 'Continuum Barrier', 'Omni-Directional Ward', 'Acausal Field Generator', 'The Unbroken Veil'
];
export const shieldUpgrades: ShieldUpgrade[] = shieldNames.map((name, i) => ({
    level: i + 1,
    name,
    cost: shieldCosts[i]
}));

// --- Hull Upgrades ---
const hullCosts = generateUpgradeCosts(upgradeLevelCount, 8000 * costMultiplier, costGrowthFactor);
const hullNames = [
  'Standard Plating', 'Reinforced Alloy', 'Composite Armor', 'Military Grade Plating', 'Ablative Armor',
  'Reactive Crystal Armor', 'Titanium-Carbide Weave', 'Self-Repairing Nanites', 'Layered Ceramic Composite', 'Exotic Alloy Framework',
  'Guardian Hull Reinforcement', 'Neutronium-Infused Plating', 'Metamaterial Armor', 'Precursor Structural Fields', 'Hardlight-Reinforced Frame',
  'Quantum Lattice Plating', 'Entropic Dissipation Armor', 'Temporal Alloy Weave', 'Subspace-Reinforced Bulkheads', 'Singularity-Forged Frame',
  'Null-Matter Plating', 'Metastable Composite', 'Causal Reinforcement', 'Event Horizon Plating', 'Reality-Bound Hull',
  'Mythic Structural Integrity', 'Continuum Plating', 'Omni-Plated Framework', 'Acausal Hull Matrix', 'The Unyielding Core'
];
export const hullUpgrades: HullUpgrade[] = hullNames.map((name, i) => ({
    level: i + 1,
    name,
    cost: hullCosts[i],
    health: 100 + 20 * i
}));

// --- Fuel Upgrades ---
const fuelCosts = generateUpgradeCosts(upgradeLevelCount, 4000 * costMultiplier, costGrowthFactor);
const fuelNames = [
  'Standard Fuel Tank', 'Extended Range Tank', 'High-Capacity Reservoir', 'Efficient Fuel Injectors', 'Auxiliary Tank',
  'Optimized Fuel Scoop', 'Hydrogen-Deuterium Tank', 'Enlarged Hydrogen Reservoir', 'Cryo-Storage Tanks', 'Magnetic Confinement Fuel System',
  'Guardian Fuel Scoop', 'Zero-Point Energy Tap', 'Subspace Fuel Collector', 'Precursor Energy Cell', 'Micro-Singularity Reactor',
  'Quantum Foam Injector', 'Temporal Fuel Pods', 'Infinite Improbability Drive', 'Stellar Hydrogen Siphon', 'Hyperspace Conduit',
  'Null-Matter Reservoir', 'Causal Energy Converter', 'Event Horizon Tap', 'Reality-Distortion Engine', 'Continuum Fuel Cell',
  'Mythic Fuel Core', 'Omni-Matter Collector', 'Acausal Energy Siphon', 'The Perpetual Motion Drive', 'Heart of a Star'
];
export const fuelUpgrades: FuelUpgrade[] = fuelNames.map((name, i) => ({
    level: i + 1,
    name,
    cost: fuelCosts[i],
    capacity: 100 + 25 * i
}));

// --- Sensor Upgrades ---
const sensorCosts = generateUpgradeCosts(upgradeLevelCount, 6000 * costMultiplier, costGrowthFactor);
const sensorNames = [
  'Basic Scanner', 'Long-Range Scanners', 'Advanced Discovery Scanner', 'Detailed Surface Scanner', 'Threat-Assessment Suite',
  'Gravimetric Sensors', 'High-Resolution Imagers', 'Subspace Anomaly Detector', 'Resonance Scanner', 'Deep-Space Telescope Array',
  'Guardian Sensor Package', 'Precursor Data Scanner', 'Quantum Entanglement Sensor', 'Temporal Scanner', 'Rift Signature Detector',
  'Psychic Resonance Array', 'Causal Anomaly Detector', 'Metadimensional Scanner', 'Omni-Spectrum Analyzer', 'Singularity Sensor',
  'Null-Signature Scanner', 'Event Horizon Telescope', 'Acausal Event Detector', 'Continuum Scanner', 'Reality Imager',
  'Mythic Sensor Array', 'The All-Seeing Eye', 'Oracle-Class Precog Unit', 'Fates-Lens Scanner', 'The Whispering Compass'
];
export const sensorUpgrades: SensorUpgrade[] = sensorNames.map((name, i) => ({
    level: i + 1,
    name,
    cost: sensorCosts[i]
}));

// --- Drone Upgrades ---
const droneCosts = generateUpgradeCosts(upgradeLevelCount, 7000 * costMultiplier, costGrowthFactor);
const droneNames = [
    'Basic Survey Drone', 'Advanced Scanner Drone', 'Mining Drone Mk. I', 'Salvage Drone', 'Combat Drone Mk. I',
    'Repair Nanite Drone', 'Exploration Drone', 'Shield Boost Drone', 'Mining Drone Mk. II', 'Heavy Salvage Drone',
    'Combat Drone Mk. II', 'Tactical Jammer Drone', 'Resource Prospector', 'Advanced Repair Swarm', 'Shield Transference Drone',
    'Gatling Combat Drone', 'Stealth Recon Drone', 'Artifact Retrieval Drone', 'Heavy Mining Drone', 'Armored Combat Drone',
    'Guardian Point-Defense Drone', 'Quantum Entanglement Drone', 'Phase Shift Drone', 'Precursor Tech Drone', 'Singularity Drone',
    'Mythic Attack Swarm', 'Continuum Drone', 'Omni-Purpose Drone', 'Acausal Scout Drone', 'The Swarm-King'
];
export const droneUpgrades: DroneUpgrade[] = droneNames.map((name, i) => ({
    level: i + 1,
    name,
    cost: droneCosts[i]
}));
