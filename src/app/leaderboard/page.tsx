'use client'
import Leaderboard from "@/app/components/leaderboard";
import { useGame } from "@/app/components/game-provider";
import { useState } from "react";
import { runBioGeneration } from "@/app/actions";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { LeaderboardEntry } from "@/lib/types";


export default function LeaderboardPage() {
    const { gameState } = useGame();
    const { toast } = useToast();
    const [selectedTrader, setSelectedTrader] = useState<LeaderboardEntry | null>(null);
    const [traderBio, setTraderBio] = useState('');
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);

    if (!gameState) return null;

    const handleTraderClick = async (trader: LeaderboardEntry) => {
        if (trader.trader === gameState.playerStats.name) return; // Don't generate bio for the player
        setSelectedTrader(trader);
        setTraderBio('');
        setIsGeneratingBio(true);

        try {
            const result = await runBioGeneration({ name: trader.trader });
            setTraderBio(result.bio);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Could not fetch intel",
                description: "Failed to generate a bio for this trader."
            });
            setSelectedTrader(null); // Close dialog on error
        } finally {
            setIsGeneratingBio(false);
        }
    };

    const leaderboardWithPlayer = gameState.leaderboard.map(entry => 
        entry.trader === 'You' || entry.trader === gameState.playerStats.name 
            ? { ...entry, netWorth: gameState.playerStats.netWorth, trader: gameState.playerStats.name, fleetSize: gameState.playerStats.fleetSize } 
            : entry
    ).sort((a, b) => b.netWorth - a.netWorth).map((entry, index) => ({...entry, rank: index + 1}));

    return (
        <>
            <Leaderboard 
                data={leaderboardWithPlayer} 
                playerName={gameState.playerStats.name}
                onTraderClick={handleTraderClick}
            />
            <AlertDialog open={!!selectedTrader} onOpenChange={() => setSelectedTrader(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Intel on {selectedTrader?.trader}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {isGeneratingBio ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <span className="ml-4">Accessing network...</span>
                                </div>
                            ) : (
                                traderBio || "No bio available."
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setSelectedTrader(null)}>Close</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
