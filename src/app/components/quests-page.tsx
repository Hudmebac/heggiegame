
'use client'

import React, { useState, useEffect } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollText, Target, Calendar, RefreshCw, Loader2, ListTodo, Timer, CheckCircle2 } from 'lucide-react';
import type { Quest, ActiveObjective, QuestTask } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const CountdownTimer = ({ startTime, timeLimit }: { startTime: number, timeLimit: number }) => {
    const [remaining, setRemaining] = useState(timeLimit);

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const newRemaining = Math.max(0, timeLimit - elapsed);
            setRemaining(newRemaining);
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime, timeLimit]);

    const minutes = Math.floor(remaining / 60);
    const seconds = Math.floor(remaining % 60);

    return <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>;
};

const QuestCard = ({ quest, onAccept }: { quest: Quest, onAccept: (quest: Quest) => void}) => {
    const isBounty = quest.type === 'Bounty';
    const isObjective = quest.type === 'Objective';
    
    return (
        <Card className={`bg-card/50 ${isBounty ? 'border-destructive/20' : ''}`}>
            <CardHeader>
                <CardTitle className={`text-base ${isBounty ? 'text-destructive' : ''}`}>{quest.title}</CardTitle>
                <CardDescription>{quest.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                <div>
                    <span className="text-amber-400 font-mono">Reward: {quest.reward}</span>
                    <p className="text-xs text-muted-foreground">Difficulty: {quest.difficulty}</p>
                </div>
                <Button variant={isBounty ? 'destructive' : 'default'} disabled={!isObjective} onClick={() => isObjective && onAccept(quest)}>
                    {isObjective ? 'Accept' : 'Unavailable'}
                </Button>
            </CardContent>
        </Card>
    )
}

const ActiveObjectiveCard = ({ objective }: { objective: ActiveObjective }) => {
    return (
        <Card className="bg-card/50 border-primary/20">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base text-primary">{objective.title}</CardTitle>
                        <CardDescription>{objective.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-mono text-primary/80">
                        <Timer className="h-4 w-4" />
                        <CountdownTimer startTime={objective.startTime} timeLimit={objective.timeLimit || 0} />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {objective.tasks?.map((task, index) => {
                    const progress = objective.progress[task.type] || 0;
                    const percentage = (progress / task.target) * 100;
                    return (
                        <div key={index}>
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="text-muted-foreground">{task.description}</span>
                                <span className="font-mono">{progress} / {task.target}</span>
                            </div>
                            <Progress value={percentage} />
                        </div>
                    )
                })}
                <div className="flex justify-between items-center pt-2 mt-2 border-t">
                    <span className="text-amber-400 font-mono">Reward: {objective.reward}</span>
                    <Badge variant="outline" className="border-primary/50 text-primary">In Progress</Badge>
                </div>
            </CardContent>
        </Card>
    );
}

export default function QuestsPage() {
    const { gameState, handleGenerateQuests, isGeneratingQuests, handleAcceptObjective } = useGame();

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

    const { quests, activeObjectives } = gameState;
    const hasQuests = quests && quests.length > 0;
    
    const dailyQuests = quests.filter(q => q.type === 'Daily');
    const bounties = quests.filter(q => q.type === 'Bounty');
    const otherQuests = quests.filter(q => q.type === 'Quest');
    const objectiveQuests = quests.filter(q => q.type === 'Objective');


    const renderContent = () => {
        if (isGeneratingQuests && !hasQuests) {
            return (
                <div className="flex flex-col items-center justify-center text-center space-y-4 h-96">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <p className="text-muted-foreground">Contacting Bounty Network...</p>
                </div>
            )
        }
        if (!hasQuests && activeObjectives.length === 0) {
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
                {activeObjectives.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center gap-2">
                                <CheckCircle2 className="text-primary"/>
                                Active Objectives
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {activeObjectives.map(obj => <ActiveObjectiveCard key={obj.title} objective={obj} />)}
                        </CardContent>
                    </Card>
                )}
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
                            {dailyQuests.map(quest => <QuestCard key={quest.title} quest={quest} onAccept={handleAcceptObjective} />)}
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
                            {bounties.map(quest => <QuestCard key={quest.title} quest={quest} onAccept={handleAcceptObjective} />)}
                        </CardContent>
                    </Card>
                )}

                {objectiveQuests.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg flex items-center gap-2">
                                <Timer className="text-primary"/>
                                Timed Objectives
                            </CardTitle>
                            <CardDescription>Accept these challenges to earn rewards for your operational efficiency.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {objectiveQuests.map(quest => <QuestCard key={quest.title} quest={quest} onAccept={handleAcceptObjective} />)}
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
                            {otherQuests.map(quest => <QuestCard key={quest.title} quest={quest} onAccept={handleAcceptObjective} />)}
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
