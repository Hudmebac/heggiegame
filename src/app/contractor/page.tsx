
'use client';

import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clipboard, Star } from 'lucide-react';

export default function ContractorPage() {
    const { gameState } = useGame();

    if (!gameState) return null;

    const { playerStats } = gameState;
    const inspirationProgress = (playerStats.inspiration / 1000) * 100; // Assuming 1000 is the cap for now

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Clipboard className="text-primary" />
                        Heggie Contractor
                    </CardTitle>
                    <CardDescription>
                        “Undecided, born here… still waiting on inspiration.”
                        <br/>
                        A flexible, introspective path for those seeking purpose among the stars.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><Star className="text-primary"/> Inspiration Meter</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Your journey is your own. As a Contractor, you find your calling by experiencing what the galaxy has to offer. Engaging in different career activities—trading, hauling, property management, combat—will fill your Inspiration Meter. Once filled, you may unlock a unique destiny.
                        </p>
                        <Progress value={inspirationProgress} />
                        <div className="text-xs text-muted-foreground mt-1 text-right">{playerStats.inspiration} / 1000 Inspiration</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="p-4 bg-card/50 rounded-lg">
                            <h4 className="font-semibold text-primary/90">Perks</h4>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                                <li>Total freedom to pursue hybrid career routes.</li>
                                <li>Unlocks adaptive quests that react to your playstyle.</li>
                                <li>Increased experience gain from "first-time" actions.</li>
                            </ul>
                        </div>
                         <div className="p-4 bg-card/50 rounded-lg">
                            <h4 className="font-semibold text-destructive/90">Risks</h4>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                                <li>No initial career bonuses or passive income.</li>
                                <li>Limited access to high-tier faction perks.</li>
                                <li>Vulnerable without a specialized focus.</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
