
'use client';

import { useCallback, useTransition } from 'react';
import type { GameState, PlayerStats, ShipForSale, CrewMember, PlayerShip } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { SHIPS_FOR_SALE } from '@/lib/ships';
import { AVAILABLE_CREW } from '@/lib/crew';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades } from '@/lib/upgrades';
import { bios } from '@/lib/bios';
import { calculateCurrentCargo } from '@/lib/utils';

function syncActiveShipStats(playerStats: PlayerStats): PlayerStats {
    if (!playerStats.fleet || playerStats.fleet.length === 0) return playerStats;

    const activeShip = playerStats.fleet[0];
    const newStats = { ...playerStats };

    const cargoTier = cargoUpgrades[activeShip.cargoLevel - 1];
    newStats.maxCargo = cargoTier ? cargoTier.capacity : 0;
    newStats.cargoLevel = activeShip.cargoLevel;

    const weaponTier = weaponUpgrades[activeShip.weaponLevel - 1];
    newStats.weaponLevel = weaponTier ? weaponTier.level : 1;

    const shieldTier = shieldUpgrades[activeShip.shieldLevel - 1];
    newStats.shieldLevel = shieldTier ? shieldTier.level : 1;

    const hullTier = hullUpgrades[activeShip.hullLevel - 1];
    newStats.maxShipHealth = hullTier ? hullTier.health : 100;
    newStats.hullLevel = activeShip.hullLevel;

    const fuelTier = fuelUpgrades[activeShip.fuelLevel - 1];
    newStats.maxFuel = fuelTier ? fuelTier.capacity : 100;
    newStats.fuelLevel = activeShip.fuelLevel;

    const sensorTier = sensorUpgrades[activeShip.sensorLevel - 1];
    newStats.sensorLevel = sensorTier ? sensorTier.level : 1;
    
    newStats.shipHealth = Math.min(newStats.shipHealth || 0, newStats.maxShipHealth);
    newStats.fuel = Math.min(newStats.fuel || 0, newStats.maxFuel);

    return newStats;
}

export function usePlayerActions(
    gameState: GameState | null,
    setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
    const { toast } = useToast();
    const [isGeneratingBio, startBioGenerationTransition] = useTransition();

    const handleSetAvatar = useCallback((url: string) => {
        setGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    avatarUrl: url,
                },
            };
        });
    }, [setGameState]);

    const handleGenerateBio = useCallback(() => {
        startBioGenerationTransition(() => {
            setGameState(prev => {
                if (!prev) return null;
                const newBio = bios[Math.floor(Math.random() * bios.length)].replace(/{Captain}/g, prev.playerStats.name);
                toast({ title: "Bio Generated", description: "Your captain's story has been updated." });
                return { ...prev, playerStats: { ...prev.playerStats, bio: newBio } };
            });
        });
    }, [setGameState, toast]);
    
    const setPlayerName = useCallback((name: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const oldName = prev.playerStats.name;
            const newLeaderboard = prev.leaderboard.map(e => e.trader === oldName ? { ...e, trader: name } : e);
            return {
                ...prev,
                playerStats: { ...prev.playerStats, name },
                leaderboard: newLeaderboard
            }
        });
    }, [setGameState]);

    const updateTraderBio = useCallback((traderName: string, bio: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const newLeaderboard = prev.leaderboard.map(e => e.trader === traderName ? { ...e, bio: bio } : e);
            return { ...prev, leaderboard: newLeaderboard };
        });
    }, [setGameState]);

    const handleResetGame = useCallback(() => {
        toast({
            title: "Game Resetting...",
            description: "Wiping all progress. A new adventure awaits!",
        });
        localStorage.removeItem('heggieGameState');
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }, [toast]);

    const handleRefuel = useCallback(() => {
        setGameState(prev => {
            if (!prev) return null;
            const fuelNeeded = prev.playerStats.maxFuel - prev.playerStats.fuel;
            if (fuelNeeded <= 0) {
                toast({ title: "Refuel Not Needed", description: "Fuel tank is already full." });
                return prev;
            }
            const fuelPrice = 2; // credits per unit
            const totalCost = fuelNeeded * fuelPrice;
            if (prev.playerStats.netWorth < totalCost) {
                toast({ variant: "destructive", title: "Refuel Failed", description: `Not enough credits. You need ${totalCost}¢.` });
                return prev;
            }
            const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - totalCost, fuel: prev.playerStats.maxFuel, };
            toast({ title: "Refuel Complete", description: `You spent ${totalCost}¢ to refuel your ship.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleRepairShip = useCallback(() => {
        setGameState(prev => {
            if (!prev) return null;
            const damageToRepair = prev.playerStats.maxShipHealth - prev.playerStats.shipHealth;
            if (damageToRepair <= 0) {
                toast({ title: "Repairs Not Needed", description: "Ship integrity is at 100%." });
                return prev;
            }
            const baseRepairPricePerPoint = 50;
            const totalCost = Math.round(damageToRepair * baseRepairPricePerPoint);
            if (prev.playerStats.netWorth < totalCost) {
                toast({ variant: "destructive", title: "Repairs Failed", description: `Not enough credits. You need ${totalCost}¢.` });
                return prev;
            }
            const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - totalCost, shipHealth: prev.playerStats.maxShipHealth, };
            toast({ title: "Repairs Complete", description: `You spent ${totalCost}¢ to restore your ship\'s hull.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleHireCrew = useCallback((crewId: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const crewToHire = AVAILABLE_CREW.find(c => c.id === crewId);
            if (!crewToHire) return prev;
            if (prev.playerStats.netWorth < crewToHire.hiringFee) {
                toast({ variant: "destructive", title: "Hiring Failed", description: "Not enough credits." });
                return prev;
            }
            const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - crewToHire.hiringFee };
            const newCrew = [...prev.crew, crewToHire];
            toast({ title: "Crew Member Hired", description: `${crewToHire.name} has joined your crew.` });
            return { ...prev, playerStats: newPlayerStats, crew: newCrew };
        });
    }, [setGameState, toast]);

    const handleFireCrew = useCallback((crewId: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const crewToFire = prev.crew.find(c => c.id === crewId);
            if (!crewToFire) return prev;
            const newCrew = prev.crew.filter(c => c.id !== crewId);
            toast({ title: "Crew Member Fired", description: `${crewToFire.name} has left your crew.` });
            return { ...prev, crew: newCrew };
        });
    }, [setGameState, toast]);

    const handlePurchaseShip = useCallback((ship: ShipForSale) => {
        setGameState(prev => {
            if (!prev) return null;
            if (prev.playerStats.netWorth < ship.cost) {
                toast({ variant: "destructive", title: "Purchase Failed", description: "Not enough credits." });
                return prev;
            }
            const newShip: PlayerShip = {
                instanceId: Date.now(),
                shipId: ship.id,
                name: ship.name,
                cargoLevel: 1, weaponLevel: 1, shieldLevel: 1, hullLevel: 1, fuelLevel: 1, sensorLevel: 1,
            };
            const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - ship.cost, fleet: [...prev.playerStats.fleet, newShip] };
            toast({ title: "Ship Purchased!", description: `The ${ship.name} has been added to your fleet.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleSellShip = useCallback((shipInstanceId: number) => {
        setGameState(prev => {
            if (!prev || prev.playerStats.fleet.length <= 1) {
                toast({ variant: "destructive", title: "Sale Failed", description: "You cannot sell your last ship." });
                return prev;
            }
            const shipIndex = prev.playerStats.fleet.findIndex(s => s.instanceId === shipInstanceId);
            if (shipIndex === -1) return prev;

            const shipToSell = prev.playerStats.fleet[shipIndex];
            const baseData = SHIPS_FOR_SALE.find(s => s.id === shipToSell.shipId)!;
            let totalValue = baseData.cost;
            totalValue += cargoUpgrades[shipToSell.cargoLevel - 1].cost;
            totalValue += weaponUpgrades[shipToSell.weaponLevel - 1].cost;
            totalValue += shieldUpgrades[shipToSell.shieldLevel - 1].cost;
            totalValue += hullUpgrades[shipToSell.hullLevel - 1].cost;
            totalValue += fuelUpgrades[shipToSell.fuelLevel - 1].cost;
            totalValue += sensorUpgrades[shipToSell.sensorLevel - 1].cost;

            const salePrice = Math.round(totalValue * 0.7);
            const newFleet = prev.playerStats.fleet.filter(s => s.instanceId !== shipInstanceId);
            let newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth + salePrice, fleet: newFleet };
            
            if (shipIndex === 0) {
                newPlayerStats = syncActiveShipStats(newPlayerStats);
                newPlayerStats.cargo = calculateCurrentCargo(prev.inventory);
            }
            
            toast({ title: "Ship Sold", description: `You sold the ${shipToSell.name} for ${salePrice.toLocaleString()}¢.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleUpgradeShip = useCallback((shipInstanceId: number, upgradeType: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor') => {
        setGameState(prev => {
            if (!prev) return null;
            const fleet = [...prev.playerStats.fleet];
            const shipIndex = fleet.findIndex(s => s.instanceId === shipInstanceId);
            if (shipIndex === -1) return prev;

            const shipToUpgrade = { ...fleet[shipIndex] };
            const upgradeMap = {
                cargo: { levels: cargoUpgrades, current: shipToUpgrade.cargoLevel },
                weapon: { levels: weaponUpgrades, current: shipToUpgrade.weaponLevel },
                shield: { levels: shieldUpgrades, current: shipToUpgrade.shieldLevel },
                hull: { levels: hullUpgrades, current: shipToUpgrade.hullLevel },
                fuel: { levels: fuelUpgrades, current: shipToUpgrade.fuelLevel },
                sensor: { levels: sensorUpgrades, current: shipToUpgrade.sensorLevel },
            };

            const upgradeInfo = upgradeMap[upgradeType];
            if (upgradeInfo.current >= upgradeInfo.levels.length) {
                toast({ variant: "destructive", title: "Upgrade Failed", description: "Already at max level." });
                return prev;
            }
            const currentTierCost = upgradeInfo.levels[upgradeInfo.current - 1]?.cost || 0;
            const nextTierCost = upgradeInfo.levels[upgradeInfo.current].cost;
            const cost = nextTierCost - currentTierCost;

            if (prev.playerStats.netWorth < cost) {
                toast({ variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` });
                return prev;
            }

            (shipToUpgrade as any)[`${upgradeType}Level`] += 1;
            fleet[shipIndex] = shipToUpgrade;
            let newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - cost, fleet };

            if (shipIndex === 0) newPlayerStats = syncActiveShipStats(newPlayerStats);
            
            toast({ title: `${upgradeType.charAt(0).toUpperCase() + upgradeType.slice(1)} Upgraded!`, description: `Your ${shipToUpgrade.name}'s ${upgradeType} is now Mk. ${shipToUpgrade[`${upgradeType}Level` as keyof PlayerShip]}.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleDowngradeShip = useCallback((shipInstanceId: number, upgradeType: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor') => {
        setGameState(prev => {
            if (!prev) return null;
            const fleet = [...prev.playerStats.fleet];
            const shipIndex = fleet.findIndex(s => s.instanceId === shipInstanceId);
            if (shipIndex === -1) return prev;

            const shipToDowngrade = { ...fleet[shipIndex] };
            const upgradeMap = {
                cargo: { levels: cargoUpgrades, current: shipToDowngrade.cargoLevel },
                weapon: { levels: weaponUpgrades, current: shipToDowngrade.weaponLevel },
                shield: { levels: shieldUpgrades, current: shipToDowngrade.shieldLevel },
                hull: { levels: hullUpgrades, current: shipToDowngrade.hullLevel },
                fuel: { levels: fuelUpgrades, current: shipToDowngrade.fuelLevel },
                sensor: { levels: sensorUpgrades, current: shipToDowngrade.sensorLevel },
            };
            const upgradeInfo = upgradeMap[upgradeType];
            if (upgradeInfo.current <= 1) {
                toast({ variant: "destructive", title: "Downgrade Failed", description: "Cannot downgrade further." });
                return prev;
            }

            if (upgradeType === 'cargo') {
                const newMaxCargo = upgradeInfo.levels[upgradeInfo.current - 2].capacity;
                const currentCargo = calculateCurrentCargo(prev.inventory);
                if (currentCargo > newMaxCargo) {
                    toast({ variant: "destructive", title: "Downgrade Failed", description: `Cannot downgrade cargo hold, you have too much cargo (${currentCargo.toFixed(2)}t / ${newMaxCargo}t).` });
                    return prev;
                }
            }

            const currentTierCost = upgradeInfo.levels[upgradeInfo.current - 1].cost;
            const prevTierCost = upgradeInfo.levels[upgradeInfo.current - 2].cost;
            const refund = Math.round((currentTierCost - prevTierCost) * 0.7);

            (shipToDowngrade as any)[`${upgradeType}Level`] -= 1;
            fleet[shipIndex] = shipToDowngrade;
            let newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth + refund, fleet };
            if (shipIndex === 0) newPlayerStats = syncActiveShipStats(newPlayerStats);
            
            toast({ title: "Downgrade Successful!", description: `You received ${refund.toLocaleString()}¢ for selling the old component.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleSetActiveShip = useCallback((shipInstanceId: number) => {
        setGameState(prev => {
            if (!prev) return null;
            const shipIndex = prev.playerStats.fleet.findIndex(s => s.instanceId === shipInstanceId);
            if (shipIndex <= 0) return prev; 

            const newFleet = [...prev.playerStats.fleet];
            const activeShip = newFleet.splice(shipIndex, 1)[0];
            newFleet.unshift(activeShip);
            
            let newPlayerStats = { ...prev.playerStats, fleet: newFleet };
            newPlayerStats = syncActiveShipStats(newPlayerStats);
            newPlayerStats.cargo = calculateCurrentCargo(prev.inventory);
            toast({ title: "Active Ship Changed", description: `The ${activeShip.name} is now your active vessel.` });
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);
    
    return {
        isGeneratingBio,
        handleSetAvatar,
        handleGenerateBio,
        setPlayerName,
        updateTraderBio,
        handleResetGame,
        handleRefuel,
        handleRepairShip,
        handleHireCrew,
        handleFireCrew,
        handlePurchaseShip,
        handleSellShip,
        handleUpgradeShip,
        handleDowngradeShip,
        handleSetActiveShip,
    };
}
