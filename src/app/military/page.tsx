'use client';

import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Sword, Target, Coins, ArrowRight, Hourglass, Loader2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { MilitaryMission } from '@/lib/types';
import AssaultMinigame from '@/app/components/assault-minigame';
import DefenceMinigame from '@/app/components/defence-minigame';

const riskColorMap = {
    'Low': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const missionTypeIcons: Record<MilitaryMission['missionType'], React.ElementType> = {
    'Strike': Target,
    'Raid': Sword,
    'Recon': FileText,
    'Assassination': Target,
}

export default function MilitaryPage() {
    const { gameState, handleGenerateMilitaryMissions, handleAcceptMilitaryMission, isGeneratingMissions } = useGame();

    if (!gameState) return null;

    const { playerStats } = gameState;
    const { militaryMissions = [] } = playerStats;

    const availableMissions = militaryMissions.filter(m => m.status === 'Available');
    const activeMission = militaryMissions.find(m => m.status === 'Active');

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Sword className="text-primary" />
                        Strike Command
                    </CardTitle>
                    <CardDescription>
                        As a Fighter, you execute high-stakes missions for galactic factions. Accept contracts, neutralize targets, and reap the rewards.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGenerateMilitaryMissions} disabled={isGeneratingMissions}>
                        {isGeneratingMissions ? <Loader2 className="mr-2 animate-spin" /> : <FileText className="mr-2" />}
                        Scan for New Directives
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Sword className="text-primary"/>
                        Training Simulators
                    </CardTitle>
                    <CardDescription>Hone your combat skills and earn extra credits.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AssaultMinigame />
                    <DefenceMinigame />
                </CardContent>
            </Card>

            {activeMission && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2"><Hourglass className="text-primary"/> Active Mission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Card className="bg-card/50">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base flex items-center gap-2">{activeMission.title}</CardTitle>
                                        <CardDescription className="text-xs">{activeMission.description}</CardDescription>
                                    </div>
                                    <Badge variant="outline" className={riskColorMap[activeMission.riskLevel]}>{activeMission.riskLevel} Risk</Badge>
                                </div>
                                <div className="text-sm font-semibold flex items-center gap-2 pt-1">
                                    <span>Target: {activeMission.target}</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <span>System: {activeMission.system}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Progress value={activeMission.progress || 0} />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>En route to target...</span>
                                        <span>Payout: <span className="font-mono text-amber-300">{activeMission.payout.toLocaleString()}¢</span></span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><FileText className="text-primary"/> Available Directives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isGeneratingMissions && availableMissions.length === 0 ? (
                        <div className="text-center text-muted-foreground p-8">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                            <p>Scanning military channels for new directives...</p>
                        </div>
                    ) : availableMissions.length > 0 ? (
                        availableMissions.map(mission => {
                            const Icon = missionTypeIcons[mission.missionType];
                            return (
                            <Card key={mission.id} className="bg-card/50">
                                <CardHeader>
                                     <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base flex items-center gap-2"><Icon className="text-primary/80"/> {mission.title}</CardTitle>
                                            <CardDescription className="text-xs">{mission.description}</CardDescription>
                                        </div>
                                        <Badge variant="outline" className={riskColorMap[mission.riskLevel]}>{mission.riskLevel} Risk</Badge>
                                    </div>
                                    <div className="text-sm font-semibold flex items-center gap-2 pt-1">
                                        <span>Target: {mission.target}</span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        <span>System: {mission.system}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex justify-between items-center">
                                    <div className="text-sm space-y-1">
                                        <p className="flex items-center gap-2"><Coins className="h-4 w-4 text-amber-300" /> Payout: <span className="font-mono text-amber-300">{mission.payout.toLocaleString()}¢</span></p>
                                        <p className="flex items-center gap-2 text-muted-foreground"><Hourglass className="h-4 w-4" /> Duration: {mission.duration}s</p>
                                    </div>
                                    <Button onClick={() => handleAcceptMilitaryMission(mission.id)} disabled={!!activeMission}>Accept Directive</Button>
                                </CardContent>
                            </Card>
                        )})
                    ) : (
                        <p className="text-center text-muted-foreground p-8">No directives available. Try scanning for new ones.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
