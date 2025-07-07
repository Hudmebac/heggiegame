
'use client';

import { useState } from 'react';
import type { PlayerStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, User, Shuffle, Image as ImageIcon, Check } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface PlayerProfileProps {
  stats: PlayerStats;
  onSetAvatar: (url: string) => void;
  onGenerateBio: (name?: string) => void;
  isGeneratingBio: boolean;
  onNameChange: (name: string) => void;
}

// These paths point to files in the `public` directory.
// The user will need to add these image files to their project.
const predefinedAvatars = [
    '/images/avatars/avatar_01.png',
    '/images/avatars/2.png',
    '/images/avatars/3.png',
    '/images/avatars/4.png',
    '/images/avatars/5.png',
    '/images/avatars/6.png',
    '/images/avatars/7.png',
    '/images/avatars/8.png',
    '/images/avatars/9.png',
    '/images/avatars/10.png',
    '/images/avatars/11.png',
    '/images/avatars/12.png',
    '/images/avatars/13.png',
    '/images/avatars/14.png',
    '/images/avatars/15.png',
    '/images/avatars/16.png',
    '/images/avatars/17.png',
    '/images/avatars/18.png',
    '/images/avatars/19.png',
    '/images/avatars/20.png',
    '/images/avatars/21.png',
    '/images/avatars/22.png',
    '/images/avatars/23.png',
    '/images/avatars/24.png',
    '/images/avatars/25.png',
];

export default function PlayerProfile({ stats, onSetAvatar, onGenerateBio, isGeneratingBio, onNameChange }: PlayerProfileProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(stats.name);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const { toast } = useToast();
  
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

  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-headline">
            <User className="text-primary"/>
            Captain Profile
        </CardTitle>
        <CardDescription>Edit your captain's appearance, name, and biography.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
    </Card>
  );
}
