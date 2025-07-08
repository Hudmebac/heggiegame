
'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import type { GameState, TradeRouteContract } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { runGenerateTradeContracts } from '@/app/actions';
import { pirateNames, shipTypes } from '@/lib/pirates';

const generateRandomPirate = (hasNavigator: boolean): Pirate => {
    const weightedThreats: Pirate['threatLevel'][] = hasNavigator
        ? ['Low', 'Low', 'Low', 'Medium', 'Medium', 'Medium', 'High', 'High', 'Critical']
        : ['Low', 'Medium', 'High', 'Critical'];
    const threat = weightedThreats[Math.floor(Math.random() * weightedThreats.length)];
    return {
        name: pirateNames[Math.floor(Math.random() * pirateNames.length)],
        shipType: shipTypes[Math.floor(Math.random() * shipTypes.length)],
        threatLevel: threat,
    };
}


export function useHauler(
  gameState: GameState | null,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
  const { toast } = useToast();
  const [isGeneratingContracts, startContractGeneration] = useTransition();

  const handleGenerateContracts = useCallback(() => {
    if (!gameState) return;

    startContractGeneration(async () => {
      try {
        const result = await runGenerateTradeContracts({
          reputation: gameState.playerStats.reputation,
          currentSystem: gameState.currentSystem,
        });
        setGameState(prev => {
          if (!prev) return null;
          // Filter out old "Available" contracts and add new ones
          const activeContracts = prev.playerStats.tradeContracts.filter(c => c.status !== 'Available');
          const newContracts = result.contracts.map(c => ({...c, status: 'Available' as const}));
          return {
            ...prev,
            playerStats: {
              ...prev.playerStats,
              tradeContracts: [...activeContracts, ...newContracts]
            }
          };
        });
        toast({ title: 'Contract Board Updated', description: 'New trade routes are available for review.' });
      } catch (error) {
        console.error("Failed to generate trade contracts:", error);
        toast({ variant: "destructive", title: "Network Error", description: "Could not retrieve new contracts at this time." });
      }
    });
  }, [gameState, setGameState, toast]);

  const handleAcceptContract = useCallback((contractId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      
      const contract = prev.playerStats.tradeContracts.find(c => c.id === contractId);
      if (!contract) return prev;

      const cargoNeeded = contract.quantity;
      if (prev.playerStats.maxCargo < cargoNeeded) {
        toast({
          variant: "destructive",
          title: "Contract Rejected",
          description: `Your ship's cargo hold (${prev.playerStats.maxCargo}t) is too small for this contract (${cargoNeeded}t).`
        });
        return prev;
      }
      
      const updatedContracts = prev.playerStats.tradeContracts.map(c => 
        c.id === contractId ? { ...c, status: 'Active' as const, startTime: Date.now(), progress: 0 } : c
      );

      toast({ title: "Contract Accepted!", description: `Route from ${contract.fromSystem} to ${contract.toSystem} is now active.` });

      return {
        ...prev,
        playerStats: {
          ...prev.playerStats,
          tradeContracts: updatedContracts,
        }
      };
    });
  }, [setGameState, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameState || gameState.isGameOver) return;
      
      const activeContracts = gameState.playerStats.tradeContracts.filter(c => c.status === 'Active');
      if (activeContracts.length === 0) return;

      setGameState(prev => {
        if (!prev) return null;
        
        let stateChanged = false;
        const now = Date.now();
        const updatedContracts = [...prev.playerStats.tradeContracts];
        let newPlayerStats = { ...prev.playerStats };

        activeContracts.forEach(contract => {
          const index = updatedContracts.findIndex(c => c.id === contract.id);
          if (index === -1) return;

          const elapsed = (now - (contract.startTime || now)) / 1000;
          const progress = Math.min(100, (elapsed / contract.duration) * 100);
          updatedContracts[index].progress = progress;
          stateChanged = true;
          
          if (progress >= 100) {
            updatedContracts[index].status = 'Completed';
            newPlayerStats.netWorth += contract.payout;
            setTimeout(() => toast({ title: "Contract Complete!", description: `Delivered ${contract.quantity} units of ${contract.cargo} to ${contract.toSystem}. You earned ${contract.payout.toLocaleString()}¢.` }), 0);
          } else {
            // Pirate risk check
            const riskValue = { 'Low': 0.005, 'Medium': 0.01, 'High': 0.02, 'Critical': 0.05 }[contract.riskLevel];
            if (Math.random() < riskValue) {
                updatedContracts[index].status = 'Failed';
                newPlayerStats.pirateEncounter = generateRandomPirate(prev.crew.some(c => c.role === 'Navigator'));
                setTimeout(() => toast({ variant: "destructive", title: "Ambush!", description: `Your route to ${contract.toSystem} has been intercepted by pirates!` }), 0);
            }
          }
        });

        if (stateChanged) {
          return { ...prev, playerStats: { ...newPlayerStats, tradeContracts: updatedContracts }};
        }

        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, setGameState, toast]);

  return {
    handleGenerateContracts,
    handleAcceptContract,
    isGeneratingContracts,
  };
}
