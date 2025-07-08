
'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import type { GameState, TradeRouteContract, Pirate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { pirateNames, shipTypes } from '@/lib/pirates';
import { STATIC_TRADE_CONTRACTS } from '@/lib/trade-contracts';
import { ROUTES } from '@/lib/systems';


const getConnectedSystems = (systemName: string): string[] => {
    const connected = new Set<string>();
    ROUTES.forEach(route => {
        if (route.from === systemName) connected.add(route.to);
        if (route.to === systemName) connected.add(route.from);
    });
    return Array.from(connected);
}

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
    const { currentSystem, playerStats } = gameState;

    startContractGeneration(() => {
        const connectedSystems = getConnectedSystems(currentSystem);
        if (connectedSystems.length === 0) {
            toast({ variant: "destructive", title: "Isolation", description: "No outbound routes from this system to generate contracts for." });
            return;
        }

        const shuffledContracts = [...STATIC_TRADE_CONTRACTS].sort(() => 0.5 - Math.random());
        const contractCount = 4 + Math.floor(Math.random() * 2); // 4 or 5 contracts
        
        const newContracts: TradeRouteContract[] = shuffledContracts.slice(0, contractCount).map((contractTemplate, index) => {
            const repModifier = 1 + (playerStats.reputation / 200); // up to 50% bonus at 100 rep
            const payout = Math.round(contractTemplate.payout * repModifier);

            return {
                ...contractTemplate,
                id: `${Date.now()}-${index}`,
                fromSystem: currentSystem,
                toSystem: connectedSystems[Math.floor(Math.random() * connectedSystems.length)],
                status: 'Available',
                payout,
            };
        });
        
        setGameState(prev => {
          if (!prev) return null;
          const activeContracts = (prev.playerStats.tradeContracts || []).filter(c => c.status !== 'Available');
          return {
            ...prev,
            playerStats: {
              ...prev.playerStats,
              tradeContracts: [...activeContracts, ...newContracts]
            }
          };
        });
        toast({ title: 'Contract Board Updated', description: 'New trade routes are available for review.' });
    });
  }, [gameState, setGameState, toast]);
  
  const handleAcceptContract = useCallback((contractId: string) => {
    if (!gameState) return;
      
    const contract = gameState.playerStats.tradeContracts.find(c => c.id === contractId);
    if (!contract) return;

    const cargoNeeded = contract.quantity;
    if (gameState.playerStats.maxCargo < cargoNeeded) {
      toast({
        variant: "destructive",
        title: "Contract Rejected",
        description: `Your ship's cargo hold (${gameState.playerStats.maxCargo}t) is too small for this contract (${cargoNeeded}t).`
      });
      return;
    }
    
    setGameState(prev => {
        if(!prev) return null;
        const updatedContracts = prev.playerStats.tradeContracts.map(c => 
            c.id === contractId ? { ...c, status: 'Active' as const, startTime: Date.now(), progress: 0 } : c
        );
        return {
            ...prev,
            playerStats: {
            ...prev.playerStats,
            tradeContracts: updatedContracts,
            }
        };
    });

    toast({ title: "Contract Accepted!", description: `Route from ${contract.fromSystem} to ${contract.toSystem} is now active.` });

  }, [gameState, setGameState, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        if (!prev || prev.isGameOver) return prev;
      
        const activeContracts = (prev.playerStats.tradeContracts || []).filter(c => c.status === 'Active');
        if (activeContracts.length === 0) return prev;

        let stateChanged = false;
        const now = Date.now();
        const updatedContracts = [...(prev.playerStats.tradeContracts || [])];
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
            if (!newPlayerStats.pirateEncounter && Math.random() < riskValue) {
                newPlayerStats.pirateEncounter = {
                    ...generateRandomPirate(prev.crew.some(c => c.role === 'Navigator')),
                    missionId: contract.id,
                    missionType: 'trade',
                };
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
  }, [setGameState, toast]);

  return {
    handleGenerateContracts,
    handleAcceptContract,
    isGeneratingContracts,
  };
}
