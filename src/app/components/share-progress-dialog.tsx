'use client';

import { useState } from 'react';
import { useGame } from './game-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareProgressDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ShareProgressDialog({ isOpen, onOpenChange }: ShareProgressDialogProps) {
    const { generateShareKey } = useGame();
    const { toast } = useToast();
    const [shareUrl, setShareUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = () => {
        setIsLoading(true);
        const key = generateShareKey();
        if (key) {
            const url = `${window.location.origin}/load/${key}`;
            setShareUrl(url);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not generate share link.' });
        }
        setIsLoading(false);
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Copied to Clipboard!', description: 'You can now share this link to sync your progress on another device.' });
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setShareUrl('');
        }
        onOpenChange(open);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sync &amp; Share Progress</DialogTitle>
                    <DialogDescription>
                        Generate a unique link to save your game state and load it on another device. This link contains all your progress.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {!shareUrl ? (
                        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Sync Link'}
                        </Button>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="share-link">Your Unique Sync Link</Label>
                            <div className="flex gap-2">
                                <Input id="share-link" readOnly value={shareUrl} />
                                <Button size="icon" variant="outline" onClick={handleCopyToClipboard}>
                                    <Copy />
                                </Button>
                            </div>
                            <Button asChild variant="secondary" className="w-full">
                                <a href={`mailto:?subject=HEGGIE Game Progress&body=Here is my HEGGIE game sync link: ${encodeURIComponent(shareUrl)}`}>
                                    <Mail className="mr-2" /> Email Link
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
