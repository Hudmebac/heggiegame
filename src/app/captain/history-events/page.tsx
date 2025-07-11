
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollText, Hourglass } from "lucide-react";

export default function HistoryEventsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <ScrollText className="text-primary" />
                        Captain’s Journey Log
                    </CardTitle>
                    <CardDescription>
                        A chronological record of your accomplishments, trades, and significant events throughout your career.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-card/50">
                <Hourglass className="h-16 w-16 text-muted-foreground animate-pulse" />
                <h3 className="mt-4 text-xl font-semibold">Event Logging Initialized</h3>
                <p className="mt-2 text-muted-foreground">
                    The full Journey Log, complete with interactive graphs and event filtering, is under construction.
                    <br />
                    Check back soon to visualize your path to becoming a galactic legend.
                </p>
            </Card>
        </div>
    );
}
