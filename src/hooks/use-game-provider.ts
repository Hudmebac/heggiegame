

'use client';

import { createContext, useContext } from 'react';
import type { GameState, MarketItem, System, EncounterResult, Quest, PlayerShip, ShipForSale, CrewMember, PartnershipOffer, ActiveObjective, Difficulty, Career, Stock, StockCategory, Property, Lease } from '@/lib/types';
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
import { useDefender } from '@/hooks/use-defender';
import { useMilitary } from '@/hooks/use-military';
import { useOfficial } from '@/hooks/use-official';
import { useStocks } from '@/hooks/use-stocks';
import { useLandlord } from '@/hooks/use-landlord';
import AppLayout from '@/app/components/app-layout';


type GameContextType = ReturnType<typeof useGameState> &
  ReturnType<typeof useQuests> &
  ReturnType<typeof usePlayerActions> &
  ReturnType<typeof useEncounters> &
  ReturnType<typeof useBar> &
  ReturnType<typeof useResidence> &
  ReturnType<typeof useCommerce> &
  ReturnType<typeof useIndustry> &
  ReturnType<typeof useConstruction> &
  ReturnType<typeof useRecreation> &
  ReturnType<typeof useCasino> &
  ReturnType<typeof useBank> &
  ReturnType<typeof useMarket> &
  ReturnType<typeof useTravel> &
  ReturnType<typeof useHauler> &
  ReturnType<typeof useTaxi> &
  ReturnType<typeof useTrader> &
  ReturnType<typeof useDefender> &
  ReturnType<typeof useMilitary> &
  ReturnType<typeof useOfficial> &
  ReturnType<typeof useStocks> &
  ReturnType<typeof useLandlord>;


const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

export function GameProvider({ children }: { children: React.ReactNode }) {
    const gameStateLogic = useGameState();
    const { gameState, setGameState } = gameStateLogic;
    
    // Core Logic Hooks
    const questLogic = useQuests(gameState, setGameState);
    const playerActions = usePlayerActions(gameState, setGameState);
    const encounters = useEncounters(gameState, setGameState);
    const haulerLogic = useHauler(gameState, setGameState);
    const taxiLogic = useTaxi(gameState, setGameState);
    const traderLogic = useTrader(gameState, setGameState);
    const defenderLogic = useDefender(gameState, setGameState);
    const militaryLogic = useMilitary(gameState, setGameState);
    const officialLogic = useOfficial(gameState, setGameState);
    const stocksLogic = useStocks(gameState, setGameState);
    const landlordLogic = useLandlord(gameState, setGameState);

    // Business Logic Hooks
    const barLogic = useBar(gameState, setGameState, questLogic.updateObjectiveProgress);
    const residenceLogic = useResidence(gameState, setGameState, questLogic.updateObjectiveProgress);
    const commerceLogic = useCommerce(gameState, setGameState, questLogic.updateObjectiveProgress);
    const industryLogic = useIndustry(gameState, setGameState, questLogic.updateObjectiveProgress);
    const constructionLogic = useConstruction(gameState, setGameState, questLogic.updateObjectiveProgress);
    const recreationLogic = useRecreation(gameState, setGameState, questLogic.updateObjectiveProgress);
    const casinoLogic = useCasino(gameState, setGameState);
    const bankLogic = useBank(gameState, setGameState, stocksLogic.handleAddStock);

    // Page-specific Hooks (that still need to be available globally)
    const marketLogic = useMarket(gameState, setGameState);
    const travelLogic = useTravel(gameState, setGameState);
    
    const contextValue: GameContextType = {
        ...gameStateLogic,
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
        ...defenderLogic,
        ...militaryLogic,
        ...officialLogic,
        ...stocksLogic,
        ...landlordLogic,
    };
    
    return (
        <GameContext.Provider value={contextValue}>
            <AppLayout>
              {children}
            </AppLayout>
        </GameContext.Provider>
    );
}
