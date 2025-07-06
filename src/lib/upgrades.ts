import type { CargoUpgrade, WeaponUpgrade, ShieldUpgrade } from '@/lib/types';

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
