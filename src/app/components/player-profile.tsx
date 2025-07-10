
'use client';
import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import type { PlayerStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, PenSquare, Share2 } from 'lucide-react';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { AVATARS } from '@/lib/avatars';
import ShareProgressDialog from './share-progress-dialog';

interface PlayerProfileProps {
  stats: PlayerStats;
  onSetAvatar: (url: string) => void;
  onGenerateBio: () => void;
  isGeneratingBio: boolean;
  onNameChange: (name: string) => void;
  onResetGame: () => void;
  onShareToFacebook: () => void;
}

export default function PlayerProfile({ stats, onSetAvatar, onGenerateBio, isGeneratingBio, onNameChange, onResetGame, onShareToFacebook }: PlayerProfileProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(stats.name);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isFBConsentOpen, setIsFBConsentOpen] = useState(false);

  const handleNameSave = () => {
    onNameChange(name);
    setIsEditingName(false);
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    onSetAvatar(avatarUrl);
    setIsAvatarDialogOpen(false);
  };
  
  const fbShareText = `I'm playing HEGGIE - Space Game 🪐 I'm a ${stats.career}, and my net worth’s already a cosmic-sized ${stats.netWorth.toLocaleString()}¢. Think you can top that?\n\n🎮 Start your own adventure now: 🌍 https://heggiegame.netlify.app/captain\n\n💥 Use promo code STARTERBOOST for a boost of 100,000,000¢ — it’s my little gift to you.`;

  return (
    <>
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsAvatarDialogOpen(true)} className="relative group">
                            <Image src={stats.avatarUrl} alt="Player Avatar" width={80} height={80} className="rounded-full border-2 border-primary/50" />
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <PenSquare className="text-white" />
                            </div>
                        </button>
                        <div>
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNameSave()} />
                                    <Button onClick={handleNameSave} size="sm">Save</Button>
                                </div>
                            ) : (
                                <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                                    {stats.name}
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditingName(true)}>
                                        <PenSquare className="h-4 w-4" />
                                    </Button>
                                </CardTitle>
                            )}
                            <CardDescription>Reputation: {stats.reputation.toFixed(0)}</CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-background/50 rounded-lg h-28 overflow-y-auto">
                    <p className="text-sm text-muted-foreground italic">{stats.bio}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={onGenerateBio} disabled={isGeneratingBio}>
                        {isGeneratingBio ? <Loader2 className="animate-spin"/> : <RefreshCw />}
                        New Bio
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <RefreshCw className="mr-2" />
                                Reset Game
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone. This will permanently delete your game progress and start a new game.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onResetGame}>Confirm Reset</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                 <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={() => setIsShareDialogOpen(true)}>
                        <Share2 className="mr-2" /> Sync & Share
                    </Button>
                     <AlertDialog open={isFBConsentOpen} onOpenChange={setIsFBConsentOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700">
                                Share for Tokens
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Share to Facebook</AlertDialogTitle>
                                <AlertDialogDescription>This will open a new tab to share the following message. You will receive 1,000,000 tokens for sharing.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="p-4 bg-muted rounded-md text-sm italic border">
                                {fbShareText}
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onShareToFacebook} className="bg-blue-600 hover:bg-blue-700">Share</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
        <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Select Your Avatar</DialogTitle>
                    <DialogDescription>Choose a new portrait to represent you in the galaxy.</DialogDescription>
                </DialogHeader>
                <Carousel opts={{ align: "start", loop: true }}>
                    <CarouselContent>
                        {AVATARS.map(avatar => (
                            <CarouselItem key={avatar} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
                                <button onClick={() => handleAvatarSelect(avatar)} className="block w-full">
                                    <Image src={avatar} alt="Avatar option" width={128} height={128} className="rounded-lg border-2 border-transparent hover:border-primary transition-all" />
                                </button>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </DialogContent>
        </Dialog>
        <ShareProgressDialog isOpen={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}/>
    </>
  );
}
