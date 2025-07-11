
import type { Stock } from './types';
import { SHIPS_FOR_SALE } from './ships';
import { businessData } from './business-data';

const manufacturers = [...new Set(SHIPS_FOR_SALE.map(s => s.manufacturer))];
const businesses = businessData.map(b => b.title);

const initialStockNames = [...new Set([...manufacturers, ...businesses])];

export const INITIAL_STOCKS: Omit<Stock, 'lastUpdated'>[] = initialStockNames.map(name => {
    const basePrice = Math.floor(100 + Math.random() * 900);
    return {
        id: name.toLowerCase().replace(/\s/g, '-'),
        name,
        price: basePrice,
        history: Array(50).fill(basePrice).map(p => p + (Math.random() - 0.5) * p * 0.1),
        changePercent: (Math.random() - 0.5) * 5,
    }
});
