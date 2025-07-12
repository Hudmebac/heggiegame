
'use client';

import { useState, useCallback } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Scale, Users, Award, Coins, ArrowRight, Hourglass, Loader2, FileText, Handshake, Search, BookUser, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { DiplomaticMission, Staff } from '@/lib/types';
import { AVAILABLE_STAFF } from '@/lib/staff';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CooldownTimer from '@/app/components/cooldown-timer';

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

const HireStaffDialog = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const { gameState, handleHireStaff } = useGame();
    if (!gameState) return null;
    
    const hiredIds = new Set(gameState.playerStats.staff.map(s => s.id));
    const availableStaff = AVAILABLE_STAFF.filter(s => !hiredIds.has(s.id));

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Recruit Diplomatic Staff</DialogTitle>
                    <DialogDescription>Hire attachés and envoys to undertake missions on your behalf.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                    {availableStaff.length > 0 ? availableStaff.map(staff => (
                        <Card key={staff.id}>
                            <CardHeader>
                                <CardTitle className="text-base">{staff.name}</CardTitle>
                                <CardDescription>{staff.role}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-semibold">Success Rate</p>
                                    <p className="text-muted-foreground">{(staff.successRate * 100).toFixed(0)}%</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Hiring Fee</p>
                                    <p className="text-muted-foreground">{staff.hiringFee.toLocaleString()}¢</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Salary</p>
                                    <p className="text-muted-foreground">{staff.salary.toLocaleString()}¢ / cycle</p>
                                </div>
                                 <div className="flex items-end justify-end">
                                    <Button onClick={() => handleHireStaff(staff.id)} disabled={gameState.playerStats.netWorth < staff.hiringFee}>
                                        Hire
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )) : <p className="text-center text-muted-foreground p-4">No staff available for recruitment at this time.</p>}
                </div>
            </DialogContent>
        </Dialog>
    )
}

const AssignStaffDialog = ({ isOpen, onOpenChange, mission, onAssign }: { isOpen: boolean, onOpenChange: (open: boolean) => void, mission: DiplomaticMission | null, onAssign: (missionId: string, staffId: string) => void }) => {
    const { gameState } = useGame();
    const [selectedStaffId, setSelectedStaffId] = useState<string>('');

    if (!mission || !gameState) return null;

    const activeMissionStaffIds = new Set(gameState.playerStats.diplomaticMissions.filter(m => m.status === 'Active').map(m => m.assignedStaffId));
    const availableStaff = gameState.playerStats.staff.filter(s => !activeMissionStaffIds.has(s.id));
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Staff to Mandate</DialogTitle>
                    <DialogDescription>Select an available staff member to handle "{mission.title}". Their skill will influence the outcome.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Select onValueChange={setSelectedStaffId} value={selectedStaffId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select available staff..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availableStaff.map(staff => (
                                <SelectItem key={staff.id} value={staff.id}>
                                    {staff.name} ({(staff.successRate * 100).toFixed(0)}% success)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={() => onAssign(mission.id, selectedStaffId)} disabled={!selectedStaffId}>Assign Staff</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function OfficialPage() {
    const { gameState, handleGenerateDiplomaticMissions, handleAcceptDiplomaticMission, handleFireStaff } = useGame();
    const [isHiringOpen, setIsHiringOpen] = useState(false);
    const [assignMission, setAssignMission] = useState<DiplomaticMission | null>(null);

    if (!gameState) return null;

    const { playerStats } = gameState;
    const { diplomaticMissions = [], influence = 0, staff = [] } = playerStats;

    const availableMissions = diplomaticMissions.filter(m => m.status === 'Available');
    const activeMissions = diplomaticMissions.filter(m => m.status === 'Active');
    
    const hasAvailableStaff = staff.length > activeMissions.length;
    
    const maxStaff = 1 + Math.floor(playerStats.influence / 250);
    const canHireMoreStaff = staff.length < maxStaff;

    const cooldown = 60 * 1000; // 60 seconds
    const lastGeneration = playerStats.lastDiplomaticMissionGeneration || 0;
    const isCooldownActive = Date.now() < lastGeneration + cooldown;
    const cooldownExpiry = lastGeneration + cooldown;

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
                            <span className="font-bold">{staff.length} / {maxStaff}</span>
                             <span className="text-sm text-muted-foreground">Staff</span>
                        </div>
                    </div>
                    <Button onClick={handleGenerateDiplomaticMissions} disabled={gameState.isGeneratingMissions || isCooldownActive || !hasAvailableStaff}>
                        {gameState.isGeneratingMissions ? <Loader2 className="mr-2 animate-spin" /> : <FileText className="mr-2" />}
                         {isCooldownActive ? <CooldownTimer expiry={cooldownExpiry} /> : 'Request New Mandates'}
                    </Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                            <Users className="text-primary"/>
                            Your Staff
                        </CardTitle>
                        <CardDescription>Your hired diplomatic corps. Manage your team and recruit new talent.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {staff.length > 0 ? staff.map(s => {
                            const isAssigned = activeMissions.some(m => m.assignedStaffId === s.id);
                            return (
                                <div key={s.id} className="flex justify-between items-center p-2 bg-card/50 rounded-md">
                                    <div>
                                        <p className="font-semibold text-sm">{s.name}</p>
                                        <p className="text-xs text-muted-foreground">{s.role} - {(s.successRate * 100).toFixed(0)}% Success</p>
                                    </div>
                                    <Badge variant="outline">{isAssigned ? 'On Mission' : 'Available'}</Badge>
                                </div>
                            )
                        }) : <p className="text-sm text-muted-foreground text-center">No staff hired.</p>}
                         <Button className="w-full mt-2" onClick={() => setIsHiringOpen(true)} disabled={!canHireMoreStaff}>
                            <UserPlus className="mr-2"/> {canHireMoreStaff ? 'Recruit New Staff' : 'Staff Limit Reached'}
                        </Button>
                    </CardContent>
                </Card>
            </div>


            {activeMissions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2"><Hourglass className="text-primary"/> Active Mandates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeMissions.map(mission => {
                            const Icon = missionTypeIcons[mission.missionType];
                            const assignedStaff = staff.find(s => s.id === mission.assignedStaffId);
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
                                        <span>Assigned: {assignedStaff?.name || 'Unknown'}</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Progress value={mission.progress || 0} />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Negotiations in progress...</span>
                                            <span>Influence: <span className="font-mono text-primary">{mission.payoutInfluence}</span> / Credits: <span className="font-mono text-amber-300">{mission.payoutCredits.toLocaleString()}¢</span></span>
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
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><FileText className="text-primary"/> Available Mandates</CardTitle>
                    {!hasAvailableStaff && <CardDescription className="text-amber-400">All staff are currently assigned. You must have available staff to accept new mandates.</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                    {gameState.isGeneratingMissions && availableMissions.length === 0 ? (
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
                                    <Button onClick={() => setAssignMission(mission)} disabled={!hasAvailableStaff}>Accept Mandate</Button>
                                </CardContent>
                            </Card>
                        )})
                    ) : (
                        <p className="text-center text-muted-foreground p-8">No mandates currently available. Please request new directives.</p>
                    )}
                </CardContent>
            </Card>

            <HireStaffDialog isOpen={isHiringOpen} onOpenChange={setIsHiringOpen} />
            <AssignStaffDialog 
                isOpen={!!assignMission} 
                onOpenChange={() => setAssignMission(null)} 
                mission={assignMission}
                onAssign={(missionId, staffId) => {
                    handleAcceptDiplomaticMission(missionId, staffId);
                    setAssignMission(null);
                }}
            />
        </div>
    );
}
