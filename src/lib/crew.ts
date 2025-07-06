import type { CrewMember } from '@/lib/types';

export const AVAILABLE_CREW: CrewMember[] = [
  { id: 'eng-01', name: 'Zara "Sparks" Kosari', role: 'Engineer', description: 'Reduces travel fuel consumption by 5%.', salary: 500, hiringFee: 2000 },
  { id: 'gun-01', name: 'Rook', role: 'Gunner', description: 'Increases weapon effectiveness in combat.', salary: 750, hiringFee: 3000 },
  { id: 'nav-01', name: 'Jax "Starchart" Vance', role: 'Navigator', description: 'Reduces chance of high-threat pirate encounters by 10%.', salary: 600, hiringFee: 2500 },
  { id: 'neg-01', name: 'Silas "Silver-Tongue" Thorne', role: 'Negotiator', description: 'Improves bribe outcomes and reduces costs by 15%.', salary: 800, hiringFee: 4000 },
  { id: 'eng-02', name: 'Grizelda "Gear-Head" Petrova', role: 'Engineer', description: 'Increases ship repair efficiency, reducing costs by 10%.', salary: 650, hiringFee: 2800 },
  { id: 'gun-02', name: 'Cmdr. "Hex" Corbin', role: 'Gunner', description: 'Increases chances of a successful fight outcome.', salary: 900, hiringFee: 5000 },
  { id: 'nav-02', name: 'Anya "Void-Walker" Sharma', role: 'Navigator', description: 'Occasionally reveals hidden, high-value trade routes.', salary: 1200, hiringFee: 6000 },
  { id: 'neg-02', name: 'Madame Evangeline', role: 'Negotiator', description: 'Gains 1 extra reputation point from successful trades.', salary: 1000, hiringFee: 5500 },
];
