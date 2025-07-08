'use client';

import { useGame } from '@/app/components/game-provider';
import type { PlayerShip, CargoUpgrade, WeaponUpgrade, ShieldUpgrade, HullUpgrade, FuelUpgrade, SensorUpgrade, DroneUpgrade } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades, droneUpgrades } from '@/lib/upgrades';
import { Rocket, Warehouse, HeartPulse, ShieldCheck, Sparkles, Fuel, Radar, Bot } from 'lucide-react';

interface ShipOutfittingDialogProps {
  shipInstanceId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type UpgradeType = 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor' | 'drone';
type UpgradeInfo = (CargoUpgrade | WeaponUpgrade | ShieldUpgrade | HullUpgrade | FuelUpgrade | SensorUpgrade | DroneUpgrade);


export default function ShipOutfittingDialog({ shipInstanceId, isOpen, onOpenChange }: ShipOutfittingDialogProps) {
  const { gameState, handleUpgradeShip, handleDowngradeShip } = useGame();

  if (!gameState) return null;

  const ship = gameState.playerStats.fleet.find(s => s.instanceId === shipInstanceId);
  const { playerStats } = gameState;
  
  if (!ship) return null;

  const getUpgradeCost = (currentLevel: number, upgrades: { level: number; cost: number }[]) => {
    if (currentLevel >= upgrades.length) return Infinity;
    const currentTier = upgrades.find(u => u.level === currentLevel);
    const nextTier = upgrades.find(u => u.level === currentLevel + 1);
    if (!currentTier || !nextTier) return Infinity;
    return nextTier.cost - currentTier.cost;
  };
  
  const getDowngradeValue = (currentLevel: number, upgrades: { level: number; cost: number }[]) => {
    if (currentLevel <= 1) return 0;
    const currentTier = upgrades.find(u => u.level === currentLevel);
    const prevTier = upgrades.find(u => u.level === currentLevel - 1);
    if (!currentTier || !prevTier) return 0;
    return Math.round((currentTier.cost - prevTier.cost) * 0.7);
  };
  
  const UpgradeRow = ({ type, label, currentLevel, upgrades, icon: Icon }: { type: UpgradeType, label: string, currentLevel: number, upgrades: UpgradeInfo[], icon: React.ElementType }) => {
    const cost = getUpgradeCost(currentLevel, upgrades);
    const refund = getDowngradeValue(currentLevel, upgrades);
    const canAfford = playerStats.netWorth >= cost;

    const currentUpgrade = upgrades[currentLevel - 1];
    const nextUpgrade = currentLevel < upgrades.length ? upgrades[currentLevel] : null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 items-center py-3 border-b border-border/50 last:border-b-0 gap-4 md:gap-2">
        <div className='flex items-center gap-3 md:col-span-1'>
            <Icon className="h-6 w-6 text-primary/70 flex-shrink-0" />
            <div>
                <p className='font-semibold'>{label}</p>
                <p className="text-xs text-muted-foreground">
                  Lvl {currentLevel} / {upgrades.length}
                </p>
            </div>
        </div>

        <div className="md:col-span-1 text-sm md:text-center">
          <p className="text-muted-foreground truncate" title={currentUpgrade.name}>Current: {currentUpgrade.name}</p>
          {nextUpgrade && (
            <p className="text-primary/90 truncate" title={nextUpgrade.name}>Next: {nextUpgrade.name}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:justify-end md:col-span-1">
          {currentLevel > 1 && (
            <Button variant="outline" size="sm" onClick={() => handleDowngradeShip(ship.instanceId, type)}>
              Sell ({refund.toLocaleString()}¢)
            </Button>
          )}
          {nextUpgrade ? (
            <Button size="sm" onClick={() => handleUpgradeShip(ship.instanceId, type)} disabled={!canAfford}>
              {`Upgrade (${cost.toLocaleString()}¢)`}
            </Button>
          ) : (
            <Button size="sm" disabled>Max Level</Button>
          )}
        </div>
      </div>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'><Rocket className='text-primary'/>Outfitting: {ship.name}</DialogTitle>
          <DialogDescription>Upgrade and manage components for this specific ship.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2 max-h-[70vh] overflow-y-auto">
            <UpgradeRow type="cargo" label="Cargo Hold" currentLevel={ship.cargoLevel} upgrades={cargoUpgrades} icon={Warehouse} />
            <UpgradeRow type="hull" label="Hull Integrity" currentLevel={ship.hullLevel} upgrades={hullUpgrades} icon={HeartPulse} />
            <UpgradeRow type="shield" label="Shield Generator" currentLevel={ship.shieldLevel} upgrades={shieldUpgrades} icon={ShieldCheck} />
            <UpgradeRow type="weapon" label="Weapon Systems" currentLevel={ship.weaponLevel} upgrades={weaponUpgrades} icon={Sparkles} />
            <UpgradeRow type="fuel" label="Fuel Tank" currentLevel={ship.fuelLevel} upgrades={fuelUpgrades} icon={Fuel} />
            <UpgradeRow type="sensor" label="Sensor Suite" currentLevel={ship.sensorLevel} upgrades={sensorUpgrades} icon={Radar} />
            <UpgradeRow type="drone" label="Drone Bay" currentLevel={ship.droneLevel} upgrades={droneUpgrades} icon={Bot} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
