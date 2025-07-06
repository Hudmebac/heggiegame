
import type { CargoUpgrade, WeaponUpgrade, ShieldUpgrade, HullUpgrade, FuelUpgrade, SensorUpgrade } from '@/lib/types';

const generateLevels = (
    count: number,
    baseCost: number,
    prefix: string,
    costGrowth: number,
    otherPropGen: (level: number) => object
): any[] => {
    const upgrades = [];
    let cumulativeCost = 0;
    for (let i = 1; i <= count; i++) {
        let levelCost = (i === 1) ? 0 : Math.round(baseCost * Math.pow(costGrowth, i - 2));
        cumulativeCost += levelCost;
        upgrades.push({
            level: i,
            name: `${prefix} Mk. ${i}`,
            cost: cumulativeCost,
            ...otherPropGen(i)
        });
    }
    return upgrades;
};

const costMultiplier = 1.4;
const costGrowthFactor = 2.0;

export const cargoUpgrades: CargoUpgrade[] = generateLevels(
    20, 
    5000 * costMultiplier, 
    'Cargo Bay Expansion', 
    costGrowthFactor, 
    level => ({ capacity: 25 * level })
);

export const weaponUpgrades: WeaponUpgrade[] = generateLevels(
    20, 
    10000 * costMultiplier, 
    'Weapon System', 
    costGrowthFactor, 
    () => ({})
);

export const shieldUpgrades: ShieldUpgrade[] = generateLevels(
    20, 
    7500 * costMultiplier, 
    'Shield Generator', 
    costGrowthFactor, 
    () => ({})
);

export const hullUpgrades: HullUpgrade[] = generateLevels(
    20, 
    8000 * costMultiplier, 
    'Hull Plating', 
    costGrowthFactor, 
    level => ({ health: 100 + 20 * (level - 1) })
);

export const fuelUpgrades: FuelUpgrade[] = generateLevels(
    20, 
    4000 * costMultiplier, 
    'Fuel Tank', 
    costGrowthFactor, 
    level => ({ capacity: 100 + 25 * (level - 1) })
);

export const sensorUpgrades: SensorUpgrade[] = generateLevels(
    20, 
    6000 * costMultiplier, 
    'Sensor Suite', 
    costGrowthFactor, 
    () => ({})
);
