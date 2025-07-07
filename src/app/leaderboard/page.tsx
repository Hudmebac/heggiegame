
'use client'
import Leaderboard from "@/app/components/leaderboard";
import { useGame } from "@/app/components/game-provider";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { LeaderboardEntry } from "@/lib/types";
import { bios } from "@/lib/bios";


export default function LeaderboardPage() {
    const { gameState, updateTraderBio } = useGame();
    const { toast } = useToast();
    const [selectedTrader, setSelectedTrader] = useState<LeaderboardEntry | null>(null);
    const [traderBio, setTraderBio] = useState('');

    if (!gameState) return null;

    const handleTraderClick = (trader: LeaderboardEntry) => {
        if (trader.trader === gameState.playerStats.name) return;
        setSelectedTrader(trader);
        setTraderBio('');

        if (trader.bio) {
            setTraderBio(trader.bio);
        } else {
            const randomBioTemplate = bios[Math.floor(Math.random() * bios.length)];
            const newBio = randomBioTemplate.replace(/{Captain}/g, trader.trader);
            setTraderBio(newBio);
            updateTraderBio(trader.trader, newBio);
        }
    };

    const leaderboardWithPlayer = gameState.leaderboard.map(entry => 
        entry.trader === 'You' || entry.trader === gameState.playerStats.name 
            ? { ...entry, netWorth: gameState.playerStats.netWorth, trader: gameState.playerStats.name, fleetSize: gameState.playerStats.fleet.length } 
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
                            {traderBio || "No bio available."}
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
