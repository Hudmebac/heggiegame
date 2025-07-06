'use client';

import { useState } from 'react';
import type { PlayerStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Loader2, User, Bot } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';


interface PlayerProfileProps {
  stats: PlayerStats;
  onGenerateAvatar: (description: string) => void;
  isGeneratingAvatar: boolean;
  onGenerateBio: (name?: string) => void;
  isGeneratingBio: boolean;
  onNameChange: (name: string) => void;
}


export default function PlayerProfile({ stats, onGenerateAvatar, isGeneratingAvatar, onGenerateBio, isGeneratingBio, onNameChange }: PlayerProfileProps) {
  const [avatarPrompt, setAvatarPrompt] = useState('A futuristic space trader pilot, male, with a cybernetic eye');
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(stats.name);
  
  const handleNameSave = () => {
      onNameChange(name);
      onGenerateBio(name);
      setIsEditingName(false);
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
        <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative h-24 w-24 flex-shrink-0 rounded-full border-2 border-primary/50 overflow-hidden shadow-lg mx-auto sm:mx-0">
                <Image
                    src={stats.avatarUrl}
                    alt="Player Avatar"
                    data-ai-hint="space captain"
                    width={96}
                    height={96}
                    className="object-cover"
                />
            </div>
            <div className="w-full space-y-3">
              <div className='space-y-1'>
                <Label htmlFor="avatar-prompt" className="text-xs text-muted-foreground">Avatar Generation Prompt</Label>
                <Input
                    id="avatar-prompt"
                    value={avatarPrompt}
                    onChange={(e) => setAvatarPrompt(e.target.value)}
                    placeholder="e.g., grizzled male space pilot"
                    disabled={isGeneratingAvatar}
                />
              </div>
                <Button onClick={() => onGenerateAvatar(avatarPrompt)} disabled={!avatarPrompt.trim() || isGeneratingAvatar} className="w-full">
                    {isGeneratingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate New Avatar
                </Button>
            </div>
        </div>

        <div className='space-y-1'>
            <Label htmlFor="captain-name" className="text-xs text-muted-foreground">Captain's Name</Label>
            {isEditingName ? (
                <div className="flex gap-2">
                    <Input id="captain-name" value={name} onChange={(e) => setName(e.target.value)} disabled={isGeneratingBio}/>
                    <Button onClick={handleNameSave} disabled={isGeneratingBio}>Save</Button>
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
            <Button onClick={() => onGenerateBio()} disabled={isGeneratingBio} variant="outline" className="w-full">
                {isGeneratingBio ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                Generate New Bio
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
