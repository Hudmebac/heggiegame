import type { StaticItem, ItemCategory, ItemRarity } from '@/lib/types';
import spaceCommodities from './space_commodities.json';

const spaceCommoditiesData: { category: string; name: string; rarity: string; description: string; detail: string }[] = spaceCommodities;

const generatedItems: StaticItem[] = [];

const uniqueCommodityNames = new Set<string>();

spaceCommoditiesData.forEach(item => {
    if (!item.name || uniqueCommodityNames.has(item.name)) {
        return; 
    }
    uniqueCommodityNames.add(item.name);

    const basePrice = Math.floor(Math.random() * (2000 - 100 + 1)) + 100;
    const cargoSpace = Math.floor(Math.random() * (10 - 1 + 1)) + 1;

    // Standard Grade
    generatedItems.push({
        ...item,
        grade: 'Standard',
        basePrice: basePrice,
        cargoSpace: cargoSpace,
        category: item.category as ItemCategory,
        rarity: item.rarity as ItemRarity,
    });

    // Refined Grade
    generatedItems.push({
        ...item,
        name: `${item.name} (Refined)`,
        grade: 'Refined',
        basePrice: Math.round(basePrice * 1.5),
        cargoSpace: cargoSpace,
        category: item.category as ItemCategory,
        rarity: item.rarity as ItemRarity,
        description: `An enhanced version of ${item.name}. ${item.description}`,
    });

    // Salvaged Grade
    generatedItems.push({
        ...item,
        name: `${item.name} (Salvaged)`,
        grade: 'Salvaged',
        basePrice: Math.round(basePrice * 0.6),
        cargoSpace: cargoSpace,
        category: item.category as ItemCategory,
        rarity: item.rarity as ItemRarity,
        description: `A degraded but functional version of ${item.name}. ${item.description}`,
    });
});


const specialItems: StaticItem[] = [
    {
        name: 'Prototype Warp Stabilizer',
        category: 'Technology',
        grade: 'Experimental',
        rarity: 'Ultra Rare',
        description: 'A highly unstable but powerful warp coil stabilizer.',
        detail: 'Reduces fuel consumption for jumps by 25% but has a 5% chance of causing minor hull damage on activation.',
        basePrice: 25000,
        cargoSpace: 2,
    },
    {
        name: 'Quantum Entangled Datacore',
        category: 'Technology',
        grade: 'Quantum',
        rarity: 'Ultra Rare',
        description: 'A pair of datacores that share the same quantum state.',
        detail: 'Allows for instantaneous, untraceable communication across any distance. Highly illegal.',
        basePrice: 150000,
        cargoSpace: 0.5,
    },
    {
        name: 'Heart of a Dead Star',
        category: 'Minerals',
        grade: 'Singularity',
        rarity: 'Ultra Rare',
        description: 'A crystalline fragment from the core of a collapsed star.',
        detail: 'The ultimate power source, its energy output is nearly infinite but impossible to control safely. A story-driven artifact.',
        basePrice: 999999,
        cargoSpace: 1,
    }
];

export const STATIC_ITEMS: StaticItem[] = [...generatedItems, ...specialItems];
