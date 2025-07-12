

'use client'

import { useState } from 'react';
import type { AssetSnapshot } from '@/lib/types';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Coins, LandPlot, Ship, Package, Landmark, CandlestickChart, List } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCompactNumber } from '@/lib/utils';

interface AssetOverviewChartProps {
  assetHistory: AssetSnapshot[];
}

const chartConfig = {
    totalNetWorth: { label: "Net Worth", color: "hsl(var(--primary))", icon: TrendingUp },
    cash: { label: "Cash", color: "hsl(48 96% 50%)", icon: Coins }, // Yellow
    bankBalance: { label: "Bank", color: "hsl(142 76% 36%)", icon: Landmark }, // Green
    fleetValue: { label: "Fleet", color: "hsl(262 80% 58%)", icon: Ship }, // Purple
    cargoValue: { label: "Cargo", color: "hsl(24 94% 51%)", icon: Package }, // Orange
    realEstateValue: { label: "Real Estate", color: "hsl(350 82% 61%)", icon: LandPlot }, // Pink/Rose
    sharePortfolioValue: { label: "Shares", color: "hsl(180 82% 61%)", icon: CandlestickChart }, // Cyan
} satisfies ChartConfig;

type ActiveKeys = keyof typeof chartConfig;

export default function AssetOverviewChart({ assetHistory }: AssetOverviewChartProps) {
    const [activeKeys, setActiveKeys] = useState<ActiveKeys[]>(['totalNetWorth']);
    const allKeys = Object.keys(chartConfig) as ActiveKeys[];

    const toggleAll = () => {
        if (activeKeys.length === allKeys.length) {
            setActiveKeys(['totalNetWorth']);
        } else {
            setActiveKeys(allKeys);
        }
    };
    
    const chartData = assetHistory.map(snapshot => ({
        ...snapshot,
        date: format(new Date(snapshot.timestamp), 'MMM d, HH:mm'),
    }));

    if (chartData.length < 2) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm p-4">
                Not enough data to display chart. Complete some actions to track your progress.
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow h-[350px] w-full">
                <ChartContainer config={chartConfig}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                            {(Object.keys(chartConfig) as ActiveKeys[]).map(key => (
                                <linearGradient key={key} id={`color-full-${key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartConfig[key].color} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={chartConfig[key].color} stopOpacity={0.1}/>
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                        <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} axisLine={{stroke: 'hsl(var(--muted-foreground))'}} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(value) => `¢${formatCompactNumber(Number(value))}`} />
                        <ChartTooltip
                            cursor={{stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: "3 3"}}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                         {(Object.keys(chartConfig) as ActiveKeys[]).map(key => (
                            activeKeys.includes(key) &&
                            <Area
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={chartConfig[key].color}
                                fillOpacity={0.4}
                                fill={`url(#color-full-${key})`}
                                strokeWidth={2}
                                name={chartConfig[key].label as string}
                                dot={false}
                                activeDot={{ r: 4, fill: chartConfig[key].color, stroke: 'hsl(var(--background))' }}
                            />
                        ))}
                    </AreaChart>
                </ChartContainer>
            </div>
             <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 mt-4">
                 <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto px-2 py-1"
                    onClick={toggleAll}
                >
                    <List className="mr-2 h-4 w-4"/>
                    Toggle All
                </Button>
                {allKeys.map((key) => {
                    const isActive = activeKeys.includes(key);
                    const Icon = chartConfig[key].icon;
                    return (
                        <Button
                            key={key}
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "text-xs h-auto px-2 py-1 rounded-md transition-all",
                                isActive ? "bg-muted text-foreground ring-1 ring-inset ring-border" : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => {
                                setActiveKeys(prev => 
                                    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                                )
                            }}
                        >
                            <Icon className="mr-2 h-4 w-4" style={{ color: chartConfig[key].color }}/>
                            {chartConfig[key].label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
