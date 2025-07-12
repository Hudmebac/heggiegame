
'use client'

import { useState } from 'react';
import type { AssetSnapshot } from '@/lib/types';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis } from 'recharts';
import { TrendingUp, Coins, LandPlot, Ship, Package, Landmark, CandlestickChart, List } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AssetOverviewChartProps {
  assetHistory: AssetSnapshot[];
}

const chartConfig = {
    totalNetWorth: { label: "Net Worth", color: "hsl(var(--primary))", icon: TrendingUp },
    cash: { label: "Cash", color: "hsl(48 96% 50%)", icon: Coins },
    bankBalance: { label: "Bank", color: "hsl(142 76% 36%)", icon: Landmark },
    fleetValue: { label: "Fleet", color: "hsl(262 80% 58%)", icon: Ship },
    cargoValue: { label: "Cargo", color: "hsl(24 94% 51%)", icon: Package },
    realEstateValue: { label: "Real Estate", color: "hsl(350 82% 61%)", icon: LandPlot },
    sharePortfolioValue: { label: "Shares", color: "hsl(180 82% 61%)", icon: CandlestickChart },
} satisfies ChartConfig;

type ActiveKeys = keyof typeof chartConfig;

export default function AssetOverviewChartCompact({ assetHistory }: AssetOverviewChartProps) {
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
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Not enough data to display chart.
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            <div className="h-[200px] w-full">
                <ChartContainer config={chartConfig}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            {(Object.keys(chartConfig) as ActiveKeys[]).map(key => (
                                <linearGradient key={key} id={`color-compact-${key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartConfig[key].color} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={chartConfig[key].color} stopOpacity={0.1}/>
                                </linearGradient>
                            ))}
                        </defs>
                        <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value) / 1000000}M`} />
                        <ChartTooltip
                            cursor={{stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: "3 3"}}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                         {(Object.keys(chartConfig) as ActiveKeys[]).map(key => (
                            <Area
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={chartConfig[key].color}
                                fillOpacity={activeKeys.includes(key) ? 0.4 : 0}
                                fill={activeKeys.includes(key) ? `url(#color-compact-${key})` : 'transparent'}
                                strokeWidth={activeKeys.includes(key) ? 2 : 0}
                                name={chartConfig[key].label as string}
                                dot={false}
                                activeDot={{ r: 4, fill: chartConfig[key].color, stroke: 'hsl(var(--background))' }}
                            />
                        ))}
                    </AreaChart>
                </ChartContainer>
            </div>
             <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
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
                                isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => {
                                setActiveKeys(prev => 
                                    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                                )
                            }}
                        >
                            <Icon className="mr-1 h-3 w-3" style={{ color: chartConfig[key].color }}/>
                            {chartConfig[key].label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
