'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Package } from 'lucide-react';

interface CargoValueChartProps {
  valueHistory: number[];
}

export default function CargoValueChart({ valueHistory }: CargoValueChartProps) {
  const chartData = valueHistory.map((value, index) => ({
    time: index + 1,
    value: value
  })) || [];

  const chartConfig = {
    value: {
      label: "Cargo Value",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <Package className="text-primary" />
          Cargo Value History
        </CardTitle>
        <CardDescription>The estimated value of all items in your cargo hold over time.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 1 ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={{stroke: 'hsl(var(--muted-foreground))'}} />
              <YAxis domain={['dataMin - 500', 'dataMax + 500']} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `¢${Number(value).toLocaleString(undefined, {notation: 'compact'})}`} />
              <ChartTooltip
                cursor={{stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: "3 3"}}
                content={<ChartTooltipContent indicator="dot" formatter={(value) => `${Number(value).toLocaleString()}¢`} />}
              />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{r: 4}} />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Not enough data to display chart. Buy and sell items to track your cargo value.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
