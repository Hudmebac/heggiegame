
'use client';

import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Scale, Users, Award, Coins, ArrowRight, Hourglass, Loader2, FileText, Handshake, Search, BookUser } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { DiplomaticMission } from '@/lib/types';

const riskColorMap = {
    'Low': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Critical': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const missionTypeIcons: Record<DiplomaticMission['missionType'], React.ElementType> = {
    'Treaty': Handshake,
    'Mediation': Scale,
    'Investigation': Search,
}

const influenceTiers = [
    { level: 'Intern', min: 0, max: 99, color: 'from-gray-500 to-gray-400' },
    { level: 'Attaché', min: 100, max: 249, color: 'from-sky-500 to-sky-400' },
    { level: 'Emissary', min: 250, max: 499, color: 'from-blue-500 to-blue-400' },
    { level: 'Diplomat', min: 500, max: 999, color: 'from-indigo-500 to-indigo-400' },
    { level: 'Ambassador', min: 1000, max: Infinity, color: 'from-purple-500 to-purple-400' },
];

function getInfluenceTier(score: number) {
    for (const tier of influenceTiers) {
        if (score >= tier.min && score <= tier.max) {
            return tier;
        }
    }
    return influenceTiers[influenceTiers.length - 1];
}

export default function OfficialPage() {
    const { gameState, handleGenerateDiplomaticMissions, handleAcceptDiplomaticMission, isGeneratingMissions } = useGame();

    if (!gameState) return null;

    const { playerStats } = gameState;
    const { diplomaticMissions = [], influence = 0 } = playerStats;

    const availableMissions = diplomaticMissions.filter(m => m.status === 'Available');
    const activeMission = diplomaticMissions.find(m => m.status === 'Active');

    const tier = getInfluenceTier(influence);
    const progressInTier = tier ? (tier.max === Infinity ? 100 : ((influence - tier.min) / (tier.max - tier.min)) * 100) : 0;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Scale className="text-primary" />
                        Office of the Galactic Official
                    </CardTitle>
                    <CardDescription>
                        Manage diplomatic relations, negotiate treaties, and expand your influence across the galaxy. Your decisions will shape the future.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4 text-lg">
                        <div className="flex items-center gap-2">
                            <Award className="text-primary"/>
                            <span className="font-bold">{influence}</span>
                            <span className="text-sm text-muted-foreground">Influence</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="text-primary"/>
                            <span className="font-bold">{playerStats.reputation.toFixed(0)}</span>
                             <span className="text-sm text-muted-foreground">Reputation</span>
                        </div>
                    </div>
                    <Button onClick={handleGenerateDiplomaticMissions} disabled={isGeneratingMissions}>
                        {isGeneratingMissions ? <Loader2 className="mr-2 animate-spin" /> : <FileText className="mr-2" />}
                        Request New Mandates
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <Award className="text-primary" />
                        Diplomatic Standing
                    </CardTitle>
                    <CardDescription>Your current title and progress towards the next rank.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Current Rank</span>
                        <span className={`font-mono font-bold text-primary`}>{tier?.level}</span>
                    </div>
                    <div>
                        <Progress value={progressInTier} className="h-2 [&>div]:bg-gradient-to-r" indicatorClassName={tier?.color} />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{tier?.min}</span>
                            <span>{tier?.level}</span>
                            <span>{tier?.max === Infinity ? 'Max' : tier?.max}</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center pt-2">Gain influence by successfully completing Diplomatic Mandates.</p>
                </CardContent>
            </Card>

            {activeMission && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2"><Hourglass className="text-primary"/> Active Mandate</CardTitle>
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
                                    <BookUser className="h-4 w-4 text-muted-foreground" />
                                    <span>Stakeholders: {activeMission.stakeholders.join(', ')}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Progress value={activeMission.progress || 0} />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Negotiations in progress...</span>
                                        <span>Influence: <span className="font-mono text-primary">{activeMission.payoutInfluence}</span> / Credits: <span className="font-mono text-amber-300">{activeMission.payoutCredits.toLocaleString()}¢</span></span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><FileText className="text-primary"/> Available Mandates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isGeneratingMissions && availableMissions.length === 0 ? (
                        <div className="text-center text-muted-foreground p-8">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                            <p>Awaiting encrypted transmission from the Galactic Council...</p>
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
                                        <BookUser className="h-4 w-4 text-muted-foreground" />
                                        <span>Stakeholders: {mission.stakeholders.join(', ')}</span>
                                     </div>
                                </CardHeader>
                                <CardContent className="flex justify-between items-center">
                                    <div className="text-sm space-y-1">
                                        <p className="flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Influence: <span className="font-mono">{mission.payoutInfluence}</span></p>
                                        <p className="flex items-center gap-2"><Coins className="h-4 w-4 text-amber-300" /> Stipend: <span className="font-mono text-amber-300">{mission.payoutCredits.toLocaleString()}¢</span></p>
                                        <p className="flex items-center gap-2 text-muted-foreground"><Hourglass className="h-4 w-4" /> Duration: {mission.duration}s</p>
                                    </div>
                                    <Button onClick={() => handleAcceptDiplomaticMission(mission.id)} disabled={!!activeMission}>Accept Mandate</Button>
                                </CardContent>
                            </Card>
                        )})
                    ) : (
                        <p className="text-center text-muted-foreground p-8">No mandates currently available. Please request new directives.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

    