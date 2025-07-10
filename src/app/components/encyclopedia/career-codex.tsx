
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CAREER_DATA } from "@/lib/careers";
import type { LucideIcon } from 'lucide-react';
import { Briefcase, Zap, AlertTriangle, Video, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const careerTips: Record<string, string[]> = {
    'Hauler': [
        "Focus on upgrading your cargo hold and fuel capacity first.",
        "Always check market prices before accepting a long-distance contract.",
        "A Navigator crew member can help you avoid the most dangerous pirate routes.",
    ],
    'Taxi Pilot': [
        "Speed is everything. Upgrade your engines to maximize bonus fares.",
        "Reputation matters. Completing fares quickly and safely leads to better-paying clients.",
        "Keep an eye out for VIPs; they offer the best payouts but often attract unwanted attention.",
    ],
    'Landlord': [
        "Diversify your properties across different systems to mitigate risk from economic downturns.",
        "Re-invest rental income into property upgrades to create a powerful compounding growth engine.",
        "Higher-tier planets offer better income modifiers, but property costs are also higher.",
    ],
    'Trader': [
        "Pay close attention to system economies. Buy goods that are cheap in the local economy and sell where they are in high demand.",
        "Use warehouses to stockpile goods when prices are low, and sell when an economic event creates a price spike.",
        "A good sensor suite can help you identify profitable trade routes by revealing market shortages or surpluses.",
    ],
    'Defender': [
        "A balanced fleet is key. Have smaller, faster ships for quick escorts and tougher ships for high-risk convoys.",
        "Invest in shield and hull upgrades for all your fleet ships, not just your active one.",
        "The Planetary Defense minigame is a great way to earn steady income between escort missions.",
    ],
    'Fighter': [
        "Specialize your active ship for combat with top-tier weapons and shields.",
        "Mission risk levels directly correlate to the strength of enemy forces. Be prepared for a real fight on 'High' or 'Critical' risk missions.",
        "A Gunner crew member provides a significant combat advantage.",
    ],
    'Galactic Official': [
        "Focus on completing missions that offer the highest influence payout to rank up faster.",
        "Your reputation score directly impacts the quality of mandates you receive.",
        "Balancing the needs of different factions is key. Sometimes, a lower-payout mission can prevent a reputation drop with a powerful stakeholder.",
    ],
    'Heggie Contractor': [
        "Experiment with everything! Your Inspiration Meter fills by engaging in activities from all other careers.",
        "Don't be afraid to be a jack-of-all-trades. Buy a small property, run a few trade contracts, and try the minigames.",
        "Your path is your own. Once your Inspiration Meter is full, you may be presented with a unique opportunity to define your legacy.",
    ]
};

export default function CareerCodex() {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Briefcase className="text-primary"/>Career Paths
                    </CardTitle>
                    <CardDescription>
                        An overview of the available career paths. Your choice determines your starting conditions and unlocks unique gameplay opportunities.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {CAREER_DATA.map(career => {
                        const CareerIcon = career.icon as LucideIcon;
                        const tips = careerTips[career.name] || [];
                        const videoSrc = `/videos/${career.id.toLowerCase().replace(/ /g, '_')}.mp4`;
                        const posterSrc = `https://placehold.co/1280x720.png`;

                        return (
                            <Card key={career.id} className="bg-card/50 border-border/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 font-headline text-xl text-primary">
                                        <CareerIcon className="h-6 w-6"/>
                                        {career.name}
                                    </CardTitle>
                                    <CardDescription className="italic">
                                        {career.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2 text-green-400">
                                            <Zap className="h-4 w-4"/> Perks
                                        </h4>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            {career.perks.map((perk, i) => <li key={i}>{perk}</li>)}
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2 text-orange-400">
                                            <AlertTriangle className="h-4 w-4"/> Risks
                                        </h4>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            {career.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                                        </ul>
                                    </div>
                                    <div className="space-y-2 lg:col-span-2">
                                        <h4 className="font-semibold flex items-center gap-2 text-sky-400">
                                            <Video className="h-4 w-4"/> Gameplay Preview
                                        </h4>
                                        <DialogTrigger asChild>
                                            <button onClick={() => setSelectedVideo(videoSrc)} className="w-full aspect-video bg-black rounded-md overflow-hidden border relative group cursor-pointer">
                                                <Image
                                                    src={posterSrc}
                                                    alt={`${career.name} gameplay preview`}
                                                    layout="fill"
                                                    objectFit="cover"
                                                    className="group-hover:opacity-70 transition-opacity"
                                                    data-ai-hint="space ship"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                    <PlayCircle className="h-16 w-16 text-white/70 group-hover:text-white group-hover:scale-110 transition-all" />
                                                </div>
                                            </button>
                                        </DialogTrigger>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </CardContent>
            </Card>
            <Dialog open={!!selectedVideo} onOpenChange={(isOpen) => !isOpen && setSelectedVideo(null)}>
                <DialogContent className="max-w-4xl p-0 border-0">
                    {selectedVideo && (
                         <video
                            key={selectedVideo}
                            src={selectedVideo}
                            controls
                            autoPlay
                            className="w-full h-full aspect-video rounded-lg"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
