

import type { ShipForSale, PlayerShip } from '@/lib/types';
import { hullUpgrades } from './upgrades';

export const SHIPS_FOR_SALE: ShipForSale[] = [
  {
    id: 'shuttle-s',
    name: 'S-Class Shuttle',
    type: "Shuttle",
    designation: "S-Class",
    manufacturer: 'Corellian Transport Guild',
    description: "A small, reliable shuttle perfect for quick cargo runs in secure space. Not built for a fight, but she's cheap to maintain.",
    cost: 25000,
    baseFuel: 110,
    baseHealth: 80,
    crewCapacity: 2,
    baseCargo: 20,
    defenseRating: 15,
    speedRating: 80,
    shieldEmitterSlots: 1,
    engineClass: "MicroPulse-5",
    upgradeSlots: {
      "cargo": 4,
      "defense": 2,
      "navigation": 2
    },
    recommendedUse: "Short-distance courier runs, diplomatic dispatch, low-risk resource transport",
    heggieClearance: "Tier I"
  },
  {
    id: 'hauler-mk2',
    name: 'Hauler Mk. II',
    type: "Freighter",
    designation: "Mk. II",
    manufacturer: 'Lakon Spaceways',
    description: "The workhorse of the galaxy. This vessel boasts a large cargo capacity for its class, making it a favorite of bulk traders.",
    cost: 125000,
    baseFuel: 100,
    baseHealth: 150,
    crewCapacity: 6,
    baseCargo: 350,
    defenseRating: 40,
    speedRating: 50,
    shieldEmitterSlots: 2,
    engineClass: "GravLift-8A",
    upgradeSlots: {
      "cargo": 6,
      "defense": 4,
      "trade_interface": 3
    },
    recommendedUse: "Bulk commodity runs, multi-zone market routes, faction-based trade licenses",
    heggieClearance: "Tier II"
  },
  {
    id: 'viper-escort',
    name: 'Viper Combat Escort',
    type: "Escort",
    designation: "Viper",
    manufacturer: 'Faulcon deLacy',
    description: "Fast, agile, and packing a punch. The Viper is designed for bounty hunters and security forces who need to end a fight quickly.",
    cost: 350000,
    baseFuel: 150,
    baseHealth: 120,
    crewCapacity: 2,
    baseCargo: 10,
    defenseRating: 90,
    speedRating: 95,
    shieldEmitterSlots: 3,
    engineClass: "TalonDrive-VX",
    upgradeSlots: {
      "weapons": 6,
      "stealth": 4,
      "mobility": 3
    },
    recommendedUse: "Escort contracts, bounty missions, pirate suppression, vault protection",
    heggieClearance: "Tier III"
  },
  {
    id: 'leviathan-freighter',
    name: 'Leviathan Super-Freighter',
    type: "Super-Freighter",
    designation: "Leviathan",
    manufacturer: 'Gallofree Yards, Inc.',
    description: "A true giant of the spacelanes. The Leviathan can move entire inventories between systems, but its size makes it a tempting target.",
    cost: 1200000,
    baseFuel: 300,
    baseHealth: 500,
    crewCapacity: 22,
    baseCargo: 1800,
    defenseRating: 65,
    speedRating: 25,
    shieldEmitterSlots: 6,
    engineClass: "MagDrive-TitanCore",
    upgradeSlots: {
      "cargo": 10,
      "defense": 5,
      "fleet_command": 3
    },
    recommendedUse: "Vault-to-vault exchanges, high-value missions, cross-sector enterprise logistics",
    heggieClearance: "Tier IV"
  }
];

export const initialShip: PlayerShip = {
    instanceId: Date.now(),
    shipId: 'shuttle-s',
    name: 'My Shuttle',
    cargoLevel: 1, weaponLevel: 1, shieldLevel: 1, hullLevel: 1, fuelLevel: 1, sensorLevel: 1, droneLevel: 1,
    powerCoreLevel: 1, passengerComfortLevel: 1, passengerSecurityLevel: 1, passengerPacksLevel: 1,
    overdriveEngine: false, warpStabilizer: false, stealthPlating: false, targetingMatrix: false, anomalyAnalyzer: false, fabricatorBay: false,
    gravAnchor: false, aiCoreInterface: false, bioDomeModule: false, flakDispensers: false, boardingTubeSystem: false, terraformToolkit: false, thermalRegulator: false, diplomaticUplink: false,
    health: hullUpgrades[0].health,
    status: 'operational',
};

    
