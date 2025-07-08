
'use client';

import { createContext, useContext } from 'react';
import type { GameState, MarketItem, System, EncounterResult, Quest, PlayerShip, ShipForSale, CrewMember, PartnershipOffer, ActiveObjective } from '@/lib/types';
import { Toaster } from "@/components/ui/toaster";
import { useGameState } from '@/hooks/use-game-state';
import { useQuests } from '@/hooks/use-quests';
import { useMarket } from '@/hooks/use-market';
import { useTravel } from '@/hooks/use-travel';
import { usePlayerActions } from '@/hooks/use-player-actions';
import { useEncounters } from '@/hooks/use-encounters';
import { useBar } from '@/hooks/use-bar';
import { useResidence } from '@/hooks/use-residence';
import { useCommerce } from '@/hooks/use-commerce';
import { useIndustry } from '@/hooks/use-industry';
import { useConstruction } from '@/hooks/use-construction';
import { useRecreation } from '@/hooks/use-recreation';
import type { useQuests as useQuestsType } from '@/hooks/use-quests';
import type { usePlayerActions as usePlayerActionsType } from '@/hooks/use-player-actions';
import type { useEncounters as useEncountersType } from '@/hooks/use-encounters';
import type { useBar as useBarType } from '@/hooks/use-bar';
import type { useResidence as useResidenceType } from '@/hooks/use-residence';
import type { useCommerce as useCommerceType } from '@/hooks/use-commerce';
import type { useIndustry as useIndustryType } from '@/hooks/use-industry';
import type { useConstruction as useConstructionType } from '@/hooks/use-construction';
import type { useRecreation as useRecreationType } from '@/hooks/use-recreation';
import type { useMarket as useMarketType } from '@/hooks/use-market';
import type { useTravel as useTravelType } from '@/hooks/use-travel';

type GameContextType = {
    gameState: GameState | null;
    isClient: boolean;
} & ReturnType<typeof useQuestsType> &
  ReturnType<typeof usePlayerActionsType> &
  ReturnType<typeof useEncountersType> &
  ReturnType<typeof useBarType> &
  ReturnType<typeof useResidenceType> &
  ReturnType<typeof useCommerceType> &
  ReturnType<typeof useIndustryType> &
  ReturnType<typeof useConstructionType> &
  ReturnType<typeof useRecreationType> &
  ReturnType<typeof useMarketType> &
  ReturnType<typeof useTravelType>;


const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

export function GameProvider({ children }: { children: React.ReactNode }) {
    const { gameState, setGameState, isClient } = useGameState();
    
    // Core Logic Hooks
    const { updateObjectiveProgress, ...questLogic } = useQuests(gameState, setGameState);
    const playerActions = usePlayerActions(gameState, setGameState);
    const encounters = useEncounters(gameState, setGameState);

    // Business Logic Hooks
    const barLogic = useBar(gameState, setGameState, updateObjectiveProgress);
    const residenceLogic = useResidence(gameState, setGameState, updateObjectiveProgress);
    const commerceLogic = useCommerce(gameState, setGameState, updateObjectiveProgress);
    const industryLogic = useIndustry(gameState, setGameState, updateObjectiveProgress);
    const constructionLogic = useConstruction(gameState, setGameState, updateObjectiveProgress);
    const recreationLogic = useRecreation(gameState, setGameState, updateObjectiveProgress);

    // Page-specific Hooks (that still need to be available globally)
    const marketLogic = useMarket(gameState, setGameState);
    const travelLogic = useTravel(gameState, setGameState);
    
    const contextValue: GameContextType = {
        gameState,
        isClient,
        updateObjectiveProgress,
        ...questLogic,
        ...playerActions,
        ...encounters,
        ...barLogic,
        ...residenceLogic,
        ...commerceLogic,
        ...industryLogic,
        ...constructionLogic,
        ...recreationLogic,
        ...marketLogic,
        ...travelLogic,
    };
    
    return (
        <GameContext.Provider value={contextValue}>
            {children}
            <Toaster />
        </GameContext.Provider>
    );
}
