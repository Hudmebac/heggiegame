import type { ZoneType } from '@/lib/types';

export const residenceThemes: Record<ZoneType | 'Default', { name: (planetName: string) => string; description: string; buttonText: string; baseIncome: number; }> = {
    'Core World': {
        name: () => "The Zenith Sky-Loft",
        description: "Collect rent from wealthy elites in this opulent high-rise apartment. High value, low hassle.",
        buttonText: "Collect Rent",
        baseIncome: 12.5
    },
    'Trade Hub': {
        name: () => "The Crossroads Hab-Block",
        description: "A bustling hab-block filled with transient traders. Rent is steady, but turnover is high.",
        buttonText: "Collect Fees",
        baseIncome: 7.5
    },
    'Frontier Outpost': {
        name: () => "The Pioneer's Homestead",
        description: "A rugged, self-sufficient homestead on the edge of known space. It's not much, but it's yours.",
        buttonText: "Harvest Hydroponics",
        baseIncome: 4
    },
    'Mining Colony': {
        name: () => "The Foreman's Quarters",
        description: "Manage a block of dormitories for off-duty miners. The income is reliable, if a bit grimy.",
        buttonText: "Check Meters",
        baseIncome: 6
    },
    'Ancient Ruins': {
        name: () => "The Caretaker's Sanctum",
        description: "A secluded dwelling amidst ancient ruins. It rarely generates income, but sometimes attracts... interesting tenants.",
        buttonText: "Maintain Wards",
        baseIncome: 2.5
    },
    'Corporate Zone': {
        name: () => "The Executive Suite",
        description: "A polished corporate apartment. Tenants are demanding, but the pay is excellent.",
        buttonText: "Process Dues",
        baseIncome: 11
    },
    'Diplomatic Station': {
        name: () => "The Embassy Annex",
        description: "A quiet, secure residence for low-level diplomatic staff. The essence of discretion.",
        buttonText: "Receive Tithes",
        baseIncome: 10
    },
    'Default': {
        name: (planetName) => `Your Hab-Unit on ${planetName}`,
        description: "A standard-issue habitation unit. A place to rest your head and earn a little on the side.",
        buttonText: "Collect Rent",
        baseIncome: 5
    }
};
