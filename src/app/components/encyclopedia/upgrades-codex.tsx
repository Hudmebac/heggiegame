
'use client';
import { 
    cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades, 
    droneUpgrades, powerCoreUpgrades, advancedUpgrades, 
    passengerComfortUpgrades, 
    passengerSecurityUpgrades, 
    passengerPacksUpgrades 
} from "@/lib/upgrades";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    Package, Crosshair, ShieldCheck, HeartPulse, Fuel, Radar, Bot, Zap, Wrench, 
    Sparkles, ShieldAlert, PackageCheck 
} from 'lucide-react';

const UpgradeCard = ({ title, icon: Icon, upgrades, unit }: { title: string, icon: React.ElementType, upgrades: { name: string, cost: number, capacity?: number, health?: number, description?: string }[], unit?: string }) => (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2"><Icon className="text-primary"/>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {upgrades.map(upgrade => (
                <div key={upgrade.name} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                        {upgrade.name}
                        {upgrade.capacity != null && ` (${upgrade.capacity}${unit})`}
                        {upgrade.health != null && ` (${upgrade.health}HP)`}
                        {upgrade.description && <p className="text-xs text-muted-foreground">{upgrade.description}</p>}
                    </div>
                    <span className="font-mono text-amber-300 ml-4 whitespace-nowrap">{upgrade.cost.toLocaleString()}¢</span>
                </div>
            ))}
        </CardContent>
    </Card>
);

export default function UpgradesCodex() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UpgradeCard title="Cargo Upgrades" icon={Package} upgrades={cargoUpgrades} unit="t" />
            <UpgradeCard title="Weapon Systems" icon={Crosshair} upgrades={weaponUpgrades} />
            <UpgradeCard title="Shield Generators" icon={ShieldCheck} upgrades={shieldUpgrades} />
            <UpgradeCard title="Hull Integrity" icon={HeartPulse} upgrades={hullUpgrades} />
            <UpgradeCard title="Fuel Tanks" icon={Fuel} upgrades={fuelUpgrades} unit=" SU" />
            <UpgradeCard title="Sensor Suites" icon={Radar} upgrades={sensorUpgrades} />
            <UpgradeCard title="Drone Bays" icon={Bot} upgrades={droneUpgrades} />
            <UpgradeCard title="Passenger Comfort" icon={Sparkles} upgrades={passengerComfortUpgrades} />
            <UpgradeCard title="Passenger Security" icon={ShieldAlert} upgrades={passengerSecurityUpgrades} />
            <UpgradeCard title="Passenger Service Packs" icon={PackageCheck} upgrades={passengerPacksUpgrades} />
            
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Zap className="text-primary"/>Power Core Upgrades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                     {powerCoreUpgrades.map(upgrade => (
                        <div key={upgrade.name} className="flex justify-between items-center text-sm">
                            <div className="flex-1">
                                {upgrade.name} (Lvl {upgrade.level})
                                <p className="text-xs text-muted-foreground">{upgrade.description}</p>
                            </div>
                            <span className="font-mono text-amber-300 ml-4 whitespace-nowrap">{upgrade.cost > 0 ? upgrade.cost.toLocaleString() + '¢' : 'Base'}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Wrench className="text-primary"/>Advanced Toggleable Modules</CardTitle>
                    <CardDescription>High-cost modules that provide unique strategic advantages. These are purchased once.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {advancedUpgrades.map(upgrade => (
                        <div key={upgrade.id} className="grid grid-cols-1 md:grid-cols-3 items-start p-3 border-b border-border/50 last:border-b-0 gap-2">
                            <div className="md:col-span-1">
                                <h4 className="font-semibold text-primary/90">{upgrade.name}</h4>
                                <p className="text-xs text-muted-foreground">{upgrade.category}</p>
                            </div>
                            <p className="md:col-span-1 text-sm text-muted-foreground">{upgrade.description}</p>
                            <p className="md:col-span-1 text-right font-mono text-amber-300">{upgrade.cost.toLocaleString()}¢</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

    
