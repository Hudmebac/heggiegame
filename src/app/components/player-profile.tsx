'use client';

import type { PlayerStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface PlayerProfileProps {
  stats: PlayerStats;
  onGenerateAvatar: () => void;
  isGeneratingAvatar: boolean;
}

export default function PlayerProfile({ stats, onGenerateAvatar, isGeneratingAvatar }: PlayerProfileProps) {
  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-headline">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round text-primary"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
            Captain's Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
            <div className="relative h-24 w-24 rounded-full border-2 border-primary/50 overflow-hidden shadow-lg">
                <Image 
                    src={stats.avatarUrl} 
                    alt="Player Avatar"
                    data-ai-hint="space captain"
                    width={96}
                    height={96}
                    className="object-cover"
                />
            </div>
            <Button onClick={onGenerateAvatar} disabled={isGeneratingAvatar} size="sm" variant="outline">
                {isGeneratingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate New Avatar
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
