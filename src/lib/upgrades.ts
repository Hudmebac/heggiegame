import type { CargoUpgrade, WeaponUpgrade, ShieldUpgrade } from '@/lib/types';

export const cargoUpgrades: CargoUpgrade[] = [
    { capacity: 50, cost: 0 },
    { capacity: 75, cost: 5000 },
    { capacity: 100, cost: 12000 },
    { capacity: 150, cost: 25000 },
    { capacity: 225, cost: 50000 },
    { capacity: 300, cost: 100000 },
];

export const weaponUpgrades: WeaponUpgrade[] = [
    { level: 1, name: 'Mk. I Laser', cost: 0 },
    { level: 2, name: 'Mk. II Pulse Laser', cost: 10000 },
    { level: 3, name: 'Mk. III Plasma Cannon', cost: 30000 },
    { level: 4, name: 'Mk. IV Ion Repeater', cost: 75000 },
    { level: 5, name: 'Mk. V Neutron Blaster', cost: 150000 },
];

export const shieldUpgrades: ShieldUpgrade[] = [
    { level: 1, name: 'Class-A Deflector', cost: 0 },
    { level: 2, name: 'Class-B Field', cost: 7500 },
    { level: 3, name: 'Class-C Barrier', cost: 20000 },
    { level: 4, name: 'Class-D Force Field', cost: 50000 },
    { level: 5, name: 'Class-E Aegis Shielding', cost: 120000 },
];
