'use client'

import type { PriceHistory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface MarketChartProps {
  priceHistory: PriceHistory;
  items: string[];
  selectedItem: string;
  onSelectItem: (item: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function MarketChart({ 
  priceHistory, 
  items, 
  selectedItem, 
  onSelectItem,
  categories,
  selectedCategory,
  onSelectCategory
}: MarketChartProps) {
  const chartData = priceHistory[selectedItem]?.map((price, index) => ({
    time: index + 1,
    price: price
  })) || [];

  const chartConfig = {
    price: {
      label: selectedItem,
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <LineChartIcon className="text-primary" />
                    Market Trends
                </CardTitle>
                <CardDescription>Price history for selected commodity.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Select onValueChange={onSelectCategory} value={selectedCategory}>
                  <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={onSelectItem} value={selectedItem || ''} disabled={items.length === 0}>
                  <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="Select Item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map(item => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 1 ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={{ stroke: 'hsl(var(--muted-foreground))' }} axisLine={{stroke: 'hsl(var(--muted-foreground))'}} label={{ value: 'Time', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}/>
              <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={{ stroke: 'hsl(var(--muted-foreground))' }} axisLine={{stroke: 'hsl(var(--muted-foreground))'}} tickFormatter={(value) => `¢${value}`} />
              <ChartTooltip
                cursor={{stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: "3 3"}}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2, fill: 'hsl(var(--primary))' }} activeDot={{r: 6}} />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            {items.length === 0 ? "No items in this category." : "Not enough data to display chart."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
