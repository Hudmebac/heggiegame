'use client'

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Map, MapPin } from 'lucide-react';
import type { System, Route } from '@/lib/types';

const StarField = () => {
    const [stars, setStars] = React.useState<{cx: string; cy: string; r: number; opacity: number}[]>([]);
    
    React.useEffect(() => {
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

const SystemNode = ({ x, y, name, isCurrent = false, onClick }: { x: number, y: number, name: string, isCurrent?: boolean, onClick: () => void }) => (
    <g transform={`translate(${x} ${y})`} className="group" onClick={isCurrent ? undefined : onClick}>
        <circle r="4" className={isCurrent ? "fill-primary stroke-primary/50" : "fill-muted-foreground/50 stroke-muted-foreground/30 group-hover:fill-primary/50 transition-colors cursor-pointer"} strokeWidth="1" />
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


interface GalaxyMapProps {
    systems: System[];
    routes: Route[];
    currentSystem: string;
    onTravel: (systemName: string) => void;
}

export default function GalaxyMap({ systems, routes, currentSystem, onTravel }: GalaxyMapProps) {
    return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Map className="text-primary"/>
                    Galaxy Map
                </CardTitle>
                <CardDescription>Current Sector: {currentSystem} System. Click a system to travel.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center p-4">
                <div className="relative w-full h-full min-h-[200px] rounded-lg border border-border/50 bg-black/20 overflow-hidden">
                    <StarField />
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="relative">
                        {routes.map((route, i) => {
                            const fromSystem = systems.find(s => s.name === route.from);
                            const toSystem = systems.find(s => s.name === route.to);
                            if (!fromSystem || !toSystem) return null;
                            return <TradeRoute key={i} x1={fromSystem.x} y1={fromSystem.y} x2={toSystem.x} y2={toSystem.y} />
                        })}

                        {systems.map(system => (
                            <SystemNode 
                                key={system.name}
                                x={system.x} 
                                y={system.y} 
                                name={system.name} 
                                isCurrent={system.name === currentSystem} 
                                onClick={() => onTravel(system.name)}
                            />
                        ))}
                    </svg>
                </div>
            </CardContent>
        </Card>
    );
}
