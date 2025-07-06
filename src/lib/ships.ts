import type { ShipForSale } from '@/lib/types';

export const SHIPS_FOR_SALE: ShipForSale[] = [
  {
    id: 'shuttle-s',
    name: 'S-Class Shuttle',
    manufacturer: 'Corellian Transport Guild',
    description: 'A small, reliable shuttle perfect for quick cargo runs in secure space. Not built for a fight, but she\'s cheap to maintain.',
    cost: 45000,
    cargo: 75,
    fuel: 110,
    health: 80,
  },
  {
    id: 'hauler-mk2',
    name: 'Hauler Mk. II',
    manufacturer: 'Lakon Spaceways',
    description: 'The workhorse of the galaxy. This vessel boasts a large cargo capacity for its class, making it a favorite of bulk traders.',
    cost: 120000,
    cargo: 250,
    fuel: 100,
    health: 150,
  },
  {
    id: 'viper-escort',
    name: 'Viper Combat Escort',
    manufacturer: 'Faulcon deLacy',
    description: 'Fast, agile, and packing a punch. The Viper is designed for bounty hunters and security forces who need to end a fight quickly.',
    cost: 250000,
    cargo: 40,
    fuel: 150,
    health: 120,
  },
  {
    id: 'leviathan-freighter',
    name: 'Leviathan Super-Freighter',
    manufacturer: 'Gallofree Yards, Inc.',
    description: 'A true giant of the spacelanes. The Leviathan can move entire inventories between systems, but its size makes it a tempting target.',
    cost: 1500000,
    cargo: 1000,
    fuel: 300,
    health: 500,
  },
];
