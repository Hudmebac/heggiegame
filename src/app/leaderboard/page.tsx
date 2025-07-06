'use client'
import Leaderboard from "@/app/components/leaderboard";
import { useGame } from "@/app/components/game-provider";

export default function LeaderboardPage() {
    const { gameState } = useGame();

    if (!gameState) return null;

    const leaderboardWithPlayer = gameState.leaderboard.map(entry => 
        entry.trader === 'You' || entry.trader === gameState.playerStats.name 
            ? { ...entry, netWorth: gameState.playerStats.netWorth, trader: gameState.playerStats.name, fleetSize: gameState.playerStats.fleetSize } 
            : entry
    ).sort((a, b) => b.netWorth - a.netWorth).map((entry, index) => ({...entry, rank: index + 1}));

    return (
        <Leaderboard data={leaderboardWithPlayer} playerName={gameState.playerStats.name} />
    )
}
