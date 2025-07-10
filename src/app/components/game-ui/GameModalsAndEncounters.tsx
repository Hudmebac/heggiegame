
'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import PirateEncounter from '../pirate-encounter';
import { useGame } from '@/app/components/game-provider';
import { Loader2, AlertTriangle, ShieldCheck, Factory, Wheat, Cpu, Hammer, Recycle } from 'lucide-react';
import TradeDialog from "../trade-dialog";
import type { System } from "@/lib/types";
import WarpingOverlay from "./WarpingOverlay";

export default function GameModalsAndEncounters() {
    const {
        gameState,
        tradeDetails,
        setTradeDetails,
        handleTrade,
        encounterResult,
        handlePirateAction,
        handleCloseEncounterDialog,
        travelDestination,
        setTravelDestination,
        handleConfirmTravel,
        travelFuelCost,
        isResolvingEncounter,
        isSimulating,
    } = useGame();

    const securityConfig = {
        'High': { color: 'text-green-400', icon: <ShieldCheck className="h-4 w-4"/> },
        'Medium': { color: 'text-yellow-400', icon: <ShieldCheck className="h-4 w-4"/> },
        'Low': { color: 'text-orange-400', icon: <AlertTriangle className="h-4 w-4"/> },
        'Anarchy': { color: 'text-destructive', icon: <AlertTriangle className="h-4 w-4"/> },
    };

    const economyIcons: Record<System['economy'], React.ReactNode> = {
        'Industrial': <Factory className="h-4 w-4"/>,
        'Agricultural': <Wheat className="h-4 w-4"/>,
        'High-Tech': <Cpu className="h-4 w-4"/>,
        'Extraction': <Hammer className="h-4 w-4"/>,
        'Refinery': <Recycle className="h-4 w-4"/>,
    };

    if (!gameState) {
        return null; // Don't render modals if there's no game state
    }

    return (
        <>
            {isSimulating && <WarpingOverlay />}

            {/* Pirate Encounter Dialog */}
            <PirateEncounter
                pirate={gameState.pirateEncounter ?? null}
                onAction={handlePirateAction}
                isResolving={isResolvingEncounter}
            />

            {/* Encounter Result Dialog */}
            <AlertDialog open={!!encounterResult}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{`Encounter Resolved`}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {encounterResult?.narrative}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="text-sm space-y-2">
                        <p><strong>Outcome:</strong> <span className="font-mono">{encounterResult?.outcome.replace('_', ' ')}</span></p>
                        <p><strong>Credits Lost:</strong> <span className="font-mono text-amber-400">{encounterResult?.creditsLost} ¢</span></p>
                        <p><strong>Cargo Lost:</strong> <span className="font-mono text-sky-400">{encounterResult?.cargoLost} (value)</span></p>
                        <p><strong>Hull Damage:</strong> <span className="font-mono text-destructive">{encounterResult?.damageTaken}%</span></p>
                    </div>
                     <AlertDialogFooter>
                        <AlertDialogAction onClick={handleCloseEncounterDialog}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            {/* Trade Dialog */}
            <TradeDialog
                isOpen={!!tradeDetails}
                onOpenChange={(open) => !open && setTradeDetails(null)}
                item={tradeDetails?.item ?? null}
                tradeType={tradeDetails?.type ?? 'buy'}
                playerStats={gameState.playerStats ?? null}
                inventory={gameState.inventory ?? []}
                onTrade={handleTrade}
            />

            {/* Travel Confirmation Dialog */}
            <AlertDialog open={!!travelDestination && !!gameState} onOpenChange={() => setTravelDestination(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Interstellar Travel</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to travel to the <span className="font-bold text-primary">{travelDestination?.name}</span> system. This will consume fuel and may attract unwanted attention.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="text-sm space-y-3 rounded-md border border-border/50 p-4 bg-card/50">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Destination</span>
                            <span className="font-mono text-primary">{travelDestination?.name}</span>
                        </div>
                        {travelDestination && (
                             <>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Security</span>
                                    <span className={`font-mono flex items-center gap-1.5 ${securityConfig[travelDestination.security].color}`}>
                                        {securityConfig[travelDestination.security].icon}
                                        {travelDestination.security}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Primary Economy</span>
                                    <span className="font-mono flex items-center gap-1.5 text-primary">
                                        {economyIcons[travelDestination.economy]}
                                        {travelDestination.economy}
                                    </span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Estimated Fuel Cost</span>
                            <span className="font-mono text-amber-400">{travelFuelCost} SU</span>
                        </div>
                        {gameState && (
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Remaining Fuel</span>
                                <span className={`font-mono ${gameState.playerStats.fuel - travelFuelCost < 0 ? 'text-destructive' : ''}`}>
                                    {gameState.playerStats.fuel - travelFuelCost} SU
                                </span>
                            </div>
                        )}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setTravelDestination(null)}>Cancel</AlertDialogCancel>
                         <AlertDialogAction onClick={handleConfirmTravel} disabled={isSimulating || (gameState?.playerStats?.fuel ?? 0) < travelFuelCost}>
                            {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Engage Warp Drive
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
