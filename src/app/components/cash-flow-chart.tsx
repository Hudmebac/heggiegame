
'use client'

import type { GameEvent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Coins } from 'lucide-react';

interface CashFlowChartProps {
  cashHistory: number[];
  initialCash: number;
}

export default function CashFlowChart({ cashHistory, initialCash }: CashFlowChartProps) {
    const chartData = [
        { time: 0, value: initialCash, label: 'Career Start' },
        ...cashHistory.map((value, index) => ({
            time: index + 1,
            value: value,
            label: `Cash on Hand: ${value.toLocaleString()}¢`
        }))
    ];
    
    const chartConfig = {
        value: {
            label: "Cash on Hand",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig

    return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Coins className="text-primary"/>
                    Cash Flow
                </CardTitle>
                <CardDescription>Your liquid assets (cash on hand) over time.</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length > 1 ? (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                        <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={{stroke: 'hsl(var(--muted-foreground))'}} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `¢${Number(value).toLocaleString(undefined, {notation: 'compact'})}`} />
                        <ChartTooltip
                            cursor={{stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: "3 3"}}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                    <div className="p-2 rounded-lg border bg-background/90 backdrop-blur-sm text-xs shadow-md">
                                        <p>Cash: <span className="font-mono">{payload[0].value?.toLocaleString()}¢</span></p>
                                    </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorCash)" />
                    </AreaChart>
                </ChartContainer>
                ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    Not enough data to display cash flow chart.
                </div>
                )}
            </CardContent>
        </Card>
    );
}
