
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck } from "lucide-react";

export default function HaulerPage() {
  return (
    <div className="flex items-center justify-center h-full">
        <Card className="max-w-xl text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                    <Truck className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl pt-4">Hauler Career</CardTitle>
                <CardDescription>This career page is under construction. Check back soon for logistics management, route negotiations, and fleet upgrades!</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Your journey as a master of logistics has just begun.</p>
            </CardContent>
        </Card>
    </div>
  );
}
