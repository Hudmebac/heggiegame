'use client';
import { useGame } from '@/app/components/game-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Fuel, Warehouse, Shield, BadgeCheck, MapPin, Wrench, ShieldCheck, Ship, Loader2 } from 'lucide-react';
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
  const { gameState, handleRefuel } = useGame();

  if (!gameState) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }
  
  const { playerStats: stats, currentSystem } = gameState;
  const fuelPrice = 2; // credits per unit
  const fuelNeeded = stats.maxFuel - stats.fuel;
  const refuelCost = fuelNeeded * fuelPrice;

  const canAffordRefuel = stats.netWorth >= refuelCost;
  const needsRefuel = fuelNeeded > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-headline">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rocket text-primary"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.33-.04-3.08.66-.25 1.37-.19 2.04.04.67.23 1.34.64 2 1.04.46.27.99.41 1.5.41.92 0 1.76-.43 2.5-1.11.74-.68 1.15-1.59 1.15-2.59s-.41-1.91-1.15-2.59c-.74-.68-1.58-1.11-2.5-1.11a3.42 3.42 0 0 0-1.5.41c-.66.4-1.33.81-2 1.04.67.23 1.37.19 2.04.04.74-.29 1.42-1.83 1.42-2.82s-.31-2.33-1-3c-1.39-1.39-4.2-2-5-2s-3.61.61-5 2c-.69.67-1 2-1 3s.68 2.53 1.42 2.82c.67.23 1.37.19 2.04.04-.75.75-.79 2.24-.04 3.08Z"/></svg>
            Ship Status
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                <span className="font-mono text-primary">{currentSystem} System</span>
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
            <Button className="w-full" onClick={handleRefuel} disabled={!needsRefuel || !canAffordRefuel}>
              {needsRefuel ? `Refuel Ship (${refuelCost}¢)` : 'Fuel Tank Full'}
            </Button>
        </CardContent>
        </Card>
        <div className="space-y-6">
            <Card className="bg-card/70 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-headline">
                        <Wrench className="text-primary"/> Ship Upgrades
                    </CardTitle>
                    <CardDescription>Improve your vessel's capabilities.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <p>Hull Capacity</p>
                            <p className="text-xs text-muted-foreground">Current: {stats.maxCargo}t</p>
                        </div>
                        <Button>Upgrade (5,000¢)</Button>
                    </div>
                     <div className="flex justify-between items-center">
                        <div>
                            <p>Weapons System</p>
                            <p className="text-xs text-muted-foreground">Mk. I Laser Cannon</p>
                        </div>
                        <Button>Upgrade (10,000¢)</Button>
                    </div>
                     <div className="flex justify-between items-center">
                        <div>
                            <p>Shield Generator</p>
                            <p className="text-xs text-muted-foreground">Class-A Deflector</p>
                        </div>
                        <Button>Upgrade (7,500¢)</Button>
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
                <CardContent className="text-center">
                    <p className="text-muted-foreground">Coming Soon</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
