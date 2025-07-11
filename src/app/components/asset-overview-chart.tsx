

'use client'

import { useState } from 'react';
import type { AssetSnapshot } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Coins, LandPlot, Ship, Package, Landmark, CandlestickChart } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AssetOverviewChartProps {
  assetHistory: AssetSnapshot[];
}

const chartConfig = {
    totalNetWorth: { label: "Total Net Worth", color: "hsl(var(--primary))", icon: TrendingUp },
    cash: { label: "Cash on Hand", color: "hsl(var(--chart-1))", icon: Coins },
    bankBalance: { label: "Bank Balance", color: "hsl(var(--chart-2))", icon: Landmark },
    fleetValue: { label: "Fleet Value", color: "hsl(var(--chart-3))", icon: Ship },
    cargoValue: { label: "Cargo Value", color: "hsl(var(--chart-4))", icon: Package },
    realEstateValue: { label: "Real Estate Value", color: "hsl(var(--chart-5))", icon: LandPlot },
    sharePortfolioValue: { label: "Share Portfolio", color: "hsl(var(--chart-2))", icon: CandlestickChart },
} satisfies ChartConfig;

type ActiveKeys = keyof typeof chartConfig;

export default function AssetOverviewChart({ assetHistory }: AssetOverviewChartProps) {
    const [activeKeys, setActiveKeys] = useState<ActiveKeys[]>(['sharePortfolioValue']);
    
    const chartData = assetHistory.map(snapshot => ({
        ...snapshot,
        date: format(new Date(snapshot.timestamp), 'MMM d, HH:mm'),
    }));

    if (chartData.length < 2) {
        return (
            <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><TrendingUp className="text-primary"/> Asset Overview</CardTitle>
                    <CardDescription>A comprehensive look at your financial portfolio over time.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Not enough data to display chart. Complete some actions to track your progress.
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2"><TrendingUp className="text-primary"/> Asset Overview</CardTitle>
                <CardDescription>A comprehensive look at your financial portfolio over time. Click legends to toggle visibility.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ChartContainer config={chartConfig}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={{stroke: 'hsl(var(--muted-foreground))'}} />
                            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `¢${Number(value).toLocaleString(undefined, {notation: 'compact'})}`} />
                            <ChartTooltip
                                cursor={{stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: "3 3"}}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            {(Object.keys(chartConfig) as ActiveKeys[]).map(key => (
                                activeKeys.includes(key) &&
                                <defs key={key}>
                                    <linearGradient id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartConfig[key].color} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={chartConfig[key].color} stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                            ))}
                             {(Object.keys(chartConfig) as ActiveKeys[]).map(key => (
                                activeKeys.includes(key) &&
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={chartConfig[key].color}
                                    fillOpacity={0.4}
                                    fill={`url(#color-${key})`}
                                    strokeWidth={2}
                                    name={chartConfig[key].label as string}
                                    dot={false}
                                />
                            ))}
                             <Legend content={({ payload }) => {
                                return (
                                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                                    {payload?.map((entry) => {
                                    const key = entry.dataKey as ActiveKeys;
                                    const isActive = activeKeys.includes(key);
                                    const Icon = chartConfig[key].icon;
                                    return (
                                        <Button
                                            key={entry.value}
                                            variant="ghost"
                                            size="sm"
                                            className={cn("text-xs h-auto px-2 py-1", isActive ? "text-foreground" : "text-muted-foreground")}
                                            onClick={() => {
                                                setActiveKeys(prev => 
                                                    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                                                )
                                            }}
                                        >
                                            <Icon className={cn("mr-2 h-4 w-4")} style={{ color: entry.color }}/>
                                            {entry.value}
                                        </Button>
                                    );
                                    })}
                                </div>
                                );
                            }} />
                        </AreaChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}
