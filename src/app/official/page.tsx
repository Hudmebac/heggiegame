
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Scale } from "lucide-react";

export default function OfficialPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="max-w-xl text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <Scale className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl pt-4">Galactic Official Career</CardTitle>
          <CardDescription>This career page is under construction. Soon you will navigate the political landscape, manage planetary governance, and forge galactic treaties!</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">The fate of star systems rests on your decisions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
