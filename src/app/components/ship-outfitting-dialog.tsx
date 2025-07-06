
'use client';

import { useGame } from '@/app/components/game-provider';
import type { PlayerShip } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades } from '@/lib/upgrades';
import { Rocket, Warehouse, HeartPulse, ShieldCheck, Sparkles, Fuel, Radar } from 'lucide-react';

interface ShipOutfittingDialogProps {
  shipInstanceId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  
  const UpgradeRow = ({ type, label, currentLevel, upgrades, icon: Icon }: { type: 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor', label: string, currentLevel: number, upgrades: any[], icon: React.ElementType }) => {
    const cost = getUpgradeCost(currentLevel, upgrades);
    const refund = getDowngradeValue(currentLevel, upgrades);
    const canAfford = playerStats.netWorth >= cost;

    return (
      <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
        <div className='flex items-center gap-4'>
            <Icon className="h-6 w-6 text-primary/70" />
            <div>
                <p className='font-semibold'>{label}</p>
                <p className="text-xs text-muted-foreground">Level {currentLevel} / {upgrades.length}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
          {currentLevel > 1 && (
            <Button variant="outline" size="sm" onClick={() => handleDowngradeShip(ship.instanceId, type)}>
              Sell ({refund.toLocaleString()}¢)
            </Button>
          )}
          {currentLevel < upgrades.length ? (
            <Button size="sm" onClick={() => handleUpgradeShip(ship.instanceId, type)} disabled={!canAfford}>
              Upgrade ({cost.toLocaleString()}¢)
            </Button>
          ) : (
            <Button size="sm" disabled>Max</Button>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
