
'use client';

import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck, Coins, ArrowRight, Hourglass, Loader2, FileText, Anchor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function DefencePage() {
    const { gameState, handleGenerateEscortMissions, handleAcceptEscortMission, isGeneratingMissions } = useGame();

    if (!gameState) return null;

    const { playerStats } = gameState;
    const { escortMissions = [] } = playerStats;

    const availableMissions = escortMissions.filter(m => m.status === 'Available');
    const activeMissions = escortMissions.filter(m => m.status === 'Active');

    const riskColorMap = {
        'Low': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    
    const missionTypeIcons: Record<string, React.ElementType> = {
        'VIP Escort': ShieldCheck,
        'Cargo Convoy': Anchor,
        'Data Runner': FileText,
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Shield className="text-primary" />
                        Aegis Command
                    </CardTitle>
                    <CardDescription>
                        As a Defender, your duty is to protect the spacelanes. Accept high-stakes escort missions to earn credits and bolster galactic security.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGenerateEscortMissions} disabled={isGeneratingMissions}>
                        {isGeneratingMissions ? <Loader2 className="mr-2 animate-spin" /> : <FileText className="mr-2" />}
                        Scan for Escort Contracts
                    </Button>
                </CardContent>
            </Card>

            {activeMissions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2"><Hourglass className="text-primary"/> Active Escorts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeMissions.map(mission => {
                            const Icon = missionTypeIcons[mission.missionType];
                            return (
                            <Card key={mission.id} className="bg-card/50">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                          <CardTitle className="text-base flex items-center gap-2"><Icon className="text-primary/80"/> {mission.clientName}</CardTitle>
                                          <CardDescription className="text-xs">{mission.description}</CardDescription>
                                        </div>
                                        <Badge variant="outline" className={riskColorMap[mission.riskLevel]}>{mission.riskLevel} Risk</Badge>
                                    </div>
                                    <div className="text-sm font-semibold flex items-center gap-2 pt-1">
                                        <span>{mission.fromSystem}</span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        <span>{mission.toSystem}</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Progress value={mission.progress || 0} />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>En route...</span>
                                            <span>Payout: <span className="font-mono text-amber-300">{mission.payout.toLocaleString()}¢</span></span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )})}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><FileText className="text-primary"/> Available Contracts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isGeneratingMissions && availableMissions.length === 0 ? (
                        <div className="text-center text-muted-foreground p-8">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                            <p>Scanning security channels for contracts...</p>
                        </div>
                    ) : availableMissions.length > 0 ? (
                        availableMissions.map(mission => {
                            const Icon = missionTypeIcons[mission.missionType];
                            return (
                            <Card key={mission.id} className="bg-card/50">
                                <CardHeader>
                                     <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base flex items-center gap-2"><Icon className="text-primary/80"/> {mission.clientName}</CardTitle>
                                            <CardDescription className="text-xs">{mission.description}</CardDescription>
                                        </div>
                                        <Badge variant="outline" className={riskColorMap[mission.riskLevel]}>{mission.riskLevel} Risk</Badge>
                                    </div>
                                    <div className="text-sm font-semibold flex items-center gap-2 pt-1">
                                        <span>{mission.fromSystem}</span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        <span>{mission.toSystem}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex justify-between items-center">
                                    <div className="text-sm space-y-1">
                                        <p className="flex items-center gap-2"><Coins className="h-4 w-4 text-amber-300" /> Payout: <span className="font-mono text-amber-300">{mission.payout.toLocaleString()}¢</span></p>
                                        <p className="flex items-center gap-2 text-muted-foreground"><Hourglass className="h-4 w-4" /> Duration: {mission.duration}s</p>
                                    </div>
                                    <Button onClick={() => handleAcceptEscortMission(mission.id)}>Accept Contract</Button>
                                </CardContent>
                            </Card>
                        )})
                    ) : (
                        <p className="text-center text-muted-foreground p-8">No escort contracts available. Try scanning for new ones.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
