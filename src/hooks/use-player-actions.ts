

'use client';

import { useCallback, useTransition } from 'react';
import type { GameState, PlayerStats, ShipForSale, CrewMember, PlayerShip, Career, FactionId } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { SHIPS_FOR_SALE, initialShip } from '@/lib/ships';
import { AVAILABLE_CREW } from '@/lib/crew';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades, droneUpgrades, powerCoreUpgrades, advancedUpgrades, AdvancedToggleableUpgrade } from '@/lib/upgrades';
import { bios } from '@/lib/bios';
import { calculateCurrentCargo, calculateShipValue, calculateCargoValue, syncActiveShipStats } from '@/lib/utils';
import { redeemPromoCode } from '@/app/actions';
import { CAREER_DATA } from '@/lib/careers';
import { FACTIONS_DATA } from '@/lib/factions';


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
                setTimeout(() => toast({ title: "Bio Generated", description: "Your captain's story has been updated." }), 0);
                return { ...prev, playerStats: { ...prev.playerStats, bio: newBio } };
            });
        });
    }, [setGameState, toast]);
    
    const setPlayerBio = useCallback((bio: string) => {
        setGameState(prev => {
            if (!prev) return null;
            return { ...prev, playerStats: { ...prev.playerStats, bio } };
        });
    }, [setGameState]);

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
        setTimeout(() => toast({
            title: "Game Resetting...",
            description: "Wiping all progress. A new adventure awaits!",
        }), 0);
        localStorage.removeItem('heggieGameState');
        setGameState(null);
    }, [toast, setGameState]);

    const handleRefuel = useCallback(() => {
        setGameState(prev => {
            if (!prev) return null;
            const fuelNeeded = prev.playerStats.maxFuel - prev.playerStats.fuel;
            if (fuelNeeded <= 0) {
                setTimeout(() => toast({ title: "Refuel Not Needed", description: "Fuel tank is already full." }), 0);
                return prev;
            }
            const fuelPrice = 2; // credits per unit
            const totalCost = fuelNeeded * fuelPrice;
            if (prev.playerStats.netWorth < totalCost) {
                setTimeout(() => toast({ variant: "destructive", title: "Refuel Failed", description: `Not enough credits. You need ${totalCost}¢.` }), 0);
                return prev;
            }
            const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - totalCost, fuel: prev.playerStats.maxFuel, };
            setTimeout(() => toast({ title: "Refuel Complete", description: `You spent ${totalCost}¢ to refuel your ship.` }), 0);
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleRepairShip = useCallback(() => {
        setGameState(prev => {
            if (!prev) return null;
            const damageToRepair = prev.playerStats.maxShipHealth - prev.playerStats.shipHealth;
            if (damageToRepair <= 0) {
                setTimeout(() => toast({ title: "Repairs Not Needed", description: "Ship integrity is at 100%." }), 0);
                return prev;
            }
            const baseRepairPricePerPoint = 50;
            const insuranceMultiplier = prev.playerStats.insurance.ship ? 0.5 : 1.0;
            const totalCost = Math.round(damageToRepair * baseRepairPricePerPoint * insuranceMultiplier);

            if (prev.playerStats.netWorth < totalCost) {
                setTimeout(() => toast({ variant: "destructive", title: "Repairs Failed", description: `Not enough credits. You need ${totalCost}¢.` }), 0);
                return prev;
            }
            
            const newFleet = [...prev.playerStats.fleet];
            const activeShipIndex = 0;
            const activeShip = { ...newFleet[activeShipIndex] };
            activeShip.health = prev.playerStats.maxShipHealth;
            activeShip.status = 'operational';
            newFleet[activeShipIndex] = activeShip;

            let newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - totalCost, fleet: newFleet };
            newPlayerStats = syncActiveShipStats(newPlayerStats);

            const toastDescription = `You spent ${totalCost}¢ to restore your ship's hull.` + (insuranceMultiplier < 1 ? ' (50% insurance discount applied)' : '');
            setTimeout(() => toast({ title: "Repairs Complete", description: toastDescription }), 0);
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleRepairFleetShip = useCallback((instanceId: number) => {
         setGameState(prev => {
            if (!prev) return null;

            const shipIndex = prev.playerStats.fleet.findIndex(s => s.instanceId === instanceId);
            if(shipIndex === -1) return prev;
            
            const fleet = [...prev.playerStats.fleet];
            const shipToRepair = {...fleet[shipIndex]};
            const maxHealth = hullUpgrades[shipToRepair.hullLevel - 1]?.health || 100;

            const damageToRepair = maxHealth - shipToRepair.health;
            if (damageToRepair <= 0) return prev;

            const baseRepairPricePerPoint = 50;
            const insuranceMultiplier = prev.playerStats.insurance.ship ? 0.5 : 1.0;
            const totalCost = Math.round(damageToRepair * baseRepairPricePerPoint * insuranceMultiplier);

            if (prev.playerStats.netWorth < totalCost) {
                setTimeout(() => toast({ variant: "destructive", title: "Repairs Failed", description: `Not enough credits. You need ${totalCost}¢.` }), 0);
                return prev;
            }

            shipToRepair.health = maxHealth;
            shipToRepair.status = 'operational';
            fleet[shipIndex] = shipToRepair;

            let newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - totalCost, fleet: fleet };
            if(instanceId === newPlayerStats.fleet[0].instanceId) {
                newPlayerStats = syncActiveShipStats(newPlayerStats);
            }

            const toastDescription = `You spent ${totalCost}¢ to restore the ${shipToRepair.name}'s hull.` + (insuranceMultiplier < 1 ? ' (50% insurance discount applied)' : '');
            setTimeout(() => toast({ title: "Repairs Complete", description: toastDescription }), 0);
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleHireCrew = useCallback((crewId: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const crewToHire = AVAILABLE_CREW.find(c => c.id === crewId);
            if (!crewToHire) return prev;
            if (prev.playerStats.netWorth < crewToHire.hiringFee) {
                setTimeout(() => toast({ variant: "destructive", title: "Hiring Failed", description: "Not enough credits." }), 0);
                return prev;
            }
            const newPlayerStats = { ...prev.playerStats, netWorth: prev.playerStats.netWorth - crewToHire.hiringFee };
            const newCrew = [...prev.crew, crewToHire];
            setTimeout(() => toast({ title: "Crew Member Hired", description: `${crewToHire.name} has joined your crew.` }), 0);
            return { ...prev, playerStats: newPlayerStats, crew: newCrew };
        });
    }, [setGameState, toast]);

    const handleFireCrew = useCallback((crewId: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const crewToFire = prev.crew.find(c => c.id === crewId);
            if (!crewToFire) return prev;
            const newCrew = prev.crew.filter(c => c.id !== crewId);
            setTimeout(() => toast({ title: "Crew Member Fired", description: `${crewToFire.name} has left your crew.` }), 0);
            return { ...prev, crew: newCrew };
        });
    }, [setGameState, toast]);

    const handlePurchaseShip = useCallback((ship: ShipForSale) => {
        setGameState(prev => {
            if (!prev) return null;
            if (prev.playerStats.netWorth < ship.cost) {
                setTimeout(() => toast({ variant: "destructive", title: "Purchase Failed", description: "Not enough credits." }), 0);
                return prev;
            }
            const newShip: PlayerShip = {
                instanceId: Date.now(),
                shipId: ship.id,
                name: ship.name,
                cargoLevel: 1, weaponLevel: 1, shieldLevel: 1, hullLevel: 1, fuelLevel: 1, sensorLevel: 1, droneLevel: 1,
                powerCoreLevel: 1, overdriveEngine: false, warpStabilizer: false, stealthPlating: false, targetingMatrix: false, anomalyAnalyzer: false, fabricatorBay: false,
                gravAnchor: false, aiCoreInterface: false, bioDomeModule: false, flakDispensers: false, boardingTubeSystem: false, terraformToolkit: false, thermalRegulator: false, diplomaticUplink: false,
                health: hullUpgrades[0].health,
                status: 'operational',
            };
            const newCash = prev.playerStats.netWorth - ship.cost;
            const newPlayerStats = { 
                ...prev.playerStats, 
                netWorth: newCash, 
                fleet: [...prev.playerStats.fleet, newShip],
                cashInHandHistory: [...prev.playerStats.cashInHandHistory, newCash].slice(-50),
                events: [...prev.playerStats.events, {
                    id: `evt_purchase_${Date.now()}`,
                    timestamp: Date.now(),
                    type: 'Purchase',
                    description: `Purchased a new ship: ${ship.name}.`,
                    value: -ship.cost,
                    reputationChange: 1,
                    isMilestone: true,
                }],
            };
            setTimeout(() => toast({ title: "Ship Purchased!", description: `The ${ship.name} has been added to your fleet.` }), 0);
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleSellShip = useCallback((shipInstanceId: number) => {
        setGameState(prev => {
            if (!prev || prev.playerStats.fleet.length <= 1) {
                setTimeout(() => toast({ variant: "destructive", title: "Sale Failed", description: "You cannot sell your last ship." }), 0);
                return prev;
            }
            const shipIndex = prev.playerStats.fleet.findIndex(s => s.instanceId === shipInstanceId);
            if (shipIndex === -1) return prev;

            const shipToSell = prev.playerStats.fleet[shipIndex];
            const salePrice = Math.round(calculateShipValue(shipToSell) * 0.7);
            const newFleet = prev.playerStats.fleet.filter(s => s.instanceId !== shipInstanceId);
            const newCash = prev.playerStats.netWorth + salePrice;
            let newPlayerStats = { 
                ...prev.playerStats, 
                netWorth: newCash, 
                fleet: newFleet,
                cashInHandHistory: [...prev.playerStats.cashInHandHistory, newCash].slice(-50),
            };
            
            if (shipIndex === 0) {
                newPlayerStats = syncActiveShipStats(newPlayerStats);
                newPlayerStats.cargo = calculateCurrentCargo(prev.inventory);
            }
            
            setTimeout(() => toast({ title: "Ship Sold", description: `You sold the ${shipToSell.name} for ${salePrice.toLocaleString()}¢.` }), 0);
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleUpgradeShip = useCallback((shipInstanceId: number, upgradeType: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor' | 'drone' | 'powerCore') => {
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
                drone: { levels: droneUpgrades, current: shipToUpgrade.droneLevel },
                powerCore: { levels: powerCoreUpgrades, current: shipToUpgrade.powerCoreLevel },
            };

            const upgradeInfo = upgradeMap[upgradeType];
            if (upgradeInfo.current >= upgradeInfo.levels.length) {
                setTimeout(() => toast({ variant: "destructive", title: "Upgrade Failed", description: "Already at max level." }), 0);
                return prev;
            }
            const currentTierCost = upgradeInfo.levels[upgradeInfo.current - 1]?.cost || 0;
            const nextTierCost = upgradeInfo.levels[upgradeInfo.current].cost;
            const cost = nextTierCost - currentTierCost;

            if (prev.playerStats.netWorth < cost) {
                setTimeout(() => toast({ variant: "destructive", title: "Upgrade Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` }), 0);
                return prev;
            }

            (shipToUpgrade as any)[`${upgradeType}Level`] += 1;
            fleet[shipIndex] = shipToUpgrade;
            const newCash = prev.playerStats.netWorth - cost;
            let newPlayerStats = { 
                ...prev.playerStats, 
                netWorth: newCash, 
                fleet,
                cashInHandHistory: [...prev.playerStats.cashInHandHistory, newCash].slice(-50),
            };

            if (shipIndex === 0) newPlayerStats = syncActiveShipStats(newPlayerStats);
            
            setTimeout(() => toast({ title: `${upgradeType.charAt(0).toUpperCase() + upgradeType.slice(1)} Upgraded!`, description: `Your ${shipToUpgrade.name}'s ${upgradeType} is now Mk. ${shipToUpgrade[`${upgradeType}Level` as keyof PlayerShip]}.` }), 0);
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleDowngradeShip = useCallback((shipInstanceId: number, upgradeType: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor' | 'drone' | 'powerCore') => {
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
                drone: { levels: droneUpgrades, current: shipToDowngrade.droneLevel },
                powerCore: { levels: powerCoreUpgrades, current: shipToDowngrade.powerCoreLevel },
            };
            const upgradeInfo = upgradeMap[upgradeType];
            if (upgradeInfo.current <= 1) {
                setTimeout(() => toast({ variant: "destructive", title: "Downgrade Failed", description: "Cannot downgrade further." }), 0);
                return prev;
            }

            if (upgradeType === 'cargo' && shipIndex === 0) { // Only check cargo for active ship
                const newMaxCargo = upgradeInfo.levels[upgradeInfo.current - 2].capacity;
                const currentCargo = calculateCurrentCargo(prev.inventory);
                if (currentCargo > newMaxCargo) {
                    setTimeout(() => toast({ variant: "destructive", title: "Downgrade Failed", description: `Cannot downgrade cargo hold, you have too much cargo (${currentCargo.toFixed(2)}t / ${newMaxCargo}t).` }), 0);
                    return prev;
                }
            }

            const currentTierCost = upgradeInfo.levels[upgradeInfo.current - 1].cost;
            const prevTierCost = upgradeInfo.levels[upgradeInfo.current - 2].cost;
            const refund = Math.round((currentTierCost - prevTierCost) * 0.7);

            (shipToDowngrade as any)[`${upgradeType}Level`] -= 1;
            fleet[shipIndex] = shipToDowngrade;
            const newCash = prev.playerStats.netWorth + refund;
            let newPlayerStats = { 
                ...prev.playerStats, 
                netWorth: newCash, 
                fleet,
                cashInHandHistory: [...prev.playerStats.cashInHandHistory, newCash].slice(-50),
            };
            if (shipIndex === 0) newPlayerStats = syncActiveShipStats(newPlayerStats);
            
            setTimeout(() => toast({ title: "Downgrade Successful!", description: `You received ${refund.toLocaleString()}¢ for selling the old component.` }), 0);
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handlePurchaseAdvancedModule = useCallback((shipInstanceId: number, moduleId: AdvancedToggleableUpgrade['id']) => {
        setGameState(prev => {
            if (!prev) return null;
            
            const moduleData = advancedUpgrades.find(m => m.id === moduleId);
            if (!moduleData) return prev;

            const fleet = [...prev.playerStats.fleet];
            const shipIndex = fleet.findIndex(s => s.instanceId === shipInstanceId);
            if (shipIndex === -1) return prev;

            const shipToUpgrade = { ...fleet[shipIndex] };

            if (shipToUpgrade[moduleId]) {
                 setTimeout(() => toast({ title: "Already Installed", description: `This ship already has the ${moduleData.name} installed.` }), 0);
                 return prev;
            }

            if (prev.playerStats.netWorth < moduleData.cost) {
                setTimeout(() => toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits. You need ${moduleData.cost.toLocaleString()}¢.` }), 0);
                return prev;
            }
            
            shipToUpgrade[moduleId] = true;
            fleet[shipIndex] = shipToUpgrade;
            const newCash = prev.playerStats.netWorth - moduleData.cost;
            let newPlayerStats = { 
                ...prev.playerStats, 
                netWorth: newCash, 
                fleet,
                cashInHandHistory: [...prev.playerStats.cashInHandHistory, newCash].slice(-50),
            };
            
            if (shipIndex === 0) newPlayerStats = syncActiveShipStats(newPlayerStats);

            setTimeout(() => toast({ title: "Module Installed!", description: `The ${moduleData.name} has been fitted to your ${shipToUpgrade.name}.` }), 0);
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
            setTimeout(() => toast({ title: "Active Ship Changed", description: `The ${activeShip.name} is now your active vessel.` }), 0);
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handlePurchaseInsurance = useCallback((type: 'health' | 'cargo' | 'ship') => {
        setGameState(prev => {
            if (!prev) return null;
            
            const activeShip = prev.playerStats.fleet[0];
            const shipValue = activeShip ? calculateShipValue(activeShip) : 0;
            const cargoValue = calculateCargoValue(prev.inventory, prev.marketItems);

            let cost = 0;
            switch(type) {
                case 'health': cost = Math.round(prev.playerStats.netWorth * 0.10); break;
                case 'ship': cost = Math.round(prev.playerStats.netWorth * 0.10 + shipValue * 0.15); break;
                case 'cargo': cost = Math.round(prev.playerStats.netWorth * 0.05 + cargoValue * 0.10); break;
            }

            if (prev.playerStats.netWorth < cost) {
                 setTimeout(() => toast({ variant: "destructive", title: "Purchase Failed", description: `Not enough credits. You need ${cost.toLocaleString()}¢.` }), 0);
                 return prev;
            }

            const newCash = prev.playerStats.netWorth - cost;
            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: newCash,
                cashInHandHistory: [...prev.playerStats.cashInHandHistory, newCash].slice(-50),
                insurance: {
                    ...prev.playerStats.insurance,
                    [type]: true,
                }
            };
            
            setTimeout(() => toast({ title: "Insurance Purchased!", description: `Your new ${type} insurance policy is now active.` }), 0);
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);
    
    const handleRedeemPromoCode = useCallback(async (code: string) => {
        if (!code) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please enter a promo code.",
            });
            return;
        }

        if (gameState?.playerStats.usedPromoCodes.includes(code.toUpperCase())) {
            toast({
                variant: "destructive",
                title: "Code Already Used",
                description: "You have already redeemed this promo code.",
            });
            return;
        }

        try {
            const result = await redeemPromoCode(code);

            if ('error' in result) {
                toast({
                    variant: "destructive",
                    title: "Invalid Code",
                    description: result.error,
                });
                return;
            }

            setGameState(prev => {
                if (!prev) return null;
                const newCash = prev.playerStats.netWorth + result.tokens;
                const newPlayerStats = {
                    ...prev.playerStats,
                    netWorth: newCash,
                    usedPromoCodes: [...prev.playerStats.usedPromoCodes, code.toUpperCase()],
                    cashInHandHistory: [...prev.playerStats.cashInHandHistory, newCash].slice(-50),
                };
                return { ...prev, playerStats: newPlayerStats };
            });

            toast({
                title: "Success!",
                description: `🎉 You've received ${result.tokens.toLocaleString()} tokens!`,
            });

        } catch (e) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred while redeeming the code.",
            });
        }
    }, [gameState, setGameState, toast]);
    
    const handleChangeCareerLogic = (currentState: GameState, newCareer: Career): GameState => {
        const careerData = CAREER_DATA.find(c => c.id === newCareer);
        if (!careerData) return currentState;

        const newPlayerStats: PlayerStats = {
            ...currentState.playerStats,
            career: newCareer,
            // Reset career-specific missions and progress
            tradeContracts: [],
            taxiMissions: [],
            escortMissions: [],
            militaryMissions: [],
            diplomaticMissions: [],
            inspiration: careerData?.id === 'Heggie Contractor' ? currentState.playerStats.inspiration : 0,
            influence: careerData?.startingInfluence || 0,
        };
        
        return { ...currentState, playerStats: newPlayerStats };
    };

    const handlePayToChangeCareer = useCallback((newCareer: Career) => {
        setGameState(prev => {
            if (!prev) return null;
            const cost = Math.floor(prev.playerStats.netWorth * 0.25);
            if (prev.playerStats.netWorth < cost) {
                setTimeout(() => toast({ variant: "destructive", title: "Cannot Afford Career Change", description: `You need ${cost.toLocaleString()}¢ to change your career.` }), 0);
                return prev;
            }
            const newCash = prev.playerStats.netWorth - cost;
            const stateWithCostDeducted = {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: newCash,
                    cashInHandHistory: [...prev.playerStats.cashInHandHistory, newCash].slice(-50),
                    events: [
                        ...prev.playerStats.events,
                        {
                            id: `evt_${Date.now()}_career_change`,
                            timestamp: Date.now(),
                            type: 'Career',
                            description: `Changed career to ${newCareer}.`,
                            value: -cost,
                            reputationChange: 0,
                            isMilestone: true,
                        },
                    ],
                }
            };

            const finalState = handleChangeCareerLogic(stateWithCostDeducted, newCareer);
            
            setTimeout(() => toast({ title: "Career Path Changed!", description: `You spent ${cost.toLocaleString()}¢ to become a ${newCareer}.` }), 0);
            return finalState;
        });
    }, [setGameState, toast]);

    const handleChangeCareer = useCallback((newCareer: Career) => {
        setGameState(prev => {
            if (!prev) return null;
            const finalState = handleChangeCareerLogic(prev, newCareer);
            setTimeout(() => toast({ title: "Career Path Changed!", description: `You have successfully proven your aptitude and become a ${newCareer}.` }), 0);
            return finalState;
        });
    }, [setGameState, toast]);

    const handleJoinFaction = useCallback((factionId: FactionId) => {
        setGameState(prev => {
            if (!prev) return null;
    
            const cost = factionId === 'Independent' ? 0 : 50000;
    
            if (prev.playerStats.netWorth < cost) {
                setTimeout(() => toast({ variant: "destructive", title: "Allegiance Failed", description: "Insufficient funds to pay the allegiance fee." }), 0);
                return prev;
            }
    
            const newFactionData = FACTIONS_DATA.find(f => f.id === factionId);
            if (!newFactionData) return prev;
    
            const newFactionReputation = { ...prev.playerStats.factionReputation };
            
            // Reset all reputations to 0
            for (const key in newFactionReputation) {
                newFactionReputation[key as FactionId] = 0;
            }
            // Set self to 100
            newFactionReputation[factionId] = 100;
            
            // Apply new alliance modifiers
            for (const [alliedFaction, repChange] of Object.entries(newFactionData.alliances)) {
                newFactionReputation[alliedFaction as FactionId] = (newFactionReputation[alliedFaction as FactionId] || 0) + repChange;
            }
            
            const repChange = 10;
            const newCash = prev.playerStats.netWorth - cost;
            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: newCash,
                faction: factionId,
                factionReputation: newFactionReputation,
                reputation: prev.playerStats.reputation + repChange,
                cashInHandHistory: [...prev.playerStats.cashInHandHistory, newCash].slice(-50),
                events: [
                    ...prev.playerStats.events,
                    {
                        id: `evt_${Date.now()}_faction_join`,
                        timestamp: Date.now(),
                        type: 'Faction',
                        description: `Pledged allegiance to ${newFactionData.name}.`,
                        value: -cost,
                        reputationChange: repChange,
                        isMilestone: true,
                    },
                ],
            };
    
            setTimeout(() => toast({ title: "Allegiance Pledged!", description: `You are now aligned with ${newFactionData.name}.` }), 0);
    
            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleShareToFacebook = useCallback(() => {
        setGameState(prev => {
            if (!prev) return null;

            const now = Date.now();
            const lastShare = prev.playerStats.lastFacebookShare || 0;
            const cooldown = 5 * 60 * 1000; // 5 minutes

            if (now - lastShare < cooldown) {
                const remaining = Math.ceil((cooldown - (now - lastShare)) / 1000);
                setTimeout(() => toast({
                    variant: "destructive",
                    title: "Share Cooldown",
                    description: `You can share again in ${Math.floor(remaining / 60)}m ${remaining % 60}s.`
                }), 0);
                return prev;
            }

            const reward = 1000000;
            const newCash = prev.playerStats.netWorth + reward;
            const newPlayerStats: PlayerStats = {
                ...prev.playerStats,
                netWorth: newCash,
                cashInHandHistory: [...prev.playerStats.cashInHandHistory, newCash].slice(-50),
                lastFacebookShare: now,
            };

            const appUrl = 'https://heggiegame.netlify.app/captain';
            const quote = `I'm playing HEGGIE - Space Game 🪐 I'm a ${newPlayerStats.career}, and my net worth’s already a cosmic-sized ${newPlayerStats.netWorth.toLocaleString()}¢. Think you can top that?\n\n🎮 Start your own adventure now: 🌍 https://heggiegame.netlify.app/captain\n\n💥 Use promo code STARTERBOOST for a boost of 100,000,000¢ — it’s my little gift to you.`;
            const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(quote)}`;
            
            window.open(facebookShareUrl, '_blank', 'noopener,noreferrer');

            setTimeout(() => toast({
                title: "Thanks for sharing!",
                description: `You've received ${reward.toLocaleString()} tokens!`
            }), 0);

            return { ...prev, playerStats: newPlayerStats };
        });
    }, [setGameState, toast]);

    const handleMachinistMinigameScore = useCallback((points: number) => {
        setGameState(prev => {
          if (!prev) return null;
          if (points > 0) {
            toast({ title: "Calibration Successful", description: `You earned ${points.toLocaleString()}¢ for improving factory efficiency.`});
          }
          return {
            ...prev,
            playerStats: {
              ...prev.playerStats,
              netWorth: prev.playerStats.netWorth + points
            }
          }
        });
    }, [setGameState, toast]);

    const handleVaultBreachMinigameScore = useCallback((points: number) => {
        setGameState(prev => {
            if (!prev) return null;
            if (points > 0) {
                toast({ title: "Vault Secured", description: `You earned ${points.toLocaleString()}¢ for repelling the breach.`});
            }
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth + points,
                }
            };
        });
    }, [setGameState, toast]);

    const handleBlueprintScrambleScore = useCallback((points: number) => {
        setGameState(prev => {
            if (!prev) return null;
            if (points > 0) {
                toast({ title: "Blueprint Assembled", description: `You earned ${points.toLocaleString()}¢ for your design prowess.`});
            }
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth + points,
                }
            };
        });
    }, [setGameState, toast]);

    const handleMixAndMatchMinigameScore = useCallback((points: number) => {
        setGameState(prev => {
            if (!prev) return null;
            
            if (points > 0) {
                toast({ title: "Shift Complete!", description: `You earned ${points.toLocaleString()}¢ in tips for your excellent service.`});
            }

            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth + points,
                }
            };
        });
    }, [setGameState, toast]);

    const handleMarketFrenzyMinigameScore = useCallback((points: number) => {
        setTimeout(() => {
            setGameState(prev => {
                if (!prev) return null;
                
                if (points > 0) {
                    toast({ title: "Trade Session Ended", description: `You made a profit of ${points.toLocaleString()}¢.`});
                }
    
                return {
                    ...prev,
                    playerStats: {
                        ...prev.playerStats,
                        netWorth: prev.playerStats.netWorth + points,
                    }
                };
            });
        }, 0)
    }, [setGameState, toast]);

    const handleHolotagMinigameScore = useCallback((points: number) => {
        setGameState(prev => {
            if (!prev) return null;
            if (points > 0) {
                toast({ title: "Simulation Complete", description: `You earned ${points.toLocaleString()}¢ for your performance.`});
            }
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth + points,
                }
            };
        });
    }, [setGameState, toast]);

    const handleKeypadCrackerMinigameScore = useCallback((points: number) => {
        setGameState(prev => {
            if (!prev) return null;
            if (points > 0) {
                toast({ title: "System Bypassed", description: `You earned ${points.toLocaleString()}¢ for your quick thinking.`});
            }
            return {
                ...prev,
                playerStats: {
                    ...prev.playerStats,
                    netWorth: prev.playerStats.netWorth + points,
                }
            };
        });
    }, [setGameState, toast]);

    return {
        isGeneratingBio,
        handleSetAvatar,
        handleGenerateBio,
        setPlayerName,
        setPlayerBio,
        updateTraderBio,
        handleResetGame,
        handleRefuel,
        handleRepairShip,
        handleRepairFleetShip,
        handleHireCrew,
        handleFireCrew,
        handlePurchaseShip,
        handleSellShip,
        handleUpgradeShip,
        handleDowngradeShip,
        handleSetActiveShip,
        handlePurchaseInsurance,
        handlePurchaseAdvancedModule,
        handleRedeemPromoCode,
        handlePayToChangeCareer,
        handleChangeCareer,
        handleJoinFaction,
        handleShareToFacebook,
        handleMachinistMinigameScore,
        handleVaultBreachMinigameScore,
        handleBlueprintScrambleScore,
        handleMixAndMatchMinigameScore,
        handleMarketFrenzyMinigameScore,
        handleHolotagMinigameScore,
        handleKeypadCrackerMinigameScore,
    };
}
