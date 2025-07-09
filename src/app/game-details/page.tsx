'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Info, Mail, Bug, User, Lightbulb, MessageSquare } from 'lucide-react';
import Link from "next/link";

const changelogData = [
    {
        version: "v1.2.0 - 'Orion's Arm'",
        date: "Cycle 4521.08",
        changes: [
            "Introduced Faction Allegiance system. Players can now pledge to one of six major galactic powers for unique perks.",
            "Added 'How to Play' section to the Encyclopedia.",
            "Implemented local storage for game persistence and a unique key system for cross-device syncing.",
            "Integrated a Facebook sharing feature to earn in-game tokens.",
            "Removed all external AI dependencies, replacing them with robust, in-game simulations for enhanced stability and performance."
        ]
    },
    {
        version: "v1.1.0 - 'Gemini'",
        date: "Cycle 4521.07",
        changes: [
            "Overhauled the career system, introducing unique mission boards for Hauler, Taxi Pilot, Defender, and more.",
            "Added a full suite of business ventures: Residence, Commerce, Industry, Construction, and Recreation.",
            "Implemented the Galactic Bank, allowing for loans, credit, and eventual ownership.",
        ]
    },
    {
        version: "v1.0.0 - 'Helios'",
        date: "Cycle 4521.06",
        changes: [
            "Initial launch of the HEGGIE: Hegg Interstellar Exchange.",
            "Core gameplay loop established: trading, ship management, and questing.",
        ]
    }
];

const faqData = [
    {
        question: "My game isn't saving! What do I do?",
        answer: "HEGGIE automatically saves your progress to your browser's local storage. If you're using a private/incognito window or have scripts disabled, this may fail. To move progress between devices, use the 'Sync & Share' feature in your Captain profile."
    },
    {
        question: "How do I make a lot of credits quickly?",
        answer: "There are many paths to wealth! Early on, focus on completing Quests and Objectives for large lump-sum rewards. For passive income, invest in upgrading your business ventures and hiring bots. For active income, pay close attention to the Market and trade commodities between systems with different economies (e.g., buy Food cheap in an 'Agricultural' system and sell it for a profit in an 'Industrial' one)."
    },
    {
        question: "What's the best career?",
        answer: "Each career offers a unique playstyle. 'Hauler' and 'Trader' are great for those who enjoy logistics and market speculation. 'Defender' and 'Fighter' are for combat-oriented players. 'Galactic Official' is for those who enjoy strategy and diplomacy. 'Landlord' is for players who prefer building a passive empire. The 'Heggie Contractor' is a great 'jack-of-all-trades' for experiencing everything."
    },
    {
        question: "How do I change my Faction or Career?",
        answer: "You can manage your Faction allegiance and initiate a career change from your 'Captain' page. Changing allegiance costs credits, while changing careers requires either a hefty fee or passing a skill-based minigame."
    }
]

export default function GameDetailsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-headline text-slate-200 tracking-wider">Game Details & Support</h2>
                <p className="text-muted-foreground">Information about the game, its development, and how to get help.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                            <Info className="text-primary"/>
                            Recent Changes (Changelog)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {changelogData.map(log => (
                                <AccordionItem key={log.version} value={log.version}>
                                    <AccordionTrigger>{log.version} ({log.date})</AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                            {log.changes.map((change, i) => <li key={i}>{change}</li>)}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                            <User className="text-primary"/>
                            About the Developer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2"><Lightbulb className="h-4 w-4"/> The Idea</h4>
                            <p className="text-sm text-muted-foreground">
                                HEGGIE was born from a love for classic space trading games like Elite and a fascination with modern web technologies. The goal was to create a persistent, browser-based universe that felt alive, where a player's economic decisions had a tangible impact. It's a passion project dedicated to the dream of charting your own course among the stars.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2"><User className="h-4 w-4"/> The Bio</h4>
                             <p className="text-sm text-muted-foreground">
                                Craig is a solo developer with a passion for building intricate worlds and game systems. With a background in web development, he's leveraging NextJS, React, and Tailwind to bring the HEGGIE universe to life, one feature at a time.
                            </p>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                            <MessageSquare className="text-primary"/>
                            Frequently Asked Questions
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {faqData.map(faq => (
                                <AccordionItem key={faq.question} value={faq.question}>
                                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
                
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                            <Mail className="text-primary"/>
                            Support & Feedback
                        </CardTitle>
                        <CardDescription>
                            Have a great idea, found a pesky bug, or just want to say hello? Get in touch!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button asChild>
                            <a href="mailto:heliosheggie@gmail.com?subject=HEGGIE Feedback" target="_blank" rel="noopener noreferrer">
                                <Mail className="mr-2"/> Provide Feedback
                            </a>
                        </Button>
                         <Button asChild variant="destructive">
                            <a href="mailto:heliosheggie@gmail.com?subject=HEGGIE Bug Report" target="_blank" rel="noopener noreferrer">
                                <Bug className="mr-2"/> Report a Bug
                            </a>
                        </Button>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
