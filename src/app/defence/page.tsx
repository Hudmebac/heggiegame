
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function DefencePage() {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="max-w-xl text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl pt-4">Defender Career</CardTitle>
          <CardDescription>This career page is under construction. Soon you will be able to manage planetary defense networks, accept escort missions, and upgrade your security fleet!</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Stand tall as the guardian of the trade lanes.</p>
        </CardContent>
      </Card>
    </div>
  );
}
