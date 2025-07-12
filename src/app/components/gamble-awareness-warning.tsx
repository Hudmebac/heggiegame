'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { STRAPLINES } from '@/lib/straplines';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

const SHOW_DELAY = 300000; // 5 minutes
const HIDE_DELAY = 5000;   // 5 seconds

export default function GambleAwarenessWarning() {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const showTimer = setTimeout(() => {
            const randomMessage = STRAPLINES[Math.floor(Math.random() * STRAPLINES.length)];
            setMessage(randomMessage);
            setIsVisible(true);

            const hideTimer = setTimeout(() => {
                setIsVisible(false);
            }, HIDE_DELAY);

            // Cleanup for the hide timer
            return () => clearTimeout(hideTimer);
        }, SHOW_DELAY);

        // Cleanup for the show timer
        return () => clearTimeout(showTimer);
    }, []);

    return (
        <div className={cn(
            "fixed bottom-4 right-4 z-50 transition-all duration-500 ease-in-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-yellow-400 text-black shadow-lg max-w-md">
                <Image 
                    src="/images/misc/take-time-to-think.png"
                    alt="Take time to think"
                    width={80}
                    height={80}
                    className="flex-shrink-0"
                />
                <p className="font-semibold">{message}</p>
            </div>
        </div>
    );
}
