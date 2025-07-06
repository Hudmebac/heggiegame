'use client'

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Map, MapPin, AlertTriangle, ShieldCheck, Factory, Wheat, Cpu, Hammer, Recycle } from 'lucide-react';
import type { System, Route } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

const SystemNode = ({ system, isCurrent = false, onClick }: { system: System, isCurrent?: boolean, onClick: () => void }) => (
    <g transform={`translate(${system.x} ${system.y})`} className="group" onClick={isCurrent ? undefined : onClick}>
        <circle r="4" className={isCurrent ? "fill-primary stroke-primary/50" : "fill-muted-foreground/50 stroke-muted-foreground/30 group-hover:fill-primary/50 transition-colors cursor-pointer"} strokeWidth="1" />
        <text
            x="8"
            y="4"
            className="text-[8px] font-mono fill-muted-foreground group-hover:fill-foreground transition-colors"
        >
            {system.name}
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

const securityConfig = {
    'High': { color: 'text-green-400', icon: <ShieldCheck className="h-4 w-4"/> },
    'Medium': { color: 'text-yellow-400', icon: <ShieldCheck className="h-4 w-4"/> },
    'Low': { color: 'text-orange-400', icon: <AlertTriangle className="h-4 w-4"/> },
    'Anarchy': { color: 'text-destructive', icon: <AlertTriangle className="h-4 w-4"/> },
};

const economyIcons: Record<System['economy'], React.ReactNode> = {
    'Industrial': <Factory className="h-4 w-4"/>,
    'Agricultural': <Wheat className="h-4 w-4"/>,
    'High-Tech': <Cpu className="h-4 w-4"/>,
    'Extraction': <Hammer className="h-4 w-4"/>,
    'Refinery': <Recycle className="h-4 w-4"/>,
};

export default function GalaxyMap({ systems, routes, currentSystem, onTravel }: GalaxyMapProps) {
    return (
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <Map className="text-primary"/>
                    Galaxy Map
                </CardTitle>
                <CardDescription>Current Sector: {currentSystem} System. Hover over a system for details, click to travel.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center p-4">
                <div className="relative w-full h-full min-h-[200px] rounded-lg border border-border/50 bg-black/20 overflow-hidden">
                    <StarField />
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="relative">
                        <TooltipProvider>
                            {routes.map((route, i) => {
                                const fromSystem = systems.find(s => s.name === route.from);
                                const toSystem = systems.find(s => s.name === route.to);
                                if (!fromSystem || !toSystem) return null;
                                return <TradeRoute key={i} x1={fromSystem.x} y1={fromSystem.y} x2={toSystem.x} y2={toSystem.y} />
                            })}

                            {systems.map(system => (
                                <Tooltip key={system.name} delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        <SystemNode 
                                            system={system}
                                            isCurrent={system.name === currentSystem} 
                                            onClick={() => onTravel(system.name)}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-card/90 backdrop-blur-sm border-border/50">
                                        <div className="p-1 space-y-2 text-xs">
                                            <h4 className="font-bold text-primary">{system.name}</h4>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-muted-foreground">Security</span>
                                                <span className={`font-mono flex items-center gap-1 ${securityConfig[system.security].color}`}>
                                                    {securityConfig[system.security].icon}
                                                    {system.security}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-muted-foreground">Economy</span>
                                                <span className="font-mono flex items-center gap-1 text-primary">
                                                    {economyIcons[system.economy]}
                                                    {system.economy}
                                                </span>
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </TooltipProvider>
                    </svg>
                </div>
            </CardContent>
        </Card>
    );
}
