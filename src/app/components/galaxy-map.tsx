
'use client'

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Map, MapPin } from 'lucide-react';

// A simple SVG star field background
const StarField = () => {
    const [stars, setStars] = React.useState<{cx: string; cy: string; r: number; opacity: number}[]>([]);
    
    React.useEffect(() => {
        // Generate stars only on the client to avoid hydration mismatch
        const generatedStars = Array.from({ length: 100 }).map(() => ({
            cx: `${Math.random() * 100}%`,
            cy: `${Math.random() * 100}%`,
            r: Math.random() * 0.8 + 0.2,
            opacity: Math.random() * 0.5 + 0.2,
        }));
        setStars(generatedStars);
    }, []);

    if (!stars.length) return null;

    return (
        <svg width="100%" height="100%" className="absolute inset-0">
            <rect width="100%" height="100%" fill="transparent" />
            {stars.map((star, i) => (
                <circle key={i} cx={star.cx} cy={star.cy} r={star.r} fill="hsl(var(--foreground))" opacity={star.opacity} />
            ))}
        </svg>
    );
};

const SystemNode = ({ x, y, name, isCurrent = false }: { x: number, y: number, name: string, isCurrent?: boolean }) => (
    <g transform={`translate(${x} ${y})`} className="group cursor-pointer">
        <circle r="4" className={isCurrent ? "fill-primary stroke-primary/50" : "fill-muted-foreground/50 stroke-muted-foreground/30 group-hover:fill-primary/50 transition-colors"} strokeWidth="1" />
        <text
            x="8"
            y="4"
            className="text-[8px] font-mono fill-muted-foreground group-hover:fill-foreground transition-colors"
        >
            {name}
        </text>
        {isCurrent && (
             <foreignObject x="-10" y="-22" width="20" height="20">
                <MapPin className="h-5 w-5 text-primary animate-bounce" />
            </foreignObject>
        )}
    </g>
);

const TradeRoute = ({ x1, y1, x2, y2 }: { x1: number, y1: number, x2: number, y2: number }) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-border/50" strokeDasharray="2 2" />
);

export default function GalaxyMap() {
    return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Map className="text-primary"/>
                    Galaxy Map
                </CardTitle>
                <CardDescription>Current Sector: Sol System. Travel coming soon.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center p-4">
                <div className="relative w-full h-full min-h-[200px] rounded-lg border border-border/50 bg-black/20 overflow-hidden">
                    <StarField />
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="relative">
                        <TradeRoute x1={20} y1={30} x2={45} y2={65} />
                        <TradeRoute x1={20} y1={30} x2={75} y2={25} />
                        <TradeRoute x1={45} y1={65} x2={80} y2={80} />
                        <TradeRoute x1={75} y1={25} x2={80} y2={80} />

                        <SystemNode x={20} y={30} name="Sol System" isCurrent />
                        <SystemNode x={45} y={65} name="Kepler-186f" />
                        <SystemNode x={75} y={25} name="Sirius" />
                        <SystemNode x={80} y={80} name="Proxima Centauri" />
                    </svg>
                </div>
            </CardContent>
        </Card>
    );
}
