
'use client';

import { useState } from 'react';
import type { PlayerStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, User, Shuffle, Image as ImageIcon, Check, RefreshCw, Share2, Facebook, Copy } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ShareProgressDialog from './share-progress-dialog';

interface PlayerProfileProps {
  stats: PlayerStats;
  onSetAvatar: (url: string) => void;
  onGenerateBio: (name?: string) => void;
  isGeneratingBio: boolean;
  onNameChange: (name: string) => void;
  onResetGame: () => void;
  onShareToFacebook: () => void;
}

// These paths point to files in the `public` directory.
// The user will need to add these image files to their project.
const predefinedAvatars = [
    '/images/avatars/avatar_01.png',
    '/images/avatars/avatar_02.png',
    '/images/avatars/avatar_03.png',
    '/images/avatars/avatar_04.png',
    '/images/avatars/avatar_05.png',
    '/images/avatars/avatar_06.png',
    '/images/avatars/avatar_07.png',
    '/images/avatars/avatar_08.png',
    '/images/avatars/avatar_09.png',
    '/images/avatars/avatar_10.png',
    '/images/avatars/avatar_11.png',
    '/images/avatars/avatar_12.png',
    '/images/avatars/avatar_13.png',
    '/images/avatars/avatar_14.png',
    '/images/avatars/avatar_15.png',
    '/images/avatars/avatar_16.png',
    '/images/avatars/avatar_17.png',
    '/images/avatars/avatar_18.png',
    '/images/avatars/avatar_19.png',
    '/images/avatars/avatar_20.png',
    '/images/avatars/avatar_21.png',
    '/images/avatars/avatar_22.png',
    '/images/avatars/avatar_23.png',
    '/images/avatars/avatar_24.png',
    '/images/avatars/avatar_25.png',
    '/images/avatars/avatar_26.png',
    '/images/avatars/avatar_27.png',
    '/images/avatars/avatar_28.png',
    '/images/avatars/avatar_29.png',
    '/images/avatars/avatar_30.png',
    '/images/avatars/avatar_31.png',
    '/images/avatars/avatar_32.png',
    '/images/avatars/avatar_33.png',
    '/images/avatars/avatar_34.png',
    '/images/avatars/avatar_35.png',
    '/images/avatars/avatar_36.png',
    '/images/avatars/avatar_37.png',
    '/images/avatars/avatar_38.png',
    '/images/avatars/avatar_39.png',
    '/images/avatars/avatar_40.png',
   ];

export default function PlayerProfile({ stats, onSetAvatar, onGenerateBio, isGeneratingBio, onNameChange, onResetGame, onShareToFacebook }: PlayerProfileProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(stats.name);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isShareConfirmationOpen, setIsShareConfirmationOpen] = useState(false);
  const { toast } = useToast();

  const lastShare = stats.lastFacebookShare || 0;
  const cooldown = 5 * 60 * 1000; // 5 minutes in ms
  const isOnCooldown = (Date.now() - lastShare) < cooldown;
  
  const handleNameSave = () => {
      onNameChange(name);
      setIsEditingName(false);
  }

  const handleRandomAvatar = () => {
    const randomAvatar = predefinedAvatars[Math.floor(Math.random() * predefinedAvatars.length)];
    onSetAvatar(randomAvatar);
    toast({ title: 'Avatar Changed', description: 'A new random avatar has been selected.' });
    setIsAvatarDialogOpen(false);
  }

  const handleCustomUrlSet = () => {
    try {
      new URL(customAvatarUrl);
      onSetAvatar(customAvatarUrl);
      toast({ title: 'Avatar Changed', description: 'Your custom avatar has been set.' });
      setIsAvatarDialogOpen(false);
    } catch (_) {
      toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid image URL.' });
    }
  }

  const shareQuote = `I am playing HEGGIE: Space Game! My Current Net Worth is ${stats.netWorth.toLocaleString()}¢ and my career is ${stats.career}. Come start your own adventure!`;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareQuote);
    toast({ title: "Copied to Clipboard!", description: "You can now paste this message on Facebook." });
  };

  const handleFacebookShareClick = () => {
    onShareToFacebook();
    setIsShareConfirmationOpen(false);
  };

  return (
    <>
      <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-headline">
              <User className="text-primary"/>
              Captain Profile
          </CardTitle>
          <CardDescription>Edit your captain's appearance, name, and biography.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 flex-grow">
          <div className="flex justify-center">
              <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                  <DialogTrigger asChild>
                      <button className="relative h-24 w-24 flex-shrink-0 rounded-full border-2 border-primary/50 overflow-hidden shadow-lg group">
                          <Image
                              key={stats.avatarUrl} 
                              src={stats.avatarUrl}
                              alt="Player Avatar"
                              data-ai-hint="space captain"
                              width={96}
                              height={96}
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <ImageIcon className="h-8 w-8 text-white" />
                          </div>
                      </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                      <DialogHeader>
                          <DialogTitle>Change Avatar</DialogTitle>
                          <DialogDescription>
                              Select a new avatar from the predefined list, choose one randomly, or provide your own URL.
                          </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-6">
                          <div>
                              <Label className="mb-2 block text-sm font-medium">Predefined Avatars</Label>
                              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                  {predefinedAvatars.map((avatarSrc) => (
                                      <button key={avatarSrc} onClick={() => { onSetAvatar(avatarSrc); setIsAvatarDialogOpen(false); }} className="relative aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary focus:outline-none transition-colors">
                                          <Image src={avatarSrc} alt="Predefined avatar" layout="fill" className="object-cover" />
                                          {stats.avatarUrl === avatarSrc && (
                                              <div className="absolute inset-0 bg-primary/70 flex items-center justify-center">
                                                  <Check className="h-6 w-6 text-primary-foreground" />
                                              </div>
                                          )}
                                      </button>
                                  ))}
                              </div>
                          </div>
                          <div className="flex items-center gap-4">
                              <Button onClick={handleRandomAvatar} variant="outline" className="w-full">
                                  <Shuffle className="mr-2" /> Random Avatar
                              </Button>
                          </div>
                          <div>
                              <Label htmlFor="custom-avatar-url" className="mb-2 block text-sm font-medium">Or use custom URL</Label>
                              <div className="flex gap-2">
                                  <Input
                                      id="custom-avatar-url"
                                      placeholder="https://..."
                                      value={customAvatarUrl}
                                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                                  />
                                  <Button onClick={handleCustomUrlSet}>Set</Button>
                              </div>
                          </div>
                      </div>
                      <DialogFooter>
                          <DialogClose asChild>
                              <Button type="button" variant="secondary">Cancel</Button>
                          </DialogClose>
                      </DialogFooter>
                  </DialogContent>
              </Dialog>
          </div>


          <div className='space-y-1'>
              <Label htmlFor="captain-name" className="text-xs text-muted-foreground">Captain's Name</Label>
              {isEditingName ? (
                  <div className="flex gap-2">
                      <Input id="captain-name" value={name} onChange={(e) => setName(e.target.value)} />
                      <Button onClick={handleNameSave}>Save</Button>
                  </div>
              ) : (
                  <div className="flex items-center justify-between">
                      <p className="text-lg font-headline">{stats.name}</p>
                      <Button variant="outline" size="sm" onClick={() => setIsEditingName(true)}>Edit</Button>
                  </div>
              )}
          </div>
          
           <div className='space-y-1'>
              <Label htmlFor="captain-bio" className="text-xs text-muted-foreground">Biography</Label>
              <Textarea id="captain-bio" value={stats.bio} readOnly className="h-24 bg-background/30" />
              <Button onClick={() => onGenerateBio()} variant="outline" className="w-full" disabled={isGeneratingBio}>
                  {isGeneratingBio ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shuffle className="mr-2 h-4 w-4" />}
                  Randomize Bio
              </Button>
          </div>
        </CardContent>
        <CardFooter className="p-6 mt-auto border-t border-border/50 grid grid-cols-1 gap-2">
             <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => setIsShareDialogOpen(true)}>
                    <Share2 className="mr-2" /> Sync & Share
                </Button>
                
                 <Dialog open={isShareConfirmationOpen} onOpenChange={setIsShareConfirmationOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={isOnCooldown}>
                            <Facebook className="mr-2" />
                            {isOnCooldown ? 'On Cooldown' : 'Share for 1M Tokens'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Share Your Progress</DialogTitle>
                            <DialogDescription>
                                Share your journey on Facebook to receive 1,000,000 tokens! The share window will open, but if the message doesn't appear automatically, you can copy it from here.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Label htmlFor="share-message">Your Share Message</Label>
                            <Textarea id="share-message" readOnly value={shareQuote} className="h-28" />
                            <Button onClick={handleCopyToClipboard} variant="outline" className="w-full">
                                <Copy className="mr-2" /> Copy Message
                            </Button>
                        </div>
                        <DialogFooter>
                             <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleFacebookShareClick}>
                                <Facebook className="mr-2" /> Continue to Facebook
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

             </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" /> Start Over
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. All of your progress, including your net worth, ships, upgrades, and business ventures will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onResetGame}>
                            Yes, Start a New Game
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
      <ShareProgressDialog isOpen={isShareDialogOpen} onOpenChange={setIsShareDialogOpen} />
    </>
  );
}
