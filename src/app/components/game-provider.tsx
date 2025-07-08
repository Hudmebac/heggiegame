

'use client';

import { createContext, useContext } from 'react';
import type { GameState, MarketItem, System, EncounterResult, Quest, PlayerShip, ShipForSale, CrewMember, PartnershipOffer, ActiveObjective, Difficulty, Career } from '@/lib/types';
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
import { useCasino } from '@/hooks/use-casino';
import { useBank } from '@/hooks/use-bank';
import { useHauler } from '@/hooks/use-hauler';
import { useTaxi } from '@/hooks/use-taxi';
import { useTrader } from '@/hooks/use-trader';
import type { useQuests as useQuestsType } from '@/hooks/use-quests';
import type { usePlayerActions as usePlayerActionsType } from '@/hooks/use-player-actions';
import type { useEncounters as useEncountersType } from '@/hooks/use-encounters';
import type { useBar as useBarType } from '@/hooks/use-bar';
import type { useResidence as useResidenceType } from '@/hooks/use-residence';
import type { useCommerce as useCommerceType } from '@/hooks/use-commerce';
import type { useIndustry as useIndustryType } from '@/hooks/use-industry';
import type { useConstruction as useConstructionType } from '@/hooks/use-construction';
import type { useRecreation as useRecreationType } from '@/hooks/use-recreation';
import type { useCasino as useCasinoType } from '@/hooks/use-casino';
import type { useBank as useBankType } from '@/hooks/use-bank';
import type { useMarket as useMarketType } from '@/hooks/use-market';
import type { useTravel as useTravelType } from '@/hooks/use-travel';
import type { useHauler as useHaulerType } from '@/hooks/use-hauler';
import type { useTaxi as useTaxiType } from '@/hooks/use-taxi';
import type { useTrader as useTraderType } from '@/hooks/use-trader';


type GameContextType = {
    gameState: GameState | null;
    isClient: boolean;
    isGeneratingNewGame: boolean;
    startNewGame: (difficulty: Difficulty, career: Career) => void;
} & ReturnType<typeof useQuestsType> &
  ReturnType<typeof usePlayerActionsType> &
  ReturnType<typeof useEncountersType> &
  ReturnType<typeof useBarType> &
  ReturnType<typeof useResidenceType> &
  ReturnType<typeof useCommerceType> &
  ReturnType<typeof useIndustryType> &
  ReturnType<typeof useConstructionType> &
  ReturnType<typeof useRecreationType> &
  ReturnType<typeof useCasinoType> &
  ReturnType<typeof useBankType> &
  ReturnType<typeof useMarketType> &
  ReturnType<typeof useTravelType> &
  ReturnType<typeof useHaulerType> &
  ReturnType<typeof useTaxiType> &
  ReturnType<typeof useTraderType>;


const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

export function GameProvider({ children }: { children: React.ReactNode }) {
    const { gameState, setGameState, isClient, isGeneratingNewGame, startNewGame } = useGameState();
    
    // Core Logic Hooks
    const { updateObjectiveProgress, ...questLogic } = useQuests(gameState, setGameState);
    const playerActions = usePlayerActions(gameState, setGameState);
    const encounters = useEncounters(gameState, setGameState);
    const haulerLogic = useHauler(gameState, setGameState);
    const taxiLogic = useTaxi(gameState, setGameState);
    const traderLogic = useTrader(gameState, setGameState);

    // Business Logic Hooks
    const barLogic = useBar(gameState, setGameState, updateObjectiveProgress);
    const residenceLogic = useResidence(gameState, setGameState, updateObjectiveProgress);
    const commerceLogic = useCommerce(gameState, setGameState, updateObjectiveProgress);
    const industryLogic = useIndustry(gameState, setGameState, updateObjectiveProgress);
    const constructionLogic = useConstruction(gameState, setGameState, updateObjectiveProgress);
    const recreationLogic = useRecreation(gameState, setGameState, updateObjectiveProgress);
    const casinoLogic = useCasino(gameState, setGameState);
    const bankLogic = useBank(gameState, setGameState);

    // Page-specific Hooks (that still need to be available globally)
    const marketLogic = useMarket(gameState, setGameState);
    const travelLogic = useTravel(gameState, setGameState);
    
    const contextValue: GameContextType = {
        gameState,
        isClient,
        isGeneratingNewGame,
        startNewGame,
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
        ...casinoLogic,
        ...bankLogic,
        ...marketLogic,
        ...travelLogic,
        ...haulerLogic,
        ...taxiLogic,
        ...traderLogic,
    };
    
    return (
        <GameContext.Provider value={contextValue}>
            {children}
            <Toaster />
        </GameContext.Provider>
    );
}
