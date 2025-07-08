
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CandlestickChart } from "lucide-react";

export default function TraderPage() {
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="max-w-xl text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <CandlestickChart className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl pt-4">Trader Career</CardTitle>
                <CardDescription>This career page is under construction. Get ready for advanced market analytics, warehouse management, and trade route forecasting tools!</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">The market never sleeps, and neither should your ambition.</p>
            </CardContent>
        </Card>
    </div>
  );
}
