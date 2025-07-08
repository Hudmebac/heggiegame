
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CarTaxiFront } from "lucide-react";

export default function TaxiPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="max-w-xl text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <CarTaxiFront className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl pt-4">Taxi Pilot Career</CardTitle>
          <CardDescription>This career page is under construction. Soon you'll be able to manage VIP clients, accept express transport missions, and upgrade your shuttle fleet!</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">The galaxy's elite are waiting for their ride.</p>
        </CardContent>
      </Card>
    </div>
  );
}
