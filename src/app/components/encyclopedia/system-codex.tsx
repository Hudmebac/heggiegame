'use client';
import { SYSTEMS } from "@/lib/systems";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, ShieldCheck, Factory, Wheat, Cpu, Hammer, Recycle, Globe, Milestone, Bot, Users } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const securityConfig = {
    'High': { color: 'text-green-400', icon: <ShieldCheck className="h-4 w-4"/> },
    'Medium': { color: 'text-yellow-400', icon: <ShieldCheck className="h-4 w-4"/> },
    'Low': { color: 'text-orange-400', icon: <AlertTriangle className="h-4 w-4"/> },
    'Anarchy': { color: 'text-destructive', icon: <AlertTriangle className="h-4 w-4"/> },
};

const economyIcons = {
    'Industrial': <Factory className="h-4 w-4"/>,
    'Agricultural': <Wheat className="h-4 w-4"/>,
    'High-Tech': <Cpu className="h-4 w-4"/>,
    'Extraction': <Hammer className="h-4 w-4"/>,
    'Refinery': <Recycle className="h-4 w-4"/>,
};

const zoneTypeIcons = {
    'Core World': <Globe className="h-4 w-4"/>,
    'Frontier Outpost': <Milestone className="h-4 w-4"/>,
    'Mining Colony': <Hammer className="h-4 w-4"/>,
    'Trade Hub': <Users className="h-4 w-4"/>,
    'Ancient Ruins': <Bot className="h-4 w-4"/>,
    'Corporate Zone': <Milestone className="h-4 w-4"/>,
    'Diplomatic Station': <Milestone className="h-4 w-4"/>,
}

export default function SystemCodex() {
    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Globe className="text-primary"/> The Known Galaxy</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The sector of space currently accessible to HEGGIE traders is a diverse and often dangerous expanse. It comprises heavily controlled Core Worlds, lawless Frontier Outposts, and mysterious Ancient Ruins. Each system operates under its own rules, with unique economic drivers and security levels. A savvy trader learns to navigate not just the star-lanes, but the political and economic currents that flow between these worlds.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Known Star Systems</CardTitle>
                    <CardDescription>An overview of the star systems accessible to traders.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SYSTEMS.map(system => (
                        <div key={system.name} className="border p-4 rounded-lg bg-background/30 flex flex-col gap-4">
                            <div className="space-y-2">
                                <h4 className="font-bold text-base text-primary">{system.name}</h4>
                                <p className="text-sm text-muted-foreground">{system.description}</p>
                            </div>
                            <div className="space-y-3 text-sm">
                               <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1.5">{zoneTypeIcons[system.zoneType]} Zone Type</span>
                                    <Badge variant="outline">{system.zoneType}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1.5">{securityConfig[system.security].icon} Security</span>
                                    <Badge variant="outline" className={securityConfig[system.security].color}>{system.security}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1.5">{economyIcons[system.economy]} Economy</span>
                                    <Badge variant="outline">{system.economy}</Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
