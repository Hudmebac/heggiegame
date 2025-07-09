
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Handshake, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NegotiationMinigameProps {
  onCommit: (score: number) => void;
  triesLeft: number;
  disabled: boolean;
}

export default function NegotiationMinigame({ onCommit, triesLeft, disabled }: NegotiationMinigameProps) {
  const [position, setPosition] = useState(0); // 0 to 100
  const [isPlaying, setIsPlaying] = useState(false);
  const animationFrameId = useRef<number | null>(null);

  const speed = 2; // Adjust for difficulty

  const gameLoop = () => {
    setPosition(prev => (prev + speed) % 200);
    animationFrameId.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying]);

  const handleStart = () => {
    setPosition(0);
    setIsPlaying(true);
  };

  const handleCommit = () => {
    setIsPlaying(false);
    // Score is 100 at the center (position 50 or 150), and 0 at the edges (0 or 100)
    const normalizedPos = position % 100;
    const distance_from_center = Math.abs(50 - normalizedPos);
    const score = Math.max(0, 100 - (distance_from_center * 2));
    onCommit(score);
  };

  const leftPosition = position < 100 ? position : 100;
  const rightPosition = position < 100 ? 0 : position - 100;

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">Stop the negotiators when their hands meet in the middle for the best deal. You have {triesLeft} attempt(s) left.</p>
      
      <div className="relative h-12 w-full bg-muted rounded-lg overflow-hidden border">
        {/* Center Target */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-4 bg-primary/20 z-0"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1 bg-primary z-0"></div>
        
        {/* Left Hand */}
        <div 
            className="absolute top-0 h-full bg-blue-500/70 rounded-r-full flex items-center justify-end px-2"
            style={{ left: 0, width: `${leftPosition}%`}}
        >
            <Handshake className="h-6 w-6 text-white transform -scale-x-100" />
        </div>
        
        {/* Right Hand */}
         <div 
            className="absolute top-0 h-full bg-red-500/70 rounded-l-full flex items-center justify-start px-2"
            style={{ right: 0, width: `${rightPosition}%`}}
        >
            <Handshake className="h-6 w-6 text-white" />
        </div>
      </div>

      {!isPlaying ? (
        <Button onClick={handleStart} disabled={disabled}>
            <Zap className="mr-2"/> Start Negotiation
        </Button>
      ) : (
        <Button onClick={handleCommit}>
            Commit Deal
        </Button>
      )}
    </div>
  );
}
