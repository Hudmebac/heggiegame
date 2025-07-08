
'use client';

import { useGame } from '@/app/components/game-provider';
import type { PlayerShip, CargoUpgrade, WeaponUpgrade, ShieldUpgrade, HullUpgrade, FuelUpgrade, SensorUpgrade, DroneUpgrade } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades, droneUpgrades, powerCoreUpgrades, advancedUpgrades, AdvancedToggleableUpgrade, AdvancedLeveledUpgrade } from '@/lib/upgrades';
import { 
    Rocket, Warehouse, HeartPulse, ShieldCheck, Sparkles, Fuel, Radar, Bot, Zap, FastForward, Anchor, 
    Ghost, ScanLine, Wrench, CheckCircle, Brain, Leaf, ShieldAlert, DoorOpen, Globe, Thermometer, 
    Handshake, GitCommit, Crosshair
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface ShipOutfittingDialogProps {
  shipInstanceId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type UpgradeType = 'cargo' | 'weapon' | 'shield' | 'hull' | 'fuel' | 'sensor' | 'drone' | 'powerCore';
type UpgradeInfo = (CargoUpgrade | WeaponUpgrade | ShieldUpgrade | HullUpgrade | FuelUpgrade | SensorUpgrade | DroneUpgrade | AdvancedLeveledUpgrade);

const advancedIconMap: Record<AdvancedToggleableUpgrade['id'], React.ElementType> = {
    overdriveEngine: FastForward,
    warpStabilizer: Anchor,
    stealthPlating: Ghost,
    targetingMatrix: Crosshair,
    anomalyAnalyzer: ScanLine,
    fabricatorBay: Wrench,
    gravAnchor: GitCommit,
    aiCoreInterface: Brain,
    bioDomeModule: Leaf,
    flakDispensers: ShieldAlert,
    boardingTubeSystem: DoorOpen,
    terraformToolkit: Globe,
    thermalRegulator: Thermometer,
    diplomaticUplink: Handshake,
};

export default function ShipOutfittingDialog({ shipInstanceId, isOpen, onOpenChange }: ShipOutfittingDialogProps) {
  const { gameState, handleUpgradeShip, handleDowngradeShip, handlePurchaseAdvancedModule } = useGame();

  const ship = gameState?.playerStats.fleet.find(s => s.instanceId === shipInstanceId);
  
  if (!gameState || !ship) {
      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange} />
      );
  }

  const { playerStats } = gameState;

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
    const level = currentLevel || 1;
    const cost = getUpgradeCost(level, upgrades);
    const refund = getDowngradeValue(level, upgrades);
    const canAfford = playerStats.netWorth >= cost;

    const currentUpgrade = upgrades[level - 1];
    const nextUpgrade = level < upgrades.length ? upgrades[level] : null;

    if (!currentUpgrade) {
        return null;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 items-center py-3 border-b border-border/50 last:border-b-0 gap-2">
        <div className='flex items-center gap-3 md:col-span-1'>
            <Icon className="h-5 w-5 text-primary/70 flex-shrink-0" />
            <div>
                <p className='font-semibold'>{label}</p>
                <p className="text-xs text-muted-foreground">Lvl {level} / {upgrades.length}</p>
            </div>
        </div>

        <div className="md:col-span-1 text-sm text-left md:text-center">
          <p className="text-muted-foreground truncate" title={currentUpgrade.name}>Current: {currentUpgrade.name}</p>
          {nextUpgrade && <p className="text-primary/90 truncate" title={nextUpgrade.name}>Next: {nextUpgrade.name}</p>}
        </div>
        
        <div className="flex items-center gap-2 md:justify-end md:col-span-1">
          {level > 1 && <Button variant="outline" size="sm" onClick={() => handleDowngradeShip(ship.instanceId, type)}>Sell ({refund.toLocaleString()}¢)</Button>}
          {nextUpgrade ? <Button size="sm" onClick={() => handleUpgradeShip(ship.instanceId, type)} disabled={!canAfford}>{`Upgrade (${cost.toLocaleString()}¢)`}</Button> : <Button size="sm" disabled>Max</Button>}
        </div>
      </div>
    );
  };
  
  const AdvancedUpgradeRow = ({ upgrade, icon: Icon }: { upgrade: AdvancedToggleableUpgrade, icon: React.ElementType }) => {
      const isInstalled = ship[upgrade.id];
      const canAfford = playerStats.netWorth >= upgrade.cost;
      return (
          <div className="grid grid-cols-1 md:grid-cols-3 items-center py-3 border-b border-border/50 last:border-b-0 gap-2">
              <div className="flex items-center gap-3 md:col-span-1">
                <Icon className="h-5 w-5 text-primary/70 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{upgrade.name}</p>
                </div>
              </div>
              <p className="md:col-span-1 text-sm text-muted-foreground text-left md:text-center">{upgrade.description}</p>
              <div className="flex items-center gap-2 md:justify-end md:col-span-1">
                  {isInstalled ? (
                      <span className="flex items-center gap-2 text-sm text-green-400 font-semibold"><CheckCircle className="h-4 w-4"/> Installed</span>
                  ) : (
                      <Button size="sm" onClick={() => handlePurchaseAdvancedModule(ship.instanceId, upgrade.id)} disabled={!canAfford}>
                        <Wrench className="mr-2" />
                        Purchase ({upgrade.cost.toLocaleString()}¢)
                      </Button>
                  )}
              </div>
          </div>
      )
  }

  const advancedCategories = [...new Set(advancedUpgrades.map(u => u.category))];


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'><Rocket className='text-primary'/>Outfitting: {ship.name}</DialogTitle>
          <DialogDescription>Upgrade and manage components for this specific ship. Changes are permanent.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-y-8 pt-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-4">
            <h3 className="font-headline text-lg text-primary border-b pb-2">Standard Systems</h3>
            <UpgradeRow type="cargo" label="Cargo Hold" currentLevel={ship.cargoLevel} upgrades={cargoUpgrades} icon={Warehouse} />
            <UpgradeRow type="hull" label="Hull Integrity" currentLevel={ship.hullLevel} upgrades={hullUpgrades} icon={HeartPulse} />
            <UpgradeRow type="shield" label="Shield Generator" currentLevel={ship.shieldLevel} upgrades={shieldUpgrades} icon={ShieldCheck} />
            <UpgradeRow type="weapon" label="Weapon Systems" currentLevel={ship.weaponLevel} upgrades={weaponUpgrades} icon={Sparkles} />
            <UpgradeRow type="fuel" label="Fuel Tank" currentLevel={ship.fuelLevel} upgrades={fuelUpgrades} icon={Fuel} />
            <UpgradeRow type="sensor" label="Sensor Suite" currentLevel={ship.sensorLevel} upgrades={sensorUpgrades} icon={Radar} />
            <UpgradeRow type="drone" label="Drone Bay" currentLevel={ship.droneLevel} upgrades={droneUpgrades} icon={Bot} />
          </div>
           <div className="space-y-4">
            <h3 className="font-headline text-lg text-primary border-b pb-2">Advanced Systems</h3>
             <div>
                <h4 className="font-semibold text-muted-foreground text-sm mb-2 mt-4">Power Core</h4>
                <UpgradeRow type="powerCore" label="Power Core" currentLevel={ship.powerCoreLevel} upgrades={powerCoreUpgrades} icon={Zap} />
             </div>
             {advancedCategories.map(category => (
                <div key={category}>
                    <h4 className="font-semibold text-muted-foreground text-sm mb-2">{category}</h4>
                    {advancedUpgrades.filter(u => u.category === category).map(upgrade => (
                    <AdvancedUpgradeRow key={upgrade.id} upgrade={upgrade} icon={advancedIconMap[upgrade.id]} />
                    ))}
                </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
