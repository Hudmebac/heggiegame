
'use client';
import { useState } from 'react';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SHIPS_FOR_SALE } from '@/lib/ships';
import ShipOutfittingDialog from './ship-outfitting-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Ship, Rocket, Warehouse, Fuel, ShieldCheck, HeartPulse, Wrench, Sparkles, CheckCircle, Trash2, ShoppingCart } from 'lucide-react';
import type { PlayerShip, ShipForSale } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function FleetManagement() {
  const { gameState, handlePurchaseShip, handleSellShip, handleSetActiveShip } = useGame();
  const [outfittingShip, setOutfittingShip] = useState<PlayerShip | null>(null);

  if (!gameState) {
    return <div>Loading Fleet...</div>;
  }

  const { playerStats } = gameState;
  const activeShipInstanceId = playerStats.fleet[0]?.instanceId;

  const getShipBaseData = (shipId: string) => SHIPS_FOR_SALE.find(s => s.id === shipId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2">
            <Rocket className="text-primary" />
            Your Fleet
          </CardTitle>
          <CardDescription>Manage your collection of starships. The first ship in the list is your active vessel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {playerStats.fleet.map((ship) => {
            const baseData = getShipBaseData(ship.shipId);
            const isActive = ship.instanceId === activeShipInstanceId;
            if (!baseData) return null;

            return (
              <Card key={ship.instanceId} className={cn("bg-card/50", isActive && "border-primary")}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className={cn("text-base", isActive && "text-primary")}>{ship.name}</CardTitle>
                            <CardDescription>{baseData.type}</CardDescription>
                        </div>
                        {isActive && <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase"><CheckCircle className="h-4 w-4" /> Active</div>}
                    </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><Warehouse className="h-4 w-4 text-primary/70" /> Cargo: Lvl {ship.cargoLevel}</div>
                    <div className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-primary/70" /> Hull: Lvl {ship.hullLevel}</div>
                    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary/70" /> Shield: Lvl {ship.shieldLevel}</div>
                    <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary/70" /> Weapons: Lvl {ship.weaponLevel}</div>
                    <div className="flex items-center gap-2"><Fuel className="h-4 w-4 text-primary/70" /> Fuel: Lvl {ship.fuelLevel}</div>
                    <div className="flex items-center gap-2"><Rocket className="h-4 w-4 text-primary/70" /> Sensors: Lvl {ship.sensorLevel}</div>
                  </div>
                </CardContent>
                <CardContent className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setOutfittingShip(ship)}>
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
                  <Button size="sm" onClick={() => handleSetActiveShip(ship.instanceId)} disabled={isActive}>
                    Activate
                  </Button>
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

      {outfittingShip && (
        <ShipOutfittingDialog
          ship={outfittingShip}
          isOpen={!!outfittingShip}
          onOpenChange={(isOpen) => !isOpen && setOutfittingShip(null)}
        />
      )}
    </div>
  );
}
