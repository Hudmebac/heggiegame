
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CAREER_DATA } from "@/lib/careers";
import type { LucideIcon } from 'lucide-react';
import { Briefcase, Zap, AlertTriangle, Video, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle as DialogTitleComponent, DialogDescription as DialogDescriptionComponent } from '@/components/ui/dialog';
import type { Career } from '@/lib/types';

const careerAvatars: Record<Career, string> = {
    'Heggie Contractor': '/images/avatars/avatar_09.png',
    'Hauler': '/images/avatars/avatar_03.png',
    'Taxi Pilot': '/images/avatars/avatar_17.png',
    'Landlord': '/images/avatars/avatar_05.png',
    'Trader': '/images/avatars/avatar_23.png',
    'Defender': '/images/avatars/avatar_21.png',
    'Fighter': '/images/avatars/avatar_11.png',
    'Galactic Official': '/images/avatars/avatar_10.png',
    'Unselected': ''
};

const careerVideos: Partial<Record<Career, string>> = {
    'Heggie Contractor': '/videos/heggie_contractor.mp4',
    'Hauler': '/videos/hauler.mp4',
    'Taxi Pilot': '/videos/taxi_pilot.mp4',
    'Landlord': '/videos/landlord.mp4',
    'Trader': '/videos/trader.mp4',
    'Defender': '/videos/defender.mp4',
    'Fighter': '/videos/fighter.mp4',
    'Galactic Official': '/videos/galactic_official.mp4',
};


export default function CareerCodex() {
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2"><Briefcase className="text-primary"/>Career Paths</CardTitle>
                <CardDescription>An overview of the different career paths available to a captain in the HEGGIE universe.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {CAREER_DATA.map(career => {
                    const Icon = career.icon as LucideIcon;
                    const videoSrc = careerVideos[career.id];
                    const posterSrc = careerAvatars[career.id];
                    return (
                        <Dialog key={career.id} onOpenChange={(open) => !open && setSelectedVideo(null)}>
                            <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 font-headline text-lg">
                                        <Icon className="text-primary" />
                                        {career.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs flex-grow">{career.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-xs flex-grow">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-primary/90 flex items-center gap-2">
                                            <Zap className="h-4 w-4"/> Perks
                                        </h4>
                                        <ul className="list-disc list-inside text-muted-foreground">
                                            {career.perks.map((perk, i) => <li key={i}>{perk}</li>)}
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-destructive/90 flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4"/> Risks
                                        </h4>
                                        <ul className="list-disc list-inside text-muted-foreground">
                                            {career.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                                        </ul>
                                    </div>
                                    {videoSrc && posterSrc && (
                                         <div className="pt-2">
                                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                <Video className="h-4 w-4"/> Gameplay Preview
                                            </h4>
                                            <DialogTrigger asChild>
                                                <button onClick={() => setSelectedVideo(videoSrc)} className="w-full aspect-video bg-black rounded-md overflow-hidden border relative group cursor-pointer">
                                                    <Image
                                                        src={posterSrc}
                                                        alt={`${career.name} Gameplay Preview`}
                                                        width={256}
                                                        height={144}
                                                        className="object-cover w-full h-full group-hover:opacity-75 transition-opacity"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                        <PlayCircle className="h-10 w-10 text-white/80 group-hover:scale-110 transition-transform" />
                                                    </div>
                                                </button>
                                            </DialogTrigger>
                                        </div>
                                    )}
                                </CardContent>
                                <DialogContent className="max-w-4xl p-0">
                                     <DialogHeader className="sr-only">
                                        <DialogTitleComponent>Gameplay Preview: {career.name}</DialogTitleComponent>
                                        <DialogDescriptionComponent>A video showcasing the gameplay for the {career.name} career.</DialogDescriptionComponent>
                                    </DialogHeader>
                                    {selectedVideo === videoSrc && (
                                        <video
                                            src={selectedVideo}
                                            width="1920"
                                            height="1080"
                                            className="w-full h-auto aspect-video rounded-lg"
                                            controls
                                            autoPlay
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    )}
                                </DialogContent>
                            </Card>
                        </Dialog>
                    );
                })}
            </CardContent>
        </Card>
    );
}
