

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollText, Hourglass, Star, Filter, LucideIcon, Briefcase, LandPlot, Package, Rocket, Handshake, Route, ShoppingCart, Shield } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format, formatRelative, subDays, startOfDay, startOfHour } from 'date-fns';
import type { GameEventType, GameEvent } from "@/lib/types";
import ReputationChart from "@/app/components/reputation-chart";
import HistorySummary from '@/app/components/history-summary';
import AssetOverviewChart from '@/app/components/asset-overview-chart';
import { Button } from '@/components/ui/button';
import { useGame } from '@/app/components/game-provider';
import { EventIconMap } from '@/lib/events';
import { CAREER_DATA } from '@/lib/careers';
import CashFlowChart from '@/app/components/cash-flow-chart';
import CargoValueChart from '@/app/components/cargo-value-chart';

const groupEvents = (events: GameEvent[]) => {
    return events.reduce((acc, event) => {
        const dateKey = format(startOfDay(new Date(event.timestamp)), 'yyyy-MM-dd');
        const hourKey = format(startOfHour(new Date(event.timestamp)), 'yyyy-MM-dd HH:00');

        if (!acc[dateKey]) {
            acc[dateKey] = { date: startOfDay(new Date(event.timestamp)), hours: {} };
        }
        if (!acc[dateKey].hours[hourKey]) {
            acc[dateKey].hours[hourKey] = [];
        }
        acc[dateKey].hours[hourKey].push(event);
        return acc;
    }, {} as Record<string, { date: Date; hours: Record<string, GameEvent[]> }>);
};


const filterCategories: { title: string; filters: { type: GameEventType | 'all'; label: string; icon: LucideIcon }[] }[] = [
    {
        title: 'General',
        filters: [
            { type: 'all', label: 'All', icon: Filter },
            { type: 'Career', label: 'Career', icon: Star },
            { type: 'Faction', label: 'Faction', icon: Handshake },
            { type: 'System', label: 'System', icon: Route },
        ]
    },
    {
        title: 'Financial',
        filters: [
            { type: 'Trade', label: 'Trade', icon: Package },
            { type: 'Purchase', label: 'Purchases', icon: ShoppingCart },
            { type: 'Lease', label: 'Leases', icon: LandPlot },
        ]
    },
    {
        title: 'Operations',
        filters: [
            { type: 'Mission', label: 'Missions', icon: Briefcase },
            { type: 'Upgrade', label: 'Upgrades', icon: Rocket },
            { type: 'Combat', label: 'Combat', icon: Shield },
        ]
    }
];

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
    const groupedEvents = groupEvents(sortedEvents);
    const today = new Date();

    const getRelativeDate = (date: string | Date) => {
        try {
            const d = new Date(date);
            return formatRelative(d, today);
        } catch (error) {
            return String(date);
        }
    }

    const dateKeys = Object.keys(groupedEvents).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

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
            </Card>

            <HistorySummary 
                events={ALL_EVENTS} 
                initialNetWorth={startingNetWorth} 
                currentNetWorth={gameState.playerStats.netWorth}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <AssetOverviewChart assetHistory={gameState.playerStats.assetHistory || []} />
                <CashFlowChart cashHistory={gameState.playerStats.cashInHandHistory || []} initialCash={startingNetWorth} />
                <ReputationChart events={ALL_EVENTS} initialReputation={0} />
                <CargoValueChart valueHistory={gameState.playerStats.cargoValueHistory || []} />
            </div>

            <Card className="bg-card/50">
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Event Log Filters</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-4">
                     <div className="flex flex-col gap-4 p-4 rounded-lg bg-background/50 border">
                        <div className="flex flex-wrap items-center gap-2">
                             <h4 className="text-sm font-semibold text-muted-foreground mr-2">Time Range:</h4>
                            <Button variant={timeRange === '7d' ? 'secondary' : 'outline'} size="sm" onClick={() => setTimeRange('7d')}>Last 7 Days</Button>
                            <Button variant={timeRange === '30d' ? 'secondary' : 'outline'} size="sm" onClick={() => setTimeRange('30d')}>Last 30 Days</Button>
                            <Button variant={timeRange === 'all' ? 'secondary' : 'outline'} size="sm" onClick={() => setTimeRange('all')}>All Time</Button>
                        </div>
                        {filterCategories.map(category => (
                            <div key={category.title} className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-semibold text-muted-foreground mr-2 w-20">{category.title}:</h4>
                                {category.filters.map(filter => {
                                    const Icon = filter.icon;
                                    return (
                                        <Button key={filter.type} variant={eventType === filter.type ? 'secondary' : 'outline'} size="sm" onClick={() => setEventType(filter.type)}>
                                            <Icon className="h-4 w-4 mr-2" />
                                            {filter.label}
                                        </Button>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                    {dateKeys.length > 0 ? (
                        <Accordion type="single" collapsible defaultValue={dateKeys[0]}>
                            {dateKeys.map(dateKey => {
                                const day = groupedEvents[dateKey];
                                const hourKeys = Object.keys(day.hours).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
                                return (
                                <AccordionItem key={dateKey} value={dateKey} className='border-b'>
                                    <AccordionTrigger>
                                        <div className="text-left">
                                            <p className="font-semibold">{format(day.date, 'MMMM do, yyyy')}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{getRelativeDate(day.date)}</p>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="pl-4 border-l-2 border-primary/20 space-y-4">
                                            {hourKeys.map(hourKey => (
                                                <div key={hourKey} className="ml-4 pl-4 border-l-2 border-border/50">
                                                    <h4 className="text-xs font-semibold text-muted-foreground -ml-4 pl-1 pb-2">{format(new Date(hourKey), 'p')}</h4>
                                                     {day.hours[hourKey].map(event => {
                                                        const Icon = EventIconMap[event.type];
                                                        return (
                                                            <div key={event.id} className="flex items-start gap-3 mb-4">
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
                                                        )
                                                     })}
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )})}
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
