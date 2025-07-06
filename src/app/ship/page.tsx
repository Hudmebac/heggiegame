'use client';

import { useGame } from "@/app/components/game-provider";
import ShipManagement from "../components/ship-management";

export default function ShipPage() {
    const { gameState } = useGame();
    if (!gameState) return null;

    return (
        <ShipManagement stats={gameState.playerStats} currentSystem={gameState.currentSystem} />
    )
}
