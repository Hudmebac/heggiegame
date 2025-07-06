'use client';

import { useGame } from '@/app/components/game-provider';
import { AVAILABLE_CREW } from '@/lib/crew';
import type { CrewMember } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, UserMinus, DollarSign, Briefcase } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const CrewCard = ({ member, isHired, onHire, onFire, canAfford }: { member: CrewMember, isHired: boolean, onHire: (id: string) => void, onFire: (id: string) => void, canAfford: boolean }) => {
    return (
        <Card className="bg-card/50">
            <CardHeader>
                <CardTitle className="text-base">{member.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" /> {member.role}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{member.description}</p>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Salary</span>
                    <span className="font-mono">{member.salary.toLocaleString()}¢ / cycle</span>
                </div>
                {isHired ? (
                     <Button variant="outline" className="w-full" onClick={() => onFire(member.id)}>
                        <UserMinus className="mr-2" /> Fire Crew Member
                    </Button>
                ) : (
                    <>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Hiring Fee</span>
                        <span className="font-mono">{member.hiringFee.toLocaleString()}¢</span>
                    </div>
                    <Button className="w-full" onClick={() => onHire(member.id)} disabled={!canAfford}>
                        <UserPlus className="mr-2" /> Hire
                    </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default function CrewPage() {
    const { gameState, handleHireCrew, handleFireCrew } = useGame();

    if (!gameState) return null;

    const hiredIds = new Set(gameState.crew.map(c => c.id));
    const availableRecruits = AVAILABLE_CREW.filter(c => !hiredIds.has(c.id));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-headline text-slate-200 tracking-wider">Crew Management</h2>
                <p className="text-muted-foreground">Hire specialists to enhance your ship's capabilities.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Users className="text-primary"/>
                        Your Crew
                    </CardTitle>
                    <CardDescription>The specialists currently serving on your ship.</CardDescription>
                </CardHeader>
                <CardContent>
                    {gameState.crew.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {gameState.crew.map(member => (
                                <CrewCard key={member.id} member={member} isHired={true} onFire={handleFireCrew} onHire={() => {}} canAfford={true} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Your crew roster is empty. Hire some specialists to improve your odds.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <UserPlus className="text-primary"/>
                        Available for Hire
                    </CardTitle>
                    <CardDescription>Specialists looking for work at this starport.</CardDescription>
                </CardHeader>
                <CardContent>
                    {availableRecruits.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableRecruits.map(member => (
                                <CrewCard key={member.id} member={member} isHired={false} onHire={handleHireCrew} onFire={() => {}} canAfford={gameState.playerStats.netWorth >= member.hiringFee} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No other specialists available for hire at this time.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
