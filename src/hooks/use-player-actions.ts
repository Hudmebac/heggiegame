import { useState, useTransition, useCallback } from 'react';
import type { GameState, PlayerStats, ShipForSale, CrewMember, CargoUpgrade, WeaponUpgrade, ShieldUpgrade, HullUpgrade, FuelUpgrade, SensorUpgrade, InventoryItem, PlayerShip } from '@/lib/types';
import { runAvatarGeneration } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { STATIC_ITEMS } from '@/lib/items';
import { SHIPS_FOR_SALE } from '@/lib/ships';
import { AVAILABLE_CREW } from '@/lib/crew';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades } from '@/lib/upgrades';
import { bios } from '@/lib/bios';


export function calculateCurrentCargo(inventory: InventoryItem[]): number {
    return inventory.reduce((acc, item) => {
        const staticItem = STATIC_ITEMS.find(si => si.name === item.name);
        return acc + (staticItem ? staticItem.cargoSpace * item.owned : 0);
    }, 0);
}

function syncActiveShipStats(playerStats: PlayerStats): PlayerStats {
    if (!playerStats.fleet || playerStats.fleet.length === 0) {
        // This case should ideally not happen if initialShip is always present
        return playerStats;
    }

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

    // Preserve current values if they are within new limits
    newStats.cargo = Math.min(newStats.cargo || 0, newStats.maxCargo);
    newStats.shipHealth = Math.min(newStats.shipHealth || 0, newStats.maxShipHealth);
    newStats.fuel = Math.min(newStats.fuel || 0, newStats.maxFuel);

    return newStats;
}

export const initialCrew: CrewMember[] = [AVAILABLE_CREW[0], AVAILABLE_CREW[1]];

export const initialShip: PlayerShip = {
    instanceId: Date.now(),
    shipId: 'shuttle-s',
    name: 'My Shuttle',
    cargoLevel: 1,
    weaponLevel: 1,
    shieldLevel: 1,
    hullLevel: 1,
    fuelLevel: 1,
    sensorLevel: 1,
};


export function usePlayerActions(gameState: GameState | null, setGameState: React.Dispatch<React.SetStateAction<GameState | null>>) {
    const { toast } = useToast();
    const [isGeneratingAvatar, startAvatarGenerationTransition] = useTransition();


    const handleGenerateAvatar = (description: string) => {
        startAvatarGenerationTransition(async () => {
            try {
                const result = await runAvatarGeneration({ description });
                setGameState(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        playerStats: {
                            ...prev.playerStats,
                            avatarUrl: result.avatarDataUri,
                        }
                    }
                });
                toast({ title: "Avatar Generated", description: "Your new captain's portrait is ready." });
            } catch (error) {
                console.error(error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({ variant: "destructive", title: "Avatar Generation Failed", description: errorMessage });
            }
        });
    };

    const handleGenerateBio = (name?: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const captainName = name || prev.playerStats.name;
            const randomBio = bios[Math.floor(Math.random() * bios.length)];
            const newBio = randomBio.replace(/{Captain}/g, captainName);

            toast({ title: "Bio Generated", description: "Your captain's story has been updated." });

            return {
                ...prev,
                playerStats: { ...prev.playerStats, bio: newBio }
            };
        });
    };

    const setPlayerName = (name: string) => {
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
    };


    const handleRefuel = () => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;

            const fuelNeeded = prev.playerStats.maxFuel - prev.playerStats.fuel;
            if (fuelNeeded <= 0) {
                toastMessage = { title: "Refuel Not Needed", description: "Fuel tank is already full." };
                return prev;
            }

            const fuelPrice = 2; // credits per unit
            const totalCost = fuelNeeded * fuelPrice;

            if (prev.playerStats.netWorth < totalCost) {
                toastMessage = { variant: "destructive", title: "Refuel Failed", description: `Not enough credits. You need ${totalCost}¢.` };
                return prev;
            }

            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - totalCost,
                fuel: prev.playerStats.maxFuel,
            };

            toastMessage = { title: "Refuel Complete", description: `You spent ${totalCost}¢ to refuel your ship.` };

            return { ...prev, playerStats: newPlayerStats };
        });
        if (toastMessage) {
            setTimeout(() => toast(toastMessage!), 0);
        }
    };

    const handleRepairShip = () => {
        let toastMessage: { title: string, description: string, variant?: 'destructive' } | null = null;
        setGameState(prev => {
            if (!prev) return null;
            // System data is needed for repair cost calculation, this hook shouldn't import Systems
            // This calculation should potentially be done in the main provider or a different hook
            // For now, simplifying repair cost
            const damageToRepair = prev.playerStats.maxShipHealth - prev.playerStats.shipHealth;
            if (damageToRepair <= 0) {
                toastMessage = { title: "Repairs Not Needed", description: "Ship integrity is at 100%." };
                return prev;
            }

            const baseRepairPricePerPoint = 50;
            // const currentSystem = SYSTEMS.find(s => s.name === prev.currentSystem); // Removed direct SYSTEMS import
            // Simplified cost calculation for now
            const totalCost = Math.round(damageToRepair * baseRepairPricePerPoint);


            if (prev.playerStats.netWorth < totalCost) {
                toastMessage = { variant: "destructive", title: "Repairs Failed", description: `Not enough credits. You need ${totalCost}¢.` };
                return prev;
            }

            const newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - totalCost,
                shipHealth: prev.playerStats.maxShipHealth,
            };

            toastMessage = { title: "Repairs Complete", description: `You spent ${totalCost}¢ to restore your ship\'s hull.` };

            return { ...prev, playerStats: newPlayerStats };
        });
        if (toastMessage) {
            setTimeout(() => toast(toastMessage!), 0);
        }
    };

    const handleUpgradeShip = (shipInstanceId: number, upgradeType: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor') => {
        setGameState(prev => {
            if (!prev) return null;

            const fleet = [...prev.playerStats.fleet];
            const shipIndex = fleet.findIndex(s => s.instanceId === shipInstanceId);
            if (shipIndex === -1) {
                toast({ variant: "destructive", title: "Error", description: "Ship not found in fleet." });
                return prev;
            }

            const shipToUpgrade = { ...fleet[shipIndex] };

            let cost = 0;
            let toastTitle = "Upgrade Failed";
            let toastDescription = "An unknown error occurred.";

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

            const currentTier = upgradeInfo.levels[upgradeInfo.current - 1];
            const nextTier = upgradeInfo.levels[upgradeInfo.current];
            cost = nextTier.cost - (currentTier?.cost || 0);

            if (prev.playerStats.netWorth < cost) {
                toast({ variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` });
                return prev;
            }

            (shipToUpgrade as any)[`${upgradeType}Level`] += 1;

            toastTitle = `${upgradeType.charAt(0).toUpperCase() + upgradeType.slice(1)} Upgraded!`;
            toastDescription = `Your ${shipToUpgrade.name}\'s ${upgradeType} is now Mk. ${shipToUpgrade[upgradeType + "Level" as keyof PlayerShip]}.`;

            fleet[shipIndex] = shipToUpgrade;
            let newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth - cost,
                fleet
            };

            // If the upgraded ship is the active one, sync stats
            if (shipIndex === 0) {
                newPlayerStats = syncActiveShipStats(newPlayerStats);
            }

            toast({ title: toastTitle, description: toastDescription });
            return { ...prev, playerStats: newPlayerStats };
        });
    };

    const handleDowngradeShip = (shipInstanceId: number, upgradeType: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor') => {
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

            const currentTier = upgradeInfo.levels[upgradeInfo.current - 1];
            const prevTier = upgradeInfo.levels[upgradeInfo.current - 2];
            const refund = Math.round((currentTier.cost - prevTier.cost) * 0.7);

            (shipToDowngrade as any)[`${upgradeType}Level`] -= 1;

            fleet[shipIndex] = shipToDowngrade;
            let newPlayerStats = {
                ...prev.playerStats,
                netWorth: prev.playerStats.netWorth + refund,
                fleet
            };

            if (shipIndex === 0) {
                newPlayerStats = syncActiveShipStats(newPlayerStats);
            }

            toast({ title: "Downgrade Successful!