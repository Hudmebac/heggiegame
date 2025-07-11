
import type { Stock } from './types';
import { SHIPS_FOR_SALE } from './ships';
import { businessData } from './business-data';

const manufacturers = [...new Set(SHIPS_FOR_SALE.map(s => s.manufacturer))];
const businesses = businessData.filter(b => b.id !== 'casino').map(b => b.title);

const initialStockNames = [...new Set([...manufacturers, ...businesses])];

export const INITIAL_STOCKS: Omit<Stock, 'lastUpdated'>[] = initialStockNames.map(name => {
    let id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let category: Stock['category'] = 'Industrial'; // Default category

    if (manufacturers.includes(name)) {
        category = 'Ship Manufacturing';
    } else {
        switch (name) {
            case 'Bar':
            case 'Recreation Facility':
                category = 'Consumer Services';
                break;
            case 'Residence':
                category = 'Real Estate';
                break;
            case 'Commerce Hub':
                category = 'Finance';
                break;
            case 'Construction Project':
                category = 'Industrial';
                break;
            case 'Galactic Bank':
                category = 'Finance';
                break;
        }
    }
    
    if (name === "Industrial Facility") id = "industrial-facility";
    if (name === "Construction Project") id = "construction-project";
    if (name === "Commerce Hub") id = "commerce-hub";

    const basePrice = Math.floor(100 + Math.random() * 900);
    const totalShares = 1000000;
    return {
        id,
        name,
        category,
        price: basePrice,
        history: Array(50).fill(basePrice).map(p => p + (Math.random() - 0.5) * p * 0.1),
        changePercent: (Math.random() - 0.5) * 5,
        totalShares: totalShares,
        sharesAvailable: totalShares,
    }
});
