
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollText, Hourglass, Star, Coins, Shield, Package, LucideIcon, Rocket, Briefcase, Handshake, Route } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MOCK_EVENTS } from "@/lib/events";
import { format, formatRelative, isSameDay } from 'date-fns';
import { GameEventType, GameEvent } from "@/lib/types";

const EventIconMap: Record<GameEventType, LucideIcon> = {
    Trade: Package,
    Combat: Shield,
    Upgrade: Rocket,
    Mission: Briefcase,
    System: Route,
    Career: Star,
    Faction: Handshake,
};

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
    const sortedEvents = MOCK_EVENTS.sort((a, b) => b.timestamp - a.timestamp);
    const groupedEvents = groupEventsByDay(sortedEvents);
    const today = new Date();

    const getRelativeDate = (date: string) => {
        const d = new Date(date);
        return formatRelative(d, today);
    }

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

            <Card className="bg-card/50">
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
                         <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                            <Hourglass className="h-16 w-16 text-muted-foreground animate-pulse" />
                            <h3 className="mt-4 text-xl font-semibold">Event Logging Initialized</h3>
                            <p className="mt-2 text-muted-foreground">
                                Your journey has just begun. Significant events will be recorded here.
                                <br />
                                Check back soon to visualize your path to becoming a galactic legend.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
