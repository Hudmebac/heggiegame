
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building } from "lucide-react";

export default function LandlordPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="max-w-xl text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <Building className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl pt-4">Landlord Career</CardTitle>
          <CardDescription>This career page is under construction. Prepare to manage your properties, engage in bidding wars, and upgrade your real estate empire across the galaxy!</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Your galactic real estate empire awaits.</p>
        </CardContent>
      </Card>
    </div>
  );
}
