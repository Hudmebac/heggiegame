'use client'

import * as React from 'react';
import type { Planet } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Orbit, Rocket } from 'lucide-react';

const PlanetNode = ({ planet, isCurrent, onClick, x, y }: { planet: Planet, isCurrent: boolean, onClick: () => void, x: number, y: number }) => {
    const nodeColor = isCurrent ? "fill-primary stroke-primary/50" : "fill-sky-400 stroke-sky-400/50 group-hover:fill-primary/50";
    const textColor = isCurrent ? "fill-primary" : "fill-sky-300";

    return (
        <g transform={`translate(${x} ${y})`} className="group" onClick={isCurrent ? undefined : onClick}>
            <circle r="6" className={cn(nodeColor, "transition-colors cursor-pointer")} strokeWidth="1" />
            <text
                x="10"
                y="5"
                className={cn("text-[10px] font-mono", textColor, "group-hover:fill-foreground transition-colors")}
            >
                {planet.name}
            </text>
            {isCurrent && (
                 <foreignObject x="-12" y="-25" width="24" height="24">
                    <Rocket className="h-6 w-6 text-primary animate-bounce" />
                </foreignObject>
            )}
        </g>
    );
};

const Star = () => (
    <g>
        <circle cx="0" cy="0" r="20" fill="url(#star-gradient)" />
        <defs>
            <radialGradient id="star-gradient">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.2" />
            </radialGradient>
        </defs>
    </g>
);

interface PlanetMapProps {
    planets: Planet[];
    currentPlanet: string;
    onPlanetTravel: (planetName: string) => void;
}

export default function PlanetMap({ planets, currentPlanet, onPlanetTravel }: PlanetMapProps) {
    const viewBoxSize = 400;
    const [time, setTime] = React.useState(0);

    React.useEffect(() => {
        let animationFrameId: number;
        const animate = () => {
            setTime(Date.now());
            animationFrameId = requestAnimationFrame(animate);
        };
        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    if (time === 0) {
        // Render a placeholder or null on the server to avoid hydration mismatch
        return (
            <div className="relative w-full h-full min-h-[400px] rounded-lg border border-border/50 bg-black/20 overflow-hidden p-4">
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[400px] rounded-lg border border-border/50 bg-black/20 overflow-hidden p-4">
             <svg width="100%" height="100%" viewBox={`-${viewBoxSize/2} -${viewBoxSize/2} ${viewBoxSize} ${viewBoxSize}`} preserveAspectRatio="xMidYMid meet">
                <TooltipProvider>
                    <Star />
                    {planets.map((planet, index) => {
                        const orbitRadius = 60 + index * 25;
                        const angle = (index / planets.length) * 2 * Math.PI + (time / (20000 + index * 5000));
                        const x = orbitRadius * Math.cos(angle);
                        const y = orbitRadius * Math.sin(angle);

                        return (
                            <g key={planet.name}>
                                <circle cx="0" cy="0" r={orbitRadius} fill="none" stroke="hsl(var(--border))" strokeDasharray="2 2" strokeOpacity="0.5" />
                                <Tooltip delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        <PlanetNode
                                            planet={planet}
                                            isCurrent={planet.name === currentPlanet}
                                            onClick={() => onPlanetTravel(planet.name)}
                                            x={x}
                                            y={y}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-card/90 backdrop-blur-sm border-border/50">
                                        <div className="p-1 space-y-2 text-xs">
                                            <h4 className="font-bold text-primary flex items-center gap-2"><Orbit className="h-4 w-4" /> {planet.name}</h4>
                                            <p className="text-muted-foreground">{planet.type}</p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </g>
                        )
                    })}
                </TooltipProvider>
            </svg>
        </div>
    );
}