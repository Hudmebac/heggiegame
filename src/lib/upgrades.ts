import type { CargoUpgrade, WeaponUpgrade, ShieldUpgrade, HullUpgrade, FuelUpgrade } from '@/lib/types';

export const cargoUpgrades: CargoUpgrade[] = [
    { capacity: 50, cost: 0 },
    { capacity: 75, cost: 5000 },
    { capacity: 100, cost: 12000 },
    { capacity: 150, cost: 25000 },
    { capacity: 225, cost: 50000 },
    { capacity: 300, cost: 100000 },
    { capacity: 400, cost: 220000 },
    { capacity: 550, cost: 450000 },
    { capacity: 750, cost: 900000 },
    { capacity: 1000, cost: 2000000 },
];

export const weaponUpgrades: WeaponUpgrade[] = [
    { level: 1, name: 'Mk. I Laser', cost: 0 },
    { level: 2, name: 'Mk. II Pulse Laser', cost: 10000 },
    { level: 3, name: 'Mk. III Plasma Cannon', cost: 30000 },
    { level: 4, name: 'Mk. IV Ion Repeater', cost: 75000 },
    { level: 5, name: 'Mk. V Neutron Blaster', cost: 150000 },
    { level: 6, name: 'Mk. VI Tachyon Lance', cost: 350000 },
    { level: 7, name: 'Mk. VII Singularity Projector', cost: 700000 },
    { level: 8, name: 'Mk. VIII Antimatter Array', cost: 1500000 },
    { level: 9, name: 'Mk. IX Reality Disruptor', cost: 3500000 },
    { level: 10, name: "'Apex' Chrono-Cannon", cost: 8000000 },
];

export const shieldUpgrades: ShieldUpgrade[] = [
    { level: 1, name: 'Class-A Deflector', cost: 0 },
    { level: 2, name: 'Class-B Field', cost: 7500 },
    { level: 3, name: 'Class-C Barrier', cost: 20000 },
    { level: 4, name: 'Class-D Force Field', cost: 50000 },
    { level: 5, name: 'Class-E Aegis Shielding', cost: 120000 },
    { level: 6, name: 'Class-F Graviton Mesh', cost: 280000 },
    { level: 7, name: 'Class-G Phasic Inverter', cost: 600000 },
    { level: 8, name: 'Class-H Cyclonic Shield', cost: 1300000 },
    { level: 9, name: 'Class-I Null-Space Ward', cost: 3000000 },
    { level: 10, name: "'Axiom' Horizon Projector", cost: 7000000 },
];

export const hullUpgrades: HullUpgrade[] = [
    { level: 1, name: 'Standard Plating', health: 100, cost: 0 },
    { level: 2, name: 'Reinforced Bulkheads', health: 120, cost: 8000 },
    { level: 3, name: 'Ablative Armor', health: 150, cost: 25000 },
    { level: 4, name: 'Titanium Composite', health: 190, cost: 60000 },
    { level: 5, name: 'Ceramic Lattice', health: 240, cost: 130000 },
    { level: 6, name: 'Reactive Plating', health: 300, cost: 300000 },
    { level: 7, name: 'Nanolaminate Hull', health: 370, cost: 650000 },
    { level: 8, name: 'Quantum-Hardened Shell', health: 450, cost: 1400000 },
    { level: 9, name: 'Void-Alloy Frame', health: 550, cost: 3200000 },
    { level: 10, name: 'Singularity Weave', health: 700, cost: 7500000 },
];

export const fuelUpgrades: FuelUpgrade[] = [
    { level: 1, name: 'Standard Tank', capacity: 100, cost: 0 },
    { level: 2, name: 'Extended Capacity Tank', capacity: 125, cost: 4000 },
    { level: 3, name: 'Dual-Cell System', capacity: 150, cost: 10000 },
    { level: 4, name: 'Pressurized Reservoir', capacity: 180, cost: 22000 },
    { level: 5, name: 'High-Density Tank', capacity: 220, cost: 45000 },
    { level: 6, name: 'Auxiliary Fusion Tank', capacity: 270, cost: 95000 },
    { level: 7, name: 'Cryo-Storage System', capacity: 330, cost: 200000 },
    { level: 8, name: 'Plasma Injector Tank', capacity: 400, cost: 420000 },
    { level: 9, name: 'Zero-Point Fuel Module', capacity: 500, cost: 880000 },
    { level: 10, name: 'Pocket Dimension Silo', capacity: 650, cost: 1800000 },
];
