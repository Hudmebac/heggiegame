
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CAREER_DATA } from "@/lib/careers";
import type { LucideIcon } from 'lucide-react';
import { Briefcase, Zap, AlertTriangle, Video, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export default function CareerCodex() {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    return (
        <Dialog>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Briefcase className="text-primary"/>Career Paths
                    </CardTitle>
                    <CardDescription>
                        An overview of the available career paths. Your choice determines your starting conditions and unlocks unique gameplay opportunities.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {CAREER_DATA.map(career => {
                        const CareerIcon = career.icon as LucideIcon;
                        const videoSrc = `/videos/${career.id.toLowerCase().replace(/ /g, '_')}.mp4`;
                        const posterSrc = `https://placehold.co/1280x720.png`;

                        return (
                            <Card key={career.id} className="bg-card/50 border-border/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 font-headline text-xl text-primary">
                                        <CareerIcon className="h-6 w-6"/>
                                        {career.name}
                                    </CardTitle>
                                    <CardDescription className="italic">
                                        {career.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2 text-green-400">
                                            <Zap className="h-4 w-4"/> Perks
                                        </h4>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            {career.perks.map((perk, i) => <li key={i}>{perk}</li>)}
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2 text-orange-400">
                                            <AlertTriangle className="h-4 w-4"/> Risks
                                        </h4>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            {career.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                                        </ul>
                                    </div>
                                    <div className="space-y-2 lg:col-span-2">
                                        <h4 className="font-semibold flex items-center gap-2 text-sky-400">
                                            <Video className="h-4 w-4"/> Gameplay Preview
                                        </h4>
                                        <DialogTrigger asChild>
                                            <button onClick={() => setSelectedVideo(videoSrc)} className="w-full aspect-video bg-black rounded-md overflow-hidden border relative group cursor-pointer">
                                                <Image
                                                    src={posterSrc}
                                                    alt={`${career.name} gameplay preview`}
                                                    layout="fill"
                                                    objectFit="cover"
                                                    className="group-hover:opacity-70 transition-opacity"
                                                    data-ai-hint="space ship"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                    <PlayCircle className="h-16 w-16 text-white/70 group-hover:text-white group-hover:scale-110 transition-all" />
                                                </div>
                                            </button>
                                        </DialogTrigger>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </CardContent>
            </Card>
            <DialogContent className="max-w-4xl p-0 border-0">
                {selectedVideo && (
                     <video
                        key={selectedVideo}
                        src={selectedVideo}
                        controls
                        autoPlay
                        className="w-full h-full aspect-video rounded-lg"
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
