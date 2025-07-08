'use client';

import { useState, useEffect } from 'react';

const CooldownTimer = ({ expiry }: { expiry: number }) => {
    const [remaining, setRemaining] = useState(expiry - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            const newRemaining = Math.max(0, expiry - Date.now());
            setRemaining(newRemaining);
        }, 1000);
        return () => clearInterval(interval);
    }, [expiry]);

    if (remaining <= 0) {
        return <span>Ready</span>;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (days > 0) return <span>{days}d {hours}h</span>;
    if (hours > 0) return <span>{hours}h {minutes}m</span>;

    return <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>;
};

export default CooldownTimer;
