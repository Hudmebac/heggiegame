'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollText, Target, Calendar } from 'lucide-react';

const quests = [
    {
        title: "The Crimson Bounty",
        description: "A notorious pirate, 'Red' Stellan, has been causing havoc in the Kepler system. The Galactic Syndicate has placed a high bounty on their head. Bring them to justice.",
        reward: "25,000 ¢",
        type: "Bounty",
        difficulty: "High"
    },
    {
        title: "Urgent Delivery to Sirius",
        description: "A medical outpost on Sirius Prime requires an urgent shipment of Bacta-Graft. Deliver 15 units before the cycle ends. Time is critical.",
        reward: "12,000 ¢",
        type: "Daily",
        difficulty: "Medium"
    },
    {
        title: "Mineral Rush in Proxima Centauri",
        description: "Geological surveys have revealed a massive, untapped deposit of Quantium Ore in the Proxima Centauri asteroid belt. Be the first to mine and deliver 50 units.",
        reward: "Variable",
        type: "Quest",
        difficulty: "Medium"
    }
]

export default function QuestsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Calendar className="text-primary"/>
                        Daily Quests
                    </CardTitle>
                    <CardDescription>These high-reward missions reset every 24 hours.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {quests.filter(q => q.type === 'Daily').map(quest => (
                        <Card key={quest.title} className="bg-card/50">
                            <CardHeader>
                                <CardTitle className="text-base">{quest.title}</CardTitle>
                                <CardDescription>{quest.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center">
                                <span className="text-amber-400 font-mono">Reward: {quest.reward}</span>
                                <Button>Accept</Button>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Target className="text-primary"/>
                        Bounties
                    </CardTitle>
                    <CardDescription>Hunt down wanted criminals for substantial rewards.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {quests.filter(q => q.type === 'Bounty').map(quest => (
                        <Card key={quest.title} className="bg-card/50 border-destructive/20">
                            <CardHeader>
                                <CardTitle className="text-base text-destructive">{quest.title}</CardTitle>
                                <CardDescription>{quest.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center">
                                <span className="text-amber-400 font-mono">Reward: {quest.reward}</span>
                                <Button variant="destructive">Accept Bounty</Button>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <ScrollText className="text-primary"/>
                        Available Quests
                    </CardTitle>
                    <CardDescription>Embark on adventures across the galaxy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {quests.filter(q => q.type === 'Quest').map(quest => (
                        <Card key={quest.title} className="bg-card/50">
                            <CardHeader>
                                <CardTitle className="text-base">{quest.title}</CardTitle>
                                <CardDescription>{quest.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center">
                                <span className="text-amber-400 font-mono">Reward: {quest.reward}</span>
                                <Button>Accept Quest</Button>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
