
'use client';
import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SHIPS_FOR_SALE } from '@/lib/ships';
import ShipOutfittingDialog from './ship-outfitting-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Ship, Rocket, Warehouse, Fuel, ShieldCheck, HeartPulse, Wrench, Sparkles, CheckCircle, Trash2, ShoppingCart, Crosshair, Bot } from 'lucide-react';
import type { PlayerShip, ShipForSale } from '@/lib/types';
import { cn } from '@/lib/utils';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades, droneUpgrades } from '@/lib/upgrades';
import { Progress } from '@/components/ui/progress';

export default function FleetManagement() {
  const { gameState, handlePurchaseShip, handleSellShip, handleSetActiveShip, handleRefuel, handleRepairShip, handleRepairFleetShip } = useGame();
  const [outfittingShipId, setOutfittingShipId] = useState<number | null>(null);

  if (!gameState) {
    return <div>Loading Fleet...</div>;
  }

  const { playerStats } = gameState;
  const activeShipInstanceId = playerStats.fleet?.[0]?.instanceId;

  const getShipBaseData = (shipId: string) => SHIPS_FOR_SALE.find(s => s.id === shipId);

  const fuelNeeded = playerStats.maxFuel - playerStats.fuel;
  const refuelCost = Math.round(fuelNeeded * 2);
  const canAffordRefuel = playerStats.netWorth >= refuelCost;

  const damageToRepair = playerStats.maxShipHealth - playerStats.shipHealth;
  const repairCost = Math.round(damageToRepair * (playerStats.insurance.ship ? 25 : 50));
  const canAffordRepair = playerStats.netWorth >= repairCost;

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2">
            <Rocket className="text-primary" />
            Active Ship Maintenance
          </CardTitle>
          <CardDescription>Manage your active vessel's fuel and hull integrity. Services are available at any starport.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-2"><Fuel className="text-primary/70" /> Fuel</span>
              <span className="font-mono">{playerStats.fuel.toFixed(0)} / {playerStats.maxFuel} SU</span>
            </div>
            <Progress value={(playerStats.fuel / playerStats.maxFuel) * 100} indicatorClassName="bg-amber-400" />
            <Button className="w-full mt-2" onClick={handleRefuel} disabled={fuelNeeded <= 0 || !canAffordRefuel}>
              {fuelNeeded > 0 ? `Refuel (${refuelCost.toLocaleString()}¢)` : 'Fuel Tank Full'}
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-2"><HeartPulse className="text-primary/70" /> Hull Integrity</span>
              <span className="font-mono">{playerStats.shipHealth.toFixed(0)} / {playerStats.maxShipHealth} HP</span>
            </div>
            <Progress value={(playerStats.shipHealth / playerStats.maxShipHealth) * 100} indicatorClassName={cn(playerStats.shipHealth < 25 ? 'bg-destructive' : playerStats.shipHealth < 50 ? 'bg-yellow-500' : 'bg-primary')} />
             <Button className="w-full mt-2" onClick={handleRepairShip} disabled={damageToRepair <= 0 || !canAffordRepair}>
              {damageToRepair > 0 ? `Repair (${repairCost.toLocaleString()}¢)` : 'Hull at 100%'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2">
            <Ship className="text-primary" />
            Your Fleet
          </CardTitle>
          <CardDescription>Manage your collection of starships. The first ship in the list is your active vessel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {playerStats.fleet.map((ship) => {
            const baseData = getShipBaseData(ship.shipId);
            const isActive = ship.instanceId === activeShipInstanceId;
            if (!baseData) return null;
            
            const cargoInfo = cargoUpgrades[ship.cargoLevel - 1];
            const hullInfo = hullUpgrades[ship.hullLevel - 1];
            const shieldInfo = shieldUpgrades[ship.shieldLevel - 1];
            const weaponInfo = weaponUpgrades[ship.weaponLevel - 1];
            const fuelInfo = fuelUpgrades[ship.fuelLevel - 1];
            const sensorInfo = sensorUpgrades[ship.sensorLevel - 1];
            const droneInfo = droneUpgrades[ship.droneLevel - 1];
            
            const maxHealth = hullInfo?.health || 100;
            const shipDamage = maxHealth - ship.health;
            const shipRepairCost = Math.round(shipDamage * (playerStats.insurance.ship ? 25 : 50));
            const canAffordShipRepair = playerStats.netWorth >= shipRepairCost;

            return (
              <Card key={ship.instanceId} className={cn("bg-card/50", isActive && "border-primary", ship.status === 'repair_needed' && 'border-destructive')}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className={cn("text-base", isActive && "text-primary")}>{ship.name}</CardTitle>
                            <CardDescription>{baseData.type}</CardDescription>
                        </div>
                         <div className='flex items-center gap-2'>
                          {ship.status === 'repair_needed' && <Badge variant="destructive">Repair Needed</Badge>}
                          {isActive && <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase"><CheckCircle className="h-4 w-4" /> Active</div>}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2" title={cargoInfo?.name}><Warehouse className="h-4 w-4 text-primary/70" /> <span>Cargo: Lvl {ship.cargoLevel} ({cargoInfo?.capacity}t)</span></div>
                        <div className="flex items-center gap-2" title={hullInfo?.name}><HeartPulse className="h-4 w-4 text-primary/70" /> <span>Hull: Lvl {ship.hullLevel} ({hullInfo?.health}HP)</span></div>
                        <div className="flex items-center gap-2" title={fuelInfo?.name}><Fuel className="h-4 w-4 text-primary/70" /> <span>Fuel: Lvl {ship.fuelLevel} ({fuelInfo?.capacity} SU)</span></div>
                        <div className="flex items-center gap-2" title={shieldInfo?.name}><ShieldCheck className="h-4 w-4 text-primary/70" /> <span>Shields: Lvl {ship.shieldLevel}</span></div>
                        <div className="flex items-center gap-2" title={weaponInfo?.name}><Crosshair className="h-4 w-4 text-primary/70" /> <span>Weapons: Lvl {ship.weaponLevel}</span></div>
                        <div className="flex items-center gap-2" title={sensorInfo?.name}><Sparkles className="h-4 w-4 text-primary/70" /> <span>Sensors: Lvl {ship.sensorLevel}</span></div>
                         <div className="flex items-center gap-2" title={droneInfo?.name}><Bot className="h-4 w-4 text-primary/70" /> <span>Drones: Lvl {ship.droneLevel}</span></div>
                    </div>
                     <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Hull:</span>
                          <span className="font-mono">{ship.health.toFixed(0)} / {maxHealth} HP</span>
                        </div>
                        <Progress value={(ship.health / maxHealth) * 100} indicatorClassName={cn(ship.health < maxHealth * 0.25 ? 'bg-destructive' : ship.health < maxHealth * 0.5 ? 'bg-yellow-500' : 'bg-primary')} />
                      </div>
                </CardContent>
                <CardContent className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setOutfittingShipId(ship.instanceId)}>
                    <Wrench className="mr-2" /> Outfit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={playerStats.fleet.length <= 1}>
                        <Trash2 className="mr-2" /> Sell
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sell {ship.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. You will receive 70% of the ship's total value, including upgrades.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleSellShip(ship.instanceId)}>Confirm Sale</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {ship.status === 'repair_needed' && !isActive && (
                      <Button size="sm" variant="secondary" onClick={() => handleRepairFleetShip(ship.instanceId)} disabled={!canAffordShipRepair}>Repair ({shipRepairCost.toLocaleString()}¢)</Button>
                  )}
                  {!isActive && ship.status !== 'repair_needed' && (
                    <Button size="sm" onClick={() => handleSetActiveShip(ship.instanceId)}>
                        Activate
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2">
            <ShoppingCart className="text-primary" />
            Shipyard
          </CardTitle>
          <CardDescription>Purchase new hulls to expand your fleet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SHIPS_FOR_SALE.map((ship) => (
            <Card key={ship.id} className="bg-card/50">
              <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base text-primary">{ship.name}</CardTitle>
                        <CardDescription>{ship.manufacturer} ({ship.type})</CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-mono text-amber-300">{ship.cost.toLocaleString()}¢</p>
                    </div>
                  </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{ship.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>Cargo: {ship.baseCargo}t</div>
                    <div>Health: {ship.baseHealth}%</div>
                    <div>Fuel: {ship.baseFuel} SU</div>
                    <div>Crew: {ship.crewCapacity}</div>
                </div>
              </CardContent>
              <CardContent className="flex justify-end">
                <Button onClick={() => handlePurchaseShip(ship)} disabled={playerStats.netWorth < ship.cost}>
                  Purchase
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <ShipOutfittingDialog
        shipInstanceId={outfittingShipId}
        isOpen={!!outfittingShipId}
        onOpenChange={(isOpen) => !isOpen && setOutfittingShipId(null)}
      />
    </div>
  );
}
