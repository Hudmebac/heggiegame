import type { Quest } from '@/lib/types';

export const STATIC_QUESTS: Quest[] = [
    // Bounties
    {
        title: "Bounty: 'Rust-Eater' Jax",
        description: "A notorious pirate captain known for salvaging disabled ships has been spotted in the Kepler sector. Bring him to justice.",
        reward: "75000 ¢",
        type: "Bounty",
        difficulty: "Medium"
    },
    {
        title: "Bounty: The Void Reapers",
        description: "A small but vicious gang, the Void Reapers, have been terrorizing trade lanes near Proxima Centauri. Eliminate their leader.",
        reward: "150000 ¢",
        type: "Bounty",
        difficulty: "High"
    },
    // Daily
    {
        title: "Daily: Urgent Fuel Delivery",
        description: "The orbital station in Sirius is critically low on fuel. Deliver a shipment of refined fuel with haste. A generous bonus is offered for speed.",
        reward: "50000 ¢",
        type: "Daily",
        difficulty: "Medium"
    },
    // Quests
    {
        title: "Quest: The Lost Explorer",
        description: "An explorer's distress beacon was last detected in the TRAPPIST-1 system. Find their ship's black box and return it for a reward.",
        reward: "40000 ¢",
        type: "Quest",
        difficulty: "Medium"
    },
    {
        title: "Quest: Rare Mineral Survey",
        description: "A geological survey team requires an escort to a mineral-rich asteroid field in Proxima Centauri. Protect them while they gather samples.",
        reward: "60000 ¢",
        type: "Quest",
        difficulty: "Medium"
    },
    // Objectives
    {
        title: "Industrial Push",
        description: "A core world corporation needs a rush order. Fulfill industrial orders to meet their quota.",
        reward: "25000 ¢",
        type: "Objective",
        difficulty: "Medium",
        tasks: [
            { type: "industry", target: 50, description: "Fulfill Industry Orders" }
        ],
        timeLimit: 180
    },
    {
        title: "Commerce Boom",
        description: "A sudden market opportunity has arisen. Broker as many commercial deals as possible before the window closes.",
        reward: "30000 ¢",
        type: "Objective",
        difficulty: "Medium",
        tasks: [
            { type: "commerce", target: 75, description: "Broker Commercial Deals" }
        ],
        timeLimit: 120
    },
    {
        title: "Urban Development Spree",
        description: "A planetary governor has greenlit a major urban development project. Complete construction jobs to aid the effort.",
        reward: "40000 ¢",
        type: "Objective",
        difficulty: "High",
        tasks: [
            { type: "construction", target: 100, description: "Complete Construction Jobs" }
        ],
        timeLimit: 240
    },
    {
        title: "Entertainment Initiative",
        description: "Boost morale on a frontier outpost by running the local recreation facilities at peak capacity.",
        reward: "20000 ¢",
        type: "Objective",
        difficulty: "Low",
        tasks: [
            { type: "recreation", target: 150, description: "Operate Recreation Facilities" }
        ],
        timeLimit: 120
    },
    {
        title: "Metropolis Development",
        description: "A new urban center requires rapid development across multiple sectors to meet population demands.",
        reward: "75000 ¢",
        type: "Objective",
        difficulty: "High",
        tasks: [
            { "type": "construction", "target": 50, "description": "Complete Construction Jobs" },
            { "type": "commerce", "target": 50, "description": "Broker Commercial Deals" },
            { "type": "residence", "target": 100, "description": "Collect Rent" }
        ],
        timeLimit: 300
    }
];
