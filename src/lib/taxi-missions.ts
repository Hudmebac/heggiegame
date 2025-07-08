import type { TaxiMission } from '@/lib/types';

// This is a list of mission templates. The final 'id', 'fromSystem', and 'toSystem' will be generated dynamically.
export const STATIC_TAXI_MISSIONS: Omit<TaxiMission, 'id' | 'fromSystem' | 'toSystem' | 'status'>[] = [
    // Low Risk
    {
        passengerName: 'Corpo-auditor Klex',
        description: "A by-the-book auditor needs quiet transport for a routine system check. Expects punctuality.",
        fare: 8000,
        bonus: 2000,
        riskLevel: 'Low',
        duration: 150,
    },
    {
        passengerName: 'Glitched Pleasure-bot',
        description: "A malfunctioning pleasure-bot seeks a discrete ride to a repair shop. It occasionally sings off-key.",
        fare: 10000,
        bonus: 1500,
        riskLevel: 'Low',
        duration: 180,
    },
    {
        passengerName: 'A group of tourists',
        description: 'A family of sightseers wants to visit the famous nebula in the next system. They ask a lot of questions.',
        fare: 12000,
        bonus: 3000,
        riskLevel: 'Low',
        duration: 240,
    },
    // Medium Risk
    {
        passengerName: 'Down-on-his-luck prospector',
        description: "An old prospector claims to have a map to a big score in the next system. He smells faintly of desperation.",
        fare: 25000,
        bonus: 5000,
        riskLevel: 'Medium',
        duration: 200,
    },
    {
        passengerName: 'Holovid starlet',
        description: "A famous actress needs to get to her next shoot without attracting paparazzi. Her luggage is... extensive.",
        fare: 40000,
        bonus: 10000,
        riskLevel: 'Medium',
        duration: 190,
    },
    // High Risk
    {
        passengerName: 'Shady informant',
        description: "A nervous informant needs to get to a safehouse before their former employers find them. Expect trouble.",
        fare: 75000,
        bonus: 25000,
        riskLevel: 'High',
        duration: 220,
    },
    {
        passengerName: 'Ex-syndicate enforcer',
        description: "A heavily augmented enforcer wants a no-questions-asked ride to the outer rim. Best not to make eye contact.",
        fare: 90000,
        bonus: 20000,
        riskLevel: 'High',
        duration: 300,
    },
    // Critical Risk
    {
        passengerName: 'Renegade AI core',
        description: "A sentient AI core, housed in a reinforced briefcase, needs extraction. It claims to know the secrets of the galaxy.",
        fare: 200000,
        bonus: 50000,
        riskLevel: 'Critical',
        duration: 250,
    },
];
