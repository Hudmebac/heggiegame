
'use client'

import type { GameEvent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Handshake } from 'lucide-react';
import { format } from 'date-fns';

interface ReputationChartProps {
  events: GameEvent[];
  initialReputation: number;
}

export default function ReputationChart({ events, initialReputation }: ReputationChartProps) {
    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
    
    let currentReputation = initialReputation;
    const chartData = sortedEvents.map(event => {
        currentReputation += event.reputationChange || 0;
        return {
            date: format(new Date(event.timestamp), 'MMM d'),
            reputation: currentReputation,
            label: `${event.description} (${event.reputationChange || 0} Rep)`
        }
    });

    const chartConfig = {
        reputation: {
            label: "Reputation",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig

    return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Handshake className="text-primary"/>
                    Reputation History
                </CardTitle>
                <CardDescription>Your standing in the galaxy over time.</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length > 1 ? (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRep" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                        <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={{stroke: 'hsl(var(--muted-foreground))'}} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <ChartTooltip
                            cursor={{stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: "3 3"}}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                    <div className="p-2 rounded-lg border bg-background/90 backdrop-blur-sm text-xs shadow-md">
                                        <p className="font-bold text-primary">{payload[0].payload.date}</p>
                                        <p>Reputation: <span className="font-mono">{payload[0].value?.toLocaleString()}</span></p>
                                        <p className="text-muted-foreground mt-1 max-w-xs">{payload[0].payload.label}</p>
                                    </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area type="monotone" dataKey="reputation" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRep)" />
                    </AreaChart>
                </ChartContainer>
                ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    Not enough data to display reputation chart.
                </div>
                )}
            </CardContent>
        </Card>
    );
}
