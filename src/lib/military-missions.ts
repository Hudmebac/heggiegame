
import type { MilitaryMission } from '@/lib/types';

// This is a list of mission templates. The final 'id', and 'system' will be generated dynamically.
export const STATIC_MILITARY_MISSIONS: Omit<MilitaryMission, 'id' | 'system' | 'status'>[] = [
    // Low Risk
    {
        title: "Reconnaissance: Pirate Listening Post",
        missionType: 'Recon',
        description: "Fly a quick recon pattern over a suspected pirate listening post. Gather data, avoid engagement.",
        target: "Listening Post Alpha",
        payout: 18000,
        riskLevel: 'Low',
        duration: 180,
    },
    {
        title: "Strike: Smuggler's Cache",
        missionType: 'Strike',
        description: "A small-time smuggler has a hidden cache of goods. Hit it fast and get out before reinforcements arrive.",
        target: "Hidden Cache",
        payout: 25000,
        riskLevel: 'Low',
        duration: 220,
    },

    // Medium Risk
    {
        title: "Raid: Fuel Depot",
        missionType: 'Raid',
        description: "A local pirate faction's fuel depot is lightly guarded. A swift raid could disrupt their operations for weeks.",
        target: "Pirate Fuel Depot",
        payout: 55000,
        riskLevel: 'Medium',
        duration: 300,
    },
    {
        title: "Strike: Comms Relay Sabotage",
        missionType: 'Strike',
        description: "Destroy a key communications relay to throw a rival mercenary group into disarray.",
        target: "Comms Relay KX-7",
        payout: 60000,
        riskLevel: 'Medium',
        duration: 280,
    },

    // High Risk
    {
        title: "Assassination: 'Vulture' Jax",
        missionType: 'Assassination',
        description: "A notorious pirate captain, 'Vulture' Jax, is commanding a raid. Take him out.",
        target: "Vulture Jax",
        payout: 120000,
        riskLevel: 'High',
        duration: 350,
    },
    {
        title: "Raid: Fortified Pirate Base",
        missionType: 'Raid',
        description: "A full-scale assault on a heavily fortified pirate asteroid base. Expect significant resistance.",
        target: "Asteroid Fortress Zeta",
        payout: 150000,
        riskLevel: 'High',
        duration: 450,
    },

    // Critical Risk
    {
        title: "Decapitation Strike: Warlord's Flagship",
        missionType: 'Strike',
        description: "The pirate warlord Kaelen is leading an attack from his flagship. A high-risk, high-reward strike could end his reign.",
        target: "Warlord Kaelen's Flagship",
        payout: 350000,
        riskLevel: 'Critical',
        duration: 600,
    },
];
