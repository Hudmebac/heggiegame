
'use client'

import type { GameEvent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface NetWorthChartProps {
  events: GameEvent[];
}

export default function NetWorthChart({ events }: NetWorthChartProps) {
    // We assume a starting net worth for the mock data or fetch from GameState in a real scenario
    const startingNetWorth = 50000;
  
    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);
    
    let currentNetWorth = startingNetWorth;
    const chartData = sortedEvents.map(event => {
        currentNetWorth += event.value;
        return {
            date: format(new Date(event.timestamp), 'MMM d'),
            netWorth: currentNetWorth,
            label: `${event.description} (${event.value > 0 ? '+' : ''}${event.value.toLocaleString()}¢)`
        }
    });

    const chartConfig = {
        netWorth: {
            label: "Net Worth",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig

    return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <TrendingUp className="text-primary"/>
                    Net Worth Trajectory
                </CardTitle>
                <CardDescription>An overview of your financial journey over time.</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length > 1 ? (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={{stroke: 'hsl(var(--muted-foreground))'}} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `¢${Number(value).toLocaleString(undefined, {notation: 'compact'})}`} />
                    <ChartTooltip
                        cursor={{stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: "3 3"}}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                <div className="p-2 rounded-lg border bg-background/90 backdrop-blur-sm text-xs shadow-md">
                                    <p className="font-bold text-primary">{payload[0].payload.date}</p>
                                    <p>Net Worth: <span className="font-mono">{payload[0].value?.toLocaleString()}¢</span></p>
                                    <p className="text-muted-foreground mt-1 max-w-xs">{payload[0].payload.label}</p>
                                </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Line type="monotone" dataKey="netWorth" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{r: 6}} />
                    </LineChart>
                </ChartContainer>
                ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    Not enough data to display chart. Complete some trades or missions to see your progress.
                </div>
                )}
            </CardContent>
        </Card>
    );
}

