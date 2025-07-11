
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollText, Hourglass, Star, Filter } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format, formatRelative, subDays } from 'date-fns';
import type { GameEventType, GameEvent } from "@/lib/types";
import ReputationChart from "@/app/components/reputation-chart";
import HistorySummary from '@/app/components/history-summary';
import AssetOverviewChart from '@/app/components/asset-overview-chart';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGame } from '@/app/components/game-provider';
import { EventIconMap } from '@/lib/events';
import { CAREER_DATA } from '@/lib/careers';
import CashFlowChart from '@/app/components/cash-flow-chart';

const groupEventsByDay = (events: GameEvent[]) => {
    return events.reduce((acc, event) => {
        const dateKey = format(new Date(event.timestamp), 'yyyy-MM-dd');
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(event);
        return acc;
    }, {} as Record<string, GameEvent[]>);
};

export default function HistoryEventsPage() {
    const { gameState } = useGame();
    const [timeRange, setTimeRange] = useState('all');
    const [eventType, setEventType] = useState<GameEventType | 'all'>('all');

    if (!gameState) {
        return null;
    }

    const ALL_EVENTS = gameState.playerStats.events || [];
    const careerData = CAREER_DATA.find(c => c.id === gameState.playerStats.career);
    const startingNetWorth = careerData?.startingNetWorth || 50000;

    const filteredEvents = ALL_EVENTS.filter(event => {
        const eventDate = new Date(event.timestamp);
        let dateCondition = true;
        if (timeRange === '7d') {
            dateCondition = eventDate > subDays(new Date(), 7);
        } else if (timeRange === '30d') {
            dateCondition = eventDate > subDays(new Date(), 30);
        }

        const typeCondition = eventType === 'all' || event.type === eventType;

        return dateCondition && typeCondition;
    });

    const sortedEvents = filteredEvents.sort((a, b) => b.timestamp - a.timestamp);
    const groupedEvents = groupEventsByDay(sortedEvents);
    const today = new Date();

    const getRelativeDate = (date: string) => {
        try {
            const d = new Date(date);
            return formatRelative(d, today);
        } catch (error) {
            return date;
        }
    }

    const eventTypes: Array<'all' | GameEventType> = ['all', 'Trade', 'Combat', 'Upgrade', 'Mission', 'System', 'Career', 'Faction', 'Purchase'];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <ScrollText className="text-primary" />
                        Captain’s Journey Log
                    </CardTitle>
                    <CardDescription>
                        A chronological record of your accomplishments, trades, and significant events throughout your career.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-background/50 border">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-semibold">Filters:</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant={timeRange === '7d' ? 'default' : 'outline'} onClick={() => setTimeRange('7d')}>Last 7 Days</Button>
                            <Button variant={timeRange === '30d' ? 'default' : 'outline'} onClick={() => setTimeRange('30d')}>Last 30 Days</Button>
                            <Button variant={timeRange === 'all' ? 'default' : 'outline'} onClick={() => setTimeRange('all')}>All Time</Button>
                        </div>
                        <Select value={eventType} onValueChange={(value) => setEventType(value as any)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by event type" />
                            </SelectTrigger>
                            <SelectContent>
                                {eventTypes.map(type => (
                                    <SelectItem key={type} value={type} className="capitalize">{type === 'all' ? 'All Event Types' : type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <HistorySummary 
                events={ALL_EVENTS} 
                initialNetWorth={startingNetWorth} 
                currentNetWorth={gameState.playerStats.netWorth}
            />

            <div className="grid grid-cols-1 gap-6">
                <AssetOverviewChart assetHistory={gameState.playerStats.assetHistory || []} />
                <CashFlowChart cashHistory={gameState.playerStats.cashInHandHistory || []} initialCash={startingNetWorth} />
                <ReputationChart events={ALL_EVENTS} initialReputation={0} />
            </div>

            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Event Log</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    {Object.keys(groupedEvents).length > 0 ? (
                        <Accordion type="single" collapsible defaultValue={Object.keys(groupedEvents)[0]}>
                            {Object.entries(groupedEvents).map(([date, events]) => (
                                <AccordionItem key={date} value={date}>
                                    <AccordionTrigger>
                                        <div className="text-left">
                                            <p className="font-semibold">{format(new Date(date), 'MMMM do, yyyy')}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{getRelativeDate(date)}</p>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="pl-4 border-l-2 border-primary/20 space-y-4">
                                            {events.map(event => {
                                                const Icon = EventIconMap[event.type];
                                                return (
                                                <div key={event.id} className="flex items-start gap-3">
                                                    <Icon className="h-5 w-5 text-primary/80 mt-1 flex-shrink-0"/>
                                                    <div>
                                                        <p className="text-sm">{event.description}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>{format(new Date(event.timestamp), 'HH:mm')}</span>
                                                            {event.value !== 0 && (
                                                                <>
                                                                <span>&bull;</span>
                                                                <span className={event.value > 0 ? 'text-green-400' : 'text-destructive'}>
                                                                    {event.value > 0 ? '+' : ''}{event.value.toLocaleString()}¢
                                                                </span>
                                                                </>
                                                            )}
                                                            {(event.reputationChange ?? 0) !== 0 && (
                                                                <>
                                                                <span>&bull;</span>
                                                                <span className={(event.reputationChange ?? 0) > 0 ? 'text-sky-400' : 'text-orange-400'}>
                                                                    {event.reputationChange! > 0 ? '+' : ''}{event.reputationChange} Rep
                                                                </span>
                                                                </>
                                                            )}
                                                            {event.isMilestone && <Star className="h-3 w-3 text-amber-400" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            )})}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                         <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-8">
                            <Hourglass className="h-12 w-12 text-muted-foreground animate-pulse" />
                            <h3 className="mt-4 text-lg font-semibold">No Events Found</h3>
                            <p className="mt-1 text-muted-foreground text-sm">
                                Your journey is just beginning, or no events match your current filter criteria.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
