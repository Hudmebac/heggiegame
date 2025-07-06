
'use client'

import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

interface RecreationValueChartProps {
  valueHistory: number[];
}

export default function RecreationValueChart({ valueHistory }: RecreationValueChartProps) {
  const chartData = valueHistory.map((value, index) => ({
    time: index + 1,
    value: value
  })) || [];

  const chartConfig = {
    value: {
      label: "Market Value",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  return (
      <CardContent className="p-0">
        {chartData.length > 1 ? (
          <ChartContainer config={chartConfig} className="h-[150px] w-full">
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
          <div className="h-[150px] flex items-center justify-center text-muted-foreground text-sm">
            Not enough data to display chart. Travel to other systems to see value changes.
          </div>
        )}
      </CardContent>
  );
}
