'use client';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Fuel, Warehouse, Shield, BadgeCheck, MapPin, Wrench, ShieldCheck, Ship, Loader2, HeartPulse, AlertTriangle, GitCommitHorizontal, Users, Navigation, Crosshair, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const { gameState, handleRefuel, handleRepairShip, handleUpgradeShip, cargoUpgrades, weaponUpgrades, shieldUpgrades } = useGame();

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
  const nextCargoUpgrade = currentCargoTierIndex !== -1 && currentCargoTierIndex < cargoUpgrades.length - 1
    ? cargoUpgrades[currentCargoTierIndex + 1]
    : null;

  const currentWeaponTier = weaponUpgrades.find(u => u.level === stats.weaponLevel);
  const nextWeaponUpgrade = stats.weaponLevel < weaponUpgrades.length
    ? weaponUpgrades[stats.weaponLevel]
    : null;

  const currentShieldTier = shieldUpgrades.find(u => u.level === stats.shieldLevel);
  const nextShieldUpgrade = stats.shieldLevel < shieldUpgrades.length
    ? shieldUpgrades[stats.shieldLevel]
    : null;
    
  const crewRoleIcons = {
    'Engineer': <Wrench className="h-4 w-4 text-amber-400" />,
    'Navigator': <Navigation className="h-4 w-4 text-sky-400" />,
    'Gunner': <Crosshair className="h-4 w-4 text-rose-400" />,
    'Negotiator': <Handshake className="h-4 w-4 text-green-400" />,
  };

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
                         {nextCargoUpgrade ? (
                            <Button onClick={() => handleUpgradeShip('cargo')} disabled={stats.netWorth < nextCargoUpgrade.cost}>
                                Upgrade ({nextCargoUpgrade.cost.toLocaleString()}¢)
                            </Button>
                        ) : (
                            <Button disabled>Max Level</Button>
                        )}
                    </div>
                     <div className="flex justify-between items-center">
                        <div>
                            <p>Weapons System</p>
                            <p className="text-xs text-muted-foreground">Current: {currentWeaponTier?.name}</p>
                        </div>
                        {nextWeaponUpgrade ? (
                             <Button onClick={() => handleUpgradeShip('weapon')} disabled={stats.netWorth < nextWeaponUpgrade.cost}>
                                Upgrade ({nextWeaponUpgrade.cost.toLocaleString()}¢)
                            </Button>
                        ) : (
                            <Button disabled>Max Level</Button>
                        )}
                    </div>
                     <div className="flex justify-between items-center">
                        <div>
                            <p>Shield Generator</p>
                            <p className="text-xs text-muted-foreground">Current: {currentShieldTier?.name}</p>
                        </div>
                        {nextShieldUpgrade ? (
                             <Button onClick={() => handleUpgradeShip('shield')} disabled={stats.netWorth < nextShieldUpgrade.cost}>
                                Upgrade ({nextShieldUpgrade.cost.toLocaleString()}¢)
                            </Button>
                        ) : (
                             <Button disabled>Max Level</Button>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-headline">
                        <Ship className="text-primary"/> Fleet Management
                    </CardTitle>
                    <CardDescription>Manage your fleet of vessels.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                    <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Current Fleet Size</p>
                        <p className="font-mono text-primary">{stats.fleetSize} {stats.fleetSize > 1 ? 'Ships' : 'Ship'}</p>
                    </div>
                    <Button className="w-full" disabled>
                        Purchase New Ship (Coming Soon)
                    </Button>
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
                    {crew.length > 0 ? (
                        crew.map(member => (
                            <div key={member.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium flex items-center gap-2">
                                        {crewRoleIcons[member.role]}
                                        {member.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{member.description}</p>
                                </div>
                                <div className="text-right">
                                     <p className="font-mono text-sm">{member.salary.toLocaleString()}¢</p>
                                     <p className="text-xs text-muted-foreground">/ cycle</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center">Your ship has no crew.</p>
                    )}
                    <Button className="w-full mt-4" disabled>
                        Recruit Crew (Coming Soon)
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
