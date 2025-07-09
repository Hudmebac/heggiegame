'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGame } from '@/app/components/game-provider';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoadGamePage() {
  const router = useRouter();
  const params = useParams();
  const { loadGameStateFromKey } = useGame();
  const { toast } = useToast();
  const [status, setStatus] = useState('Loading your game state...');

  useEffect(() => {
    const key = params.key as string;
    if (key) {
      const success = loadGameStateFromKey(key);
      if (success) {
        setStatus('Success! Redirecting to your ship...');
        toast({
          title: "Game State Loaded",
          description: "Your progress has been loaded from the link.",
        });
        // Redirect to the main game page after loading
        router.push('/captain');
      } else {
        setStatus('Failed to load game state. The link may be invalid or corrupted. Redirecting...');
        toast({
          variant: "destructive",
          title: "Load Failed",
          description: "The provided game state link is invalid or corrupted.",
        });
        router.push('/');
      }
    }
  }, [params.key, loadGameStateFromKey, router, toast]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center space-y-4">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <h2 className="text-2xl font-headline text-primary">{status}</h2>
    </div>
  );
}
