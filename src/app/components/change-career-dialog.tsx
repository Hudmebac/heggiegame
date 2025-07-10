
'use client';
import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { CAREER_DATA } from '@/lib/careers';
import type { Career, CareerData } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Coins, Brain, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface ChangeCareerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChangeCareerDialog({ isOpen, onOpenChange }: ChangeCareerDialogProps) {
    const { gameState, handlePayToChangeCareer } = useGame();
    const { toast } = useToast();
    const [view, setView] = useState<'initial' | 'pay' | 'play'>('initial');
    const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

    if (!gameState) return null;

    const { playerStats } = gameState;
    const cost = Math.floor(playerStats.netWorth * 0.25);
    const canAfford = playerStats.netWorth >= cost;
    const availableCareers = CAREER_DATA.filter(c => c.id !== playerStats.career);

    const handleConfirmPay = () => {
        if (selectedCareer) {
            handlePayToChangeCareer(selectedCareer);
            onOpenChange(false);
            setView('initial');
        } else {
            toast({ variant: 'destructive', title: 'No Career Selected', description: 'Please choose a new career path.' });
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setView('initial');
            setSelectedCareer(null);
        }
        onOpenChange(open);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Change Career Path</DialogTitle>
                    <DialogDescription>
                        Rethink your journey. You can switch careers by demonstrating your aptitude in a test or by leveraging your wealth.
                    </DialogDescription>
                </DialogHeader>

                {view === 'initial' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <Button variant="outline" className="h-24 flex-col" onClick={() => setView('play')}>
                            <Brain className="h-6 w-6 mb-2" />
                            Test Your Aptitude
                            <span className="text-xs text-muted-foreground">(Free)</span>
                        </Button>
                         <Button className="h-24 flex-col" onClick={() => setView('pay')}>
                            <Coins className="h-6 w-6 mb-2" />
                            Leverage Your Wealth
                            <span className="text-xs text-primary-foreground/80">({cost.toLocaleString()}¢)</span>
                        </Button>
                    </div>
                )}
                
                {view === 'play' && (
                     <div className="py-4 text-center space-y-4">
                        <p>Complete the Aptitude Test to change your career for free. This will take you to a new simulation.</p>
                        <Link href="/captain/change-career-minigame" passHref>
                            <Button size="lg">Begin Aptitude Test</Button>
                        </Link>
                    </div>
                )}
                
                {view === 'pay' && (
                    <div className="py-4 space-y-4">
                        <p className="text-sm text-center">Select your desired new career path. This will cost 25% of your current net worth ({cost.toLocaleString()}¢).</p>
                        <ScrollArea className="h-72 border rounded-md p-4">
                             <RadioGroup value={selectedCareer || ''} onValueChange={(value) => setSelectedCareer(value as Career)} className="space-y-2">
                                {availableCareers.map((career: CareerData) => {
                                    const Icon = career.icon as LucideIcon;
                                    return (
                                        <Label key={career.id} htmlFor={career.id} className="flex items-center gap-4 p-3 rounded-md border hover:bg-muted/50 cursor-pointer">
                                            <RadioGroupItem value={career.id} id={career.id} />
                                            <Icon className="h-5 w-5 text-primary" />
                                            <div>
                                                <p className="font-semibold">{career.name}</p>
                                                <p className="text-xs text-muted-foreground">{career.description}</p>
                                            </div>
                                        </Label>
                                    )
                                })}
                            </RadioGroup>
                        </ScrollArea>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setView('initial')}>Back</Button>
                            <Button onClick={handleConfirmPay} disabled={!selectedCareer || !canAfford}>
                                {!canAfford ? 'Insufficient Funds' : `Confirm for ${cost.toLocaleString()}¢`}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
