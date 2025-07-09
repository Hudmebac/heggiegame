'use client';

import { Rocket } from 'lucide-react';

export default function WarpingOverlay() {
    return (
        <div className="fixed inset-0 bg-black/90 z-[200] flex flex-col items-center justify-center overflow-hidden backdrop-blur-sm">
            <div className="z-10 text-center text-white">
                <Rocket className="h-24 w-24 mx-auto mb-6 text-primary animate-pulse" />
                <h2 className="text-3xl font-headline text-primary animate-pulse">Engaging Warp Drive...</h2>
                <p className="text-muted-foreground mt-2">Simulating market fluctuations and galactic events...</p>
            </div>
        </div>
    );
}
