
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sword } from "lucide-react";

export default function MilitaryPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="max-w-xl text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <Sword className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl pt-4">Fighter Career</CardTitle>
          <CardDescription>This career page is under construction. Prepare to accept high-command strike missions, execute planetary raids, and climb the military tech tree!</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Your blade will write the history of this conflict.</p>
        </CardContent>
      </Card>
    </div>
  );
}
