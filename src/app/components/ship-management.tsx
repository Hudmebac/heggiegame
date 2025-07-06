'use client';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Fuel, Warehouse, Shield, BadgeCheck, MapPin, Wrench, ShieldCheck, Ship, Loader2, HeartPulse, AlertTriangle, GitCommitHorizontal, Users, Navigation, Crosshair, Handshake, ShoppingCart, Briefcase, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SHIPS_FOR_SALE } from '@/lib/ships';
import Link from 'next/link';

const StatDisplay = ({ icon, title, value, max, unit, progressColorClass }: { icon: React.ReactNode, title: string, value: number, max: number, unit: string, progressColorClass: string }) => (
  <div>
    <div className="flex justify-between items-center mb-1 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        {icon}
        <span>{title}</span>
      </div>
      <span className="font-mono text-foreground">{value} / {max}{unit}</span>
    </div>
    <Progress value={(value / max) * 100} className="h-2 [&>div]:bg-gradient-to-r" indicatorClassName={progressColorClass} />
  </div>
);


export default function ShipManagement() {
  const { gameState, handleRefuel, handleRepairShip, handleUpgradeShip, handleDowngradeShip, handlePurchaseShip, cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades } = useGame();

  if (!gameState) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }
  
  const { playerStats: stats, currentSystem: currentSystemName, systems, crew } = gameState;
  const currentSystem = systems.find(s => s.name === currentSystemName);

  // Refuel Logic
  const fuelPrice = 2; // credits per unit
  const fuelNeeded = stats.maxFuel - stats.fuel;
  const refuelCost = fuelNeeded * fuelPrice;
  const canAffordRefuel = stats.netWorth >= refuelCost;
  const needsRefuel = fuelNeeded > 0;

  // Repair Logic
  const damageToRepair = stats.maxShipHealth - stats.shipHealth;
  const needsRepair = damageToRepair > 0;
  const baseRepairPricePerPoint = 50;
  const economyModifiers = { 'Industrial': 0.8, 'High-Tech': 0.9, 'Refinery': 1.1, 'Extraction': 1.2, 'Agricultural': 1.3 };
  const securityModifiers = { 'High': 0.9, 'Medium': 1.0, 'Low': 1.2, 'Anarchy': 1.5 };
  const economyMod = currentSystem ? economyModifiers[currentSystem.economy] : 1;
  const securityMod = currentSystem ? securityModifiers[currentSystem.security] : 1;
  const repairCost = Math.round(damageToRepair * baseRepairPricePerPoint * economyMod * securityMod);
  const canAffordRepair = stats.netWorth >= repairCost;
  const isHealthCritical = stats.shipHealth < 15;


  // Upgrade logic
  const currentCargoTierIndex = cargoUpgrades.findIndex(u => u.capacity === stats.maxCargo);
  const currentCargoTier = cargoUpgrades[currentCargoTierIndex];
  const nextCargoUpgrade = currentCargoTierIndex < cargoUpgrades.length - 1 ? cargoUpgrades[currentCargoTierIndex + 1] : null;

  const currentWeaponTierIndex = weaponUpgrades.findIndex(u => u.level === stats.weaponLevel);
  const currentWeaponTier = weaponUpgrades[currentWeaponTierIndex];
  const nextWeaponUpgrade = currentWeaponTierIndex < weaponUpgrades.length - 1 ? weaponUpgrades[currentWeaponTierIndex + 1] : null;

  const currentShieldTierIndex = shieldUpgrades.findIndex(u => u.level === stats.shieldLevel);
  const currentShieldTier = shieldUpgrades[currentShieldTierIndex];
  const nextShieldUpgrade = currentShieldTierIndex < shieldUpgrades.length - 1 ? shieldUpgrades[currentShieldTierIndex + 1] : null;
    
  const currentHullTierIndex = hullUpgrades.findIndex(u => u.level === stats.hullLevel);
  const currentHullTier = hullUpgrades[currentHullTierIndex];
  const nextHullUpgrade = currentHullTierIndex < hullUpgrades.length - 1 ? hullUpgrades[currentHullTierIndex + 1] : null;

  const currentFuelTierIndex = fuelUpgrades.findIndex(u => u.level === stats.fuelLevel);
  const currentFuelTier = fuelUpgrades[currentFuelTierIndex];
  const nextFuelUpgrade = currentFuelTierIndex < fuelUpgrades.length - 1 ? fuelUpgrades[currentFuelTierIndex + 1] : null;
  
  const currentSensorTierIndex = sensorUpgrades.findIndex(u => u.level === stats.sensorLevel);
  const currentSensorTier = sensorUpgrades[currentSensorTierIndex];
  const nextSensorUpgrade = currentSensorTierIndex < sensorUpgrades.length - 1 ? sensorUpgrades[currentSensorTierIndex + 1] : null;

  const hasEngineer = crew.some(c => c.role === 'Engineer');
  const hasGunner = crew.some(c => c.role === 'Gunner');
  const hasNavigator = crew.some(c => c.role === 'Navigator');
  const hasNegotiator = crew.some(c => c.role === 'Negotiator');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-headline">
                <GitCommitHorizontal className="text-primary"/>
                Ship Status
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <StatDisplay 
                icon={<HeartPulse className="h-4 w-4 text-rose-400" />}
                title="Hull Integrity"
                value={stats.shipHealth}
                max={stats.maxShipHealth}
                unit="%"
                progressColorClass="from-rose-500 to-red-500"
            />
            <StatDisplay 
                icon={<Fuel className="h-4 w-4 text-amber-400" />}
                title="Fuel"
                value={stats.fuel}
                max={stats.maxFuel}
                unit=" SU"
                progressColorClass="from-amber-500 to-orange-500"
            />
            <StatDisplay 
                icon={<Warehouse className="h-4 w-4 text-sky-400" />}
                title="Cargo"
                value={stats.cargo}
                max={stats.maxCargo}
                unit="t"
                progressColorClass="from-sky-500 to-cyan-500"
            />
             <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    <span>Pirate Threat Level</span>
                </div>
                <span className="font-mono text-orange-400">{(stats.pirateRisk * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Current Location</span>
                </div>
                <span className="font-mono text-primary">{currentSystemName} System</span>
            </div>
            <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Insurance</span>
            </div>
                <span className={`font-mono text-sm flex items-center gap-1.5 ${stats.insurance ? 'text-green-400' : 'text-red-500'}`}>
                    {stats.insurance ? <BadgeCheck className="h-4 w-4" /> : null}
                    {stats.insurance ? 'Active' : 'Inactive'}
                </span>
            </div>
        </CardContent>
        </Card>
        <div className="space-y-6">
             <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-headline">
                        <Wrench className="text-primary"/> Starport Services
                    </CardTitle>
                    <CardDescription>Refuel, repair, and upgrade your vessel.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {isHealthCritical && (
                        <div className='p-3 rounded-md border border-destructive/50 bg-destructive/10 text-destructive-foreground flex items-start gap-3'>
                            <AlertTriangle className='h-5 w-5 mt-0.5 flex-shrink-0'/>
                            <div>
                                <h4 className='font-bold'>Critical Hull Damage!</h4>
                                <p className='text-xs'>Travel is not advised. Repair your ship immediately to avoid catastrophic failure.</p>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <p>Refuel Ship</p>
                        <Button onClick={handleRefuel} disabled={!needsRefuel || !canAffordRefuel}>
                          {needsRefuel ? `Refuel (${refuelCost.toLocaleString()}¢)` : 'Tank Full'}
                        </Button>
                    </div>
                    <div className="flex justify-between items-center">
                        <p>Repair Hull</p>
                         <Button onClick={handleRepairShip} disabled={!needsRepair || !canAffordRepair}>
                           {needsRepair ? `Repair (${repairCost.toLocaleString()}¢)` : 'No Damage'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-headline">
                        <Users className="text-primary"/> Crew Bonuses
                    </CardTitle>
                    <CardDescription>Active perks from your hired specialists.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    { !hasEngineer && !hasGunner && !hasNavigator && !hasNegotiator && (
                        <p className="text-muted-foreground">No active crew bonuses.</p>
                    )}
                    {hasEngineer && (
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-cyan-400" />
                            <div>
                                <span className="font-semibold">Engineer:</span>
                                <span className="text-muted-foreground"> 5% fuel efficiency bonus.</span>
                            </div>
                        </div>
                    )}
                    {hasGunner && (
                        <div className="flex items-center gap-2">
                            <Crosshair className="h-4 w-4 text-cyan-400" />
                            <div>
                                <span className="font-semibold">Gunner:</span>
                                <span className="text-muted-foreground"> Increased combat effectiveness.</span>
                            </div>
                        </div>
                    )}
                    {hasNavigator && (
                        <div className="flex items-center gap-2">
                           <Navigation className="h-4 w-4 text-cyan-400" />
                            <div>
                                <span className="font-semibold">Navigator:</span>
                                <span className="text-muted-foreground"> Reduced chance of high-threat encounters.</span>
                            </div>
                        </div>
                    )}
                    {hasNegotiator && (
                        <div className="flex items-center gap-2">
                           <Handshake className="h-4 w-4 text-cyan-400" />
                            <div>
                                <span className="font-semibold">Negotiator:</span>
                                <span className="text-muted-foreground"> Better outcomes when bribing pirates.</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-headline">
                        <ShieldCheck className="text-primary"/> Ship Outfitting
                    </CardTitle>
                    <CardDescription>Improve your vessel's capabilities.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p>Cargo Hold</p>
                            <p className="text-xs text-muted-foreground">Current: {stats.maxCargo}t Capacity</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentCargoTierIndex > 0 && (
                            <Button variant="outline" size="sm" onClick={() => handleDowngradeShip('cargo')}>Sell</Button>
                          )}
                          {nextCargoUpgrade ? (
                              <Button onClick={() => handleUpgradeShip('cargo')} disabled={stats.netWorth < (nextCargoUpgrade.cost - currentCargoTier.cost)}>
                                  Upgrade ({(nextCargoUpgrade.cost - currentCargoTier.cost).toLocaleString()}¢)
                              </Button>
                          ) : (
                              <Button disabled>Max Level</Button>
                          )}
                        </div>
                    </div>
                     <div className="flex justify-between items-center">
                        <div>
                            <p>Weapons System</p>
                            <p className="text-xs text-muted-foreground">Current: {currentWeaponTier?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           {currentWeaponTierIndex > 0 && (
                            <Button variant="outline" size="sm" onClick={() => handleDowngradeShip('weapon')}>Sell</Button>
                          )}
                          {nextWeaponUpgrade ? (
                              <Button onClick={() => handleUpgradeShip('weapon')} disabled={stats.netWorth < (nextWeaponUpgrade.cost - currentWeaponTier.cost)}>
                                  Upgrade ({(nextWeaponUpgrade.cost - currentWeaponTier.cost).toLocaleString()}¢)
                              </Button>
                          ) : (
                              <Button disabled>Max Level</Button>
                          )}
                        </div>
                    </div>
                     <div className="flex justify-between items-center">
                        <div>
                            <p>Shield Generator</p>
                            <p className="text-xs text-muted-foreground">Current: {currentShieldTier?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentShieldTierIndex > 0 && (
                            <Button variant="outline" size="sm" onClick={() => handleDowngradeShip('shield')}>Sell</Button>
                          )}
                          {nextShieldUpgrade ? (
                              <Button onClick={() => handleUpgradeShip('shield')} disabled={stats.netWorth < (nextShieldUpgrade.cost - currentShieldTier.cost)}>
                                  Upgrade ({(nextShieldUpgrade.cost - currentShieldTier.cost).toLocaleString()}¢)
                              </Button>
                          ) : (
                              <Button disabled>Max Level</Button>
                          )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p>Hull Integrity</p>
                            <p className="text-xs text-muted-foreground">Current: {currentHullTier?.name} ({stats.maxShipHealth} HP)</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentHullTierIndex > 0 && (
                            <Button variant="outline" size="sm" onClick={() => handleDowngradeShip('hull')}>Sell</Button>
                          )}
                          {nextHullUpgrade ? (
                              <Button onClick={() => handleUpgradeShip('hull')} disabled={stats.netWorth < (nextHullUpgrade.cost - currentHullTier.cost)}>
                                  Upgrade ({(nextHullUpgrade.cost - currentHullTier.cost).toLocaleString()}¢)
                              </Button>
                          ) : (
                              <Button disabled>Max Level</Button>
                          )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p>Fuel Tank</p>
                            <p className="text-xs text-muted-foreground">Current: {currentFuelTier?.name} ({stats.maxFuel} SU)</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentFuelTierIndex > 0 && (
                            <Button variant="outline" size="sm" onClick={() => handleDowngradeShip('fuel')}>Sell</Button>
                          )}
                          {nextFuelUpgrade ? (
                              <Button onClick={() => handleUpgradeShip('fuel')} disabled={stats.netWorth < (nextFuelUpgrade.cost - currentFuelTier.cost)}>
                                  Upgrade ({(nextFuelUpgrade.cost - currentFuelTier.cost).toLocaleString()}¢)
                              </Button>
                          ) : (
                              <Button disabled>Max Level</Button>
                          )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p>Sensor Suite</p>
                            <p className="text-xs text-muted-foreground">Current: {currentSensorTier?.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentSensorTierIndex > 0 && (
                            <Button variant="outline" size="sm" onClick={() => handleDowngradeShip('sensor')}>Sell</Button>
                          )}
                          {nextSensorUpgrade ? (
                              <Button onClick={() => handleUpgradeShip('sensor')} disabled={stats.netWorth < (nextSensorUpgrade.cost - currentSensorTier.cost)}>
                                  Upgrade ({(nextSensorUpgrade.cost - currentSensorTier.cost).toLocaleString()}¢)
                              </Button>
                          ) : (
                              <Button disabled>Max Level</Button>
                          )}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-headline">
                        <ShoppingCart className="text-primary"/> Shipyard
                    </CardTitle>
                    <CardDescription>Purchase new vessels to expand your fleet. Your current fleet size is {stats.fleetSize}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {SHIPS_FOR_SALE.map(ship => (
                        <div key={ship.id} className="border p-4 rounded-lg bg-background/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-2">
                                <h4 className="font-bold text-base">{ship.name}</h4>
                                <p className="text-xs text-muted-foreground">{ship.manufacturer}</p>

                                <p className="text-sm">{ship.description}</p>
                                <div className="flex flex-wrap gap-4 text-xs font-mono pt-2">
                                    <span className="flex items-center gap-1.5"><Warehouse className="h-3 w-3" /> {ship.cargo}t</span>
                                    <span className="flex items-center gap-1.5"><Fuel className="h-3 w-3" /> {ship.fuel} SU</span>
                                    <span className="flex items-center gap-1.5"><HeartPulse className="h-3 w-3" /> {ship.health}%</span>
                                </div>
                            </div>
                            <div className="flex-shrink-0 text-right w-full sm:w-auto">
                                <p className="text-lg font-mono text-amber-300 mb-2">{ship.cost.toLocaleString()}¢</p>
                                <Button className="w-full sm:w-auto" onClick={() => handlePurchaseShip(ship)} disabled={stats.netWorth < ship.cost}>
                                    Purchase
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-headline">
                        <Users className="text-primary"/> Crew Roster
                    </CardTitle>
                    <CardDescription>Your loyal (and paid) companions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">You currently have {crew.length} crew members. Manage your roster to hire new specialists and review your team.</p>
                    <Link href="/crew" passHref>
                        <Button className="w-full">Manage Crew</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
