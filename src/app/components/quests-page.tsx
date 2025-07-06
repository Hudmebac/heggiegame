'use client'

import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollText, Target, Calendar, RefreshCw, Loader2, ListTodo } from 'lucide-react';
import type { Quest } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


const QuestCard = ({ quest, type }: { quest: Quest, type: 'daily' | 'bounty' | 'quest'}) => {
    const isBounty = type === 'bounty';
    return (
        <Card key={quest.title} className={`bg-card/50 ${isBounty ? 'border-destructive/20' : ''}`}>
            <CardHeader>
                <CardTitle className={`text-base ${isBounty ? 'text-destructive' : ''}`}>{quest.title}</CardTitle>
                <CardDescription>{quest.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                <div>
                    <span className="text-amber-400 font-mono">Reward: {quest.reward}</span>
                    <p className="text-xs text-muted-foreground">Difficulty: {quest.difficulty}</p>
                </div>
                <Button variant={isBounty ? 'destructive' : 'default'} disabled>Accept</Button>
            </CardContent>
        </Card>
    )
}

export default function QuestsPage() {
    const { gameState, handleGenerateQuests, isGeneratingQuests } = useGame();

    if (!gameState) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-36" />
                </div>
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    const { quests } = gameState;
    const hasQuests = quests && quests.length > 0;
    
    const dailyQuests = quests.filter(q => q.type === 'Daily');
    const bounties = quests.filter(q => q.type === 'Bounty');
    const otherQuests = quests.filter(q => q.type === 'Quest');


    const renderContent = () => {
        if (isGeneratingQuests && !hasQuests) {
            return (
                <div className="flex flex-col items-center justify-center text-center space-y-4 h-96">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <p className="text-muted-foreground">Contacting Bounty Network...</p>
                </div>
            )
        }
        if (!hasQuests) {
            return (
                 <div className="flex flex-col items-center justify-center text-center space-y-4 h-96 bg-card/50 rounded-lg border">
                    <ListTodo className="h-16 w-16 text-muted-foreground" />
                    <h3 className="text-xl font-headline">Quest Board is Empty</h3>
                    <p className="text-muted-foreground">Check for new bounties and missions.</p>
                    <Button onClick={() => handleGenerateQuests()} disabled={isGeneratingQuests}>
                        {isGeneratingQuests ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Fetch Available Quests
                    </Button>
                </div>
            )
        }
        return (
            <div className="space-y-6">
                 {dailyQuests.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center gap-2">
                                <Calendar className="text-primary"/>
                                Daily Quests
                            </CardTitle>
                            <CardDescription>These high-reward missions reset every 24 hours.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {dailyQuests.map(quest => <QuestCard key={quest.title} quest={quest} type="daily" />)}
                        </CardContent>
                    </Card>
                )}

                {bounties.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center gap-2">
                                <Target className="text-primary"/>
                                Bounties
                            </CardTitle>
                            <CardDescription>Hunt down wanted criminals for substantial rewards.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {bounties.map(quest => <QuestCard key={quest.title} quest={quest} type="bounty" />)}
                        </CardContent>
                    </Card>
                )}
                
                {otherQuests.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center gap-2">
                                <ScrollText className="text-primary"/>
                                Available Quests
                            </CardTitle>
                            <CardDescription>Embark on adventures across the galaxy.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {otherQuests.map(quest => <QuestCard key={quest.title} quest={quest} type="quest" />)}
                        </CardContent>
                    </Card>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-headline text-slate-200 tracking-wider">Mission Control</h2>
                {hasQuests && (
                    <Button onClick={() => handleGenerateQuests()} disabled={isGeneratingQuests}>
                        {isGeneratingQuests ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Refresh Quests
                    </Button>
                )}
            </div>
            {renderContent()}
        </div>
    )
}
