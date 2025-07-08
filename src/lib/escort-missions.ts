import type { EscortMission } from '@/lib/types';

// This is a list of mission templates. The final 'id', 'fromSystem', and 'toSystem' will be generated dynamically.
export const STATIC_ESCORT_MISSIONS: Omit<EscortMission, 'id' | 'fromSystem' | 'toSystem' | 'status'>[] = [
    // Low Risk
    {
        clientName: "Ambassador Kaelen's Shuttle",
        missionType: 'VIP Escort',
        description: "Transport a minor diplomat for a routine diplomatic visit. Low chance of complications.",
        payout: 15000,
        riskLevel: 'Low',
        duration: 180,
    },
    {
        clientName: "Red-Sun Mining Hauler",
        missionType: 'Cargo Convoy',
        description: "Escort a freighter carrying common industrial metals. Standard corporate insurance covers most risks.",
        payout: 12000,
        riskLevel: 'Low',
        duration: 240,
    },
    {
        clientName: "The 'Whispering Ghost' Courier",
        missionType: 'Data Runner',
        description: "Protect a small courier ship carrying encrypted corporate data. The contents are worthless to pirates.",
        payout: 18000,
        riskLevel: 'Low',
        duration: 150,
    },
    {
        clientName: "Starlight Tours Passenger Liner",
        missionType: 'VIP Escort',
        description: "A passenger liner on a scenic route requires a minimal security presence to reassure its wealthy clients.",
        payout: 20000,
        riskLevel: 'Low',
        duration: 300,
    },

    // Medium Risk
    {
        clientName: "Cryo-Genetics Transport",
        missionType: 'Cargo Convoy',
        description: "A shipment of valuable biological samples is being moved for research. The cargo is sensitive and valuable.",
        payout: 35000,
        riskLevel: 'Medium',
        duration: 220,
    },
    {
        clientName: "The 'Orion's Tear' Gemstone Haul",
        missionType: 'Cargo Convoy',
        description: "Escort a shipment of uncut precious gemstones from a mining outpost. The route is known for occasional pirate activity.",
        payout: 40000,
        riskLevel: 'Medium',
        duration: 280,
    },
    {
        clientName: "Renegade Scientist's Escape",
        missionType: 'VIP Escort',
        description: "A scientist is defecting from a major corporation with sensitive research. Corporate security may attempt recovery.",
        payout: 50000,
        riskLevel: 'Medium',
        duration: 200,
    },
    {
        clientName: "The 'Siren's Call' Data Vessel",
        missionType: 'Data Runner',
        description: "A ship carrying the coordinates to a newly discovered salvage field needs protection from rival prospectors.",
        payout: 45000,
        riskLevel: 'Medium',
        duration: 190,
    },

    // High Risk
    {
        clientName: "Exiled Royal Family",
        missionType: 'VIP Escort',
        description: "The deposed royal family of a minor system is seeking asylum. Political enemies have placed a bounty on their heads.",
        payout: 90000,
        riskLevel: 'High',
        duration: 300,
    },
    {
        clientName: "The 'Leviathan's Maw' Weapons Convoy",
        missionType: 'Cargo Convoy',
        description: "A heavily-laden convoy carrying military-grade weaponry. A prime target for well-equipped pirate factions.",
        payout: 85000,
        riskLevel: 'High',
        duration: 350,
    },
    {
        clientName: "The 'Silence' Cartel Witness",
        missionType: 'VIP Escort',
        description: "A key witness in a major crime syndicate trial needs to be transported to a secure location. The cartel will stop at nothing.",
        payout: 120000,
        riskLevel: 'High',
        duration: 250,
    },
    {
        clientName: "The 'Pandora's Box' Artifact Runner",
        missionType: 'Data Runner',
        description: "This data slate contains precursor AI code that is highly illegal and incredibly dangerous. Multiple factions want it.",
        payout: 110000,
        riskLevel: 'High',
        duration: 220,
    },

    // Critical Risk
    {
        clientName: "The 'Doomsday' Trigger Transport",
        missionType: 'Cargo Convoy',
        description: "Escort a convoy carrying a planet-destroying seismic charge. If this falls into the wrong hands, a system is at risk.",
        payout: 250000,
        riskLevel: 'Critical',
        duration: 400,
    },
    {
        clientName: "Project Chimera's Lead Scientist",
        missionType: 'VIP Escort',
        description: "The lead scientist of a forbidden bioweapons project is being moved. Every major power wants them, dead or alive.",
        payout: 300000,
        riskLevel: 'Critical',
        duration: 280,
    },
    {
        clientName: "The 'Void Key' Courier",
        missionType: 'Data Runner',
        description: "A courier carrying data that could destabilize the entire galactic economy. Failure is not an option.",
        payout: 350000,
        riskLevel: 'Critical',
        duration: 200,
    }
];
