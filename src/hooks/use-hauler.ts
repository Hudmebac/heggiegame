
'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import type { GameState, Pirate, TradeRouteContract, PlayerShip } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { pirateNames, shipTypes } from '@/lib/pirates';
import { STATIC_TRADE_CONTRACTS } from '@/lib/trade-contracts';
import { ROUTES, SYSTEMS } from '@/lib/systems';
import { cargoUpgrades, fuelUpgrades, weaponUpgrades, droneUpgrades, powerCoreUpgrades, hullUpgrades, advancedUpgrades } from '@/lib/upgrades';
import { SHIPS_FOR_SALE } from '@/lib/ships';


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

        const fromSystemData = SYSTEMS.find(s => s.name === currentSystem);
        if (!fromSystemData) return;

        const shuffledContracts = [...STATIC_TRADE_CONTRACTS].sort(() => 0.5 - Math.random());
        const contractCount = 4 + Math.floor(Math.random() * 2); // 4 or 5 contracts
        
        const newContracts: TradeRouteContract[] = shuffledContracts.slice(0, contractCount).map((contractTemplate, index) => {
            const toSystemName = connectedSystems[Math.floor(Math.random() * connectedSystems.length)];
            const toSystemData = SYSTEMS.find(s => s.name === toSystemName);
            if (!toSystemData) return null;

            const distance = Math.hypot(toSystemData.x - fromSystemData.x, toSystemData.y - fromSystemData.y);
            
            // New dynamic payout calculation
            const baseMultiplier = 10;
            const distanceBonus = Math.round(distance * 50);
            const quantityBonus = Math.round(contractTemplate.quantity * 20);
            const timePenalty = (300 / contractTemplate.duration); // Shorter duration = higher payout
            const repModifier = 1 + (playerStats.reputation / 200);

            let requirementsBonus = 0;
            if (contractTemplate.minFuelLevel) requirementsBonus += contractTemplate.minFuelLevel * 2000;
            if (contractTemplate.minWeaponLevel) requirementsBonus += contractTemplate.minWeaponLevel * 3000;
            if (contractTemplate.minHullLevel) requirementsBonus += contractTemplate.minHullLevel * 2500;
            if (contractTemplate.minDroneLevel) requirementsBonus += contractTemplate.minDroneLevel * 4000;
            if (contractTemplate.requiredAdvancedSystems) requirementsBonus += contractTemplate.requiredAdvancedSystems.length * 100000;

            const basePayout = contractTemplate.payout * baseMultiplier;
            const dynamicPayout = Math.round((basePayout + distanceBonus + quantityBonus + requirementsBonus) * timePenalty * repModifier);

            return {
                ...contractTemplate,
                id: `${Date.now()}-${index}`,
                fromSystem: currentSystem,
                toSystem: toSystemName,
                status: 'Available',
                payout: dynamicPayout,
            };
        }).filter((c): c is TradeRouteContract => c !== null);
        
        setGameState(prev => {
          if (!prev) return null;
          const activeContracts = (prev.playerStats.tradeContracts || []).filter(c => c.status !== 'Available');
          return {
            ...prev,
            playerStats: {
              ...prev.playerStats,
              tradeContracts: [...activeContracts, ...newContracts],
              lastHaulerContractGeneration: Date.now(),
            }
          };
        });
        toast({ title: 'Contract Board Updated', description: 'New trade routes are available for review.' });
    });
  }, [gameState, setGameState, toast]);
  
  const handleAcceptContract = useCallback((contractId: string, assignedShipId?: number) => {
    setGameState(prev => {
        if(!prev) return null;
        
        const contract = prev.playerStats.tradeContracts.find(c => c.id === contractId);
        if (!contract) {
            setTimeout(() => toast({ variant: "destructive", title: "Mission Not Found", description: "This contract is no longer available." }), 0);
            return prev;
        }
        
        const shipToAssign = assignedShipId ? prev.playerStats.fleet.find(s => s.instanceId === assignedShipId) : null;
        if (!shipToAssign) {
            setTimeout(() => toast({ variant: "destructive", title: "Assignment Failed", description: "Could not find a suitable ship to assign." }), 0);
            return prev;
        }

        const updatedContracts = prev.playerStats.tradeContracts.map(c => 
            c.id === contractId ? { 
                ...c, 
                status: 'Active' as const, 
                startTime: Date.now(), 
                progress: 0,
                assignedShipInstanceId: shipToAssign.instanceId,
                assignedShipName: shipToAssign.name,
            } : c
        );
        
        setTimeout(() => toast({ title: "Contract Accepted!", description: `Route from ${contract.fromSystem} to ${contract.toSystem} is now active.` }), 0);

        return {
            ...prev,
            playerStats: {
            ...prev.playerStats,
            tradeContracts: updatedContracts,
            }
        };
    });

  }, [setGameState, toast]);

  // This hook now manages the lifecycle of active trade contracts
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
        let newEvents = [...prev.playerStats.events];
        let newFleet = [...prev.playerStats.fleet];

        activeContracts.forEach(contract => {
          const index = updatedContracts.findIndex(c => c.id === contract.id);
          const shipIndex = newFleet.findIndex(s => s.instanceId === contract.assignedShipInstanceId);
          if (index === -1) return;

          const assignedShip = shipIndex > -1 ? newFleet[shipIndex] : null;
          if (!assignedShip) { // Ship was sold or destroyed
              updatedContracts[index].status = 'Failed';
              updatedContracts[index].assignedShipInstanceId = null;
              stateChanged = true;
              return;
          }

          const powerCoreBonus = 1 + ((assignedShip.powerCoreLevel - 1) * 0.05);
          const overdriveBonus = assignedShip.overdriveEngine ? 1.1 : 1;
          const stabilizerBonus = assignedShip.warpStabilizer ? 1.05 : 1;
          const timeModifier = powerCoreBonus * overdriveBonus * stabilizerBonus;

          const elapsed = (now - (contract.startTime || now)) / 1000;
          const progress = Math.min(100, (elapsed / contract.duration) * 100 * timeModifier);
          
          if (updatedContracts[index].progress !== progress) {
            updatedContracts[index].progress = progress;
            stateChanged = true;
          }
          
          if (progress >= 100) {
            // Mission Complete
            updatedContracts[index].status = 'Completed';
            updatedContracts[index].assignedShipInstanceId = null;

            let payout = contract.payout;
            let repChange = 1;
            let toastDescription = "";
            if (elapsed < contract.duration / timeModifier) { // Early completion bonus
                const bonus = Math.round(payout * 0.15);
                payout += bonus;
                toastDescription = `Delivered ${contract.quantity} units of ${contract.cargo} to ${contract.toSystem}. You earned ${payout.toLocaleString()}¢, including a ${bonus.toLocaleString()}¢ efficiency bonus.`;
            } else {
                 toastDescription = `Delivered ${contract.quantity} units of ${contract.cargo} to ${contract.toSystem}. You earned ${payout.toLocaleString()}¢.`;
            }

            newPlayerStats.netWorth += payout;
            newPlayerStats.reputation += repChange;

            // Consume fuel from the assigned ship
            const fuelConsumed = contract.requiredFuel || 0;
            if(shipIndex > -1) {
                newFleet[shipIndex].fuel = Math.max(0, (newFleet[shipIndex].fuel || 0) - fuelConsumed);
            }

            newEvents.push({
                id: `evt_${Date.now()}_${contract.id}`,
                timestamp: Date.now(),
                type: 'Mission',
                description: `Completed Hauler contract to ${contract.toSystem}.`,
                value: payout,
                reputationChange: repChange,
                isMilestone: false,
            });

            setTimeout(() => toast({ title: "Contract Complete!", description: toastDescription }), 0);
          } else {
            // Pirate Risk Check
            const riskValue = { 'Low': 0.005, 'Medium': 0.01, 'High': 0.02, 'Critical': 0.05 }[contract.riskLevel];
            if (!newPlayerStats.pirateEncounter && Math.random() < riskValue) {
                newPlayerStats.pirateEncounter = {
                    ...generateRandomPirate(prev.crew.some(c => c.role === 'Navigator')),
                    missionId: contract.id,
                    missionType: 'trade',
                };
                
                setTimeout(() => toast({ variant: "destructive", title: "Ambush!", description: `Your route to ${contract.toSystem} has been intercepted!` }), 0);
            }
          }
        });

        if (stateChanged) {
          return { ...prev, playerStats: { ...newPlayerStats, tradeContracts: updatedContracts, events: newEvents, fleet: newFleet }};
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
