
import type { Stock } from './types';
import { SHIPS_FOR_SALE } from './ships';
import { businessData } from './business-data';

const manufacturers = [...new Set(SHIPS_FOR_SALE.map(s => s.manufacturer))];
// Filter out 'Casino' as it's not a tradable business entity on the stock market
const businesses = businessData.filter(b => b.id !== 'casino').map(b => b.title);

const initialStockNames = [...new Set([...manufacturers, ...businesses])];

export const INITIAL_STOCKS: Omit<Stock, 'lastUpdated'>[] = initialStockNames.map(name => {
    // A simple hash function to create a more unique ID from the name
    let id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (name === "Industrial Facility") id = "industrial-facility";
    if (name === "Construction Project") id = "construction-project";
    if (name === "Commerce Hub") id = "commerce-hub"; // Unique ID for Commerce Hub

    const basePrice = Math.floor(100 + Math.random() * 900);
    const totalShares = 1000000;
    return {
        id,
        name,
        price: basePrice,
        history: Array(50).fill(basePrice).map(p => p + (Math.random() - 0.5) * p * 0.1),
        changePercent: (Math.random() - 0.5) * 5,
        totalShares: totalShares,
        sharesAvailable: totalShares,
    }
});
