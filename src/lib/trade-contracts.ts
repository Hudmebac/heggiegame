import type { TradeRouteContract } from '@/lib/types';

// This is a list of contract templates. The final 'id', 'fromSystem', and 'toSystem' will be generated dynamically.
export const STATIC_TRADE_CONTRACTS: Omit<TradeRouteContract, 'id' | 'fromSystem' | 'toSystem' | 'status'>[] = [
    // Low Risk
    {
        cargo: 'Food Rations (Standard)',
        quantity: 100,
        payout: 8000,
        riskLevel: 'Low',
        duration: 200,
    },
    {
        cargo: 'Industrial Components (Standard)',
        quantity: 80,
        payout: 12000,
        riskLevel: 'Low',
        duration: 250,
    },
    {
        cargo: 'Water Purifiers (Standard)',
        quantity: 120,
        payout: 9500,
        riskLevel: 'Low',
        duration: 180,
    },
    // Medium Risk
    {
        cargo: 'Advanced Alloys (Refined)',
        quantity: 50,
        payout: 25000,
        riskLevel: 'Medium',
        duration: 300,
    },
    {
        cargo: 'Medical Supplies (Standard)',
        quantity: 150,
        payout: 30000,
        riskLevel: 'Medium',
        duration: 260,
    },
    {
        cargo: 'Computer Components (Refined)',
        quantity: 60,
        payout: 45000,
        riskLevel: 'Medium',
        duration: 220,
    },
    // High Risk
    {
        cargo: 'Military Weapons (Standard)',
        quantity: 40,
        payout: 75000,
        riskLevel: 'High',
        duration: 350,
    },
    {
        cargo: 'Precursor Artifacts (Salvaged)',
        quantity: 10,
        payout: 100000,
        riskLevel: 'High',
        duration: 280,
    },
    // Critical Risk
    {
        cargo: 'Illegal Cybernetics (Salvaged)',
        quantity: 25,
        payout: 150000,
        riskLevel: 'Critical',
        duration: 400,
    },
];
