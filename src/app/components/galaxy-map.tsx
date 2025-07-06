import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Map } from 'lucide-react';
import Image from 'next/image';

export default function GalaxyMap() {
  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-lg flex items-center gap-2">
          <Map className="text-primary"/>
          Galaxy Map
        </CardTitle>
        <CardDescription>Navigate the stars. Fuel costs apply.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <div className="relative w-full h-full min-h-[150px] rounded-lg overflow-hidden border border-border/50">
            <Image 
                src="https://placehold.co/600x400/0A192F/111827.png" 
                alt="Galaxy Map"
                data-ai-hint="galaxy stars"
                layout="fill"
                objectFit="cover"
                className="opacity-30"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground font-mono">[Interactive Map Coming Soon]</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
