'use client';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades, droneUpgrades, powerCoreUpgrades, advancedUpgrades } from "@/lib/upgrades";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Crosshair, ShieldCheck, HeartPulse, Fuel, Radar, Bot, Zap, Wrench } from 'lucide-react';

const UpgradeCard = ({ title, icon: Icon, upgrades }: { title: string, icon: React.ElementType, upgrades: { name: string, cost: number, capacity?: number, health?: number }[] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2"><Icon className="text-primary"/>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {upgrades.map(upgrade => (
                <div key={upgrade.name} className="flex justify-between items-center text-sm">
                    <span>{upgrade.name} {upgrade.capacity && `(${upgrade.capacity}t)`} {upgrade.health && `(${upgrade.health}HP)`}</span>
                    <span className="font-mono text-amber-300">{upgrade.cost.toLocaleString()}¢</span>
                </div>
            ))}
        </CardContent>
    </Card>
);

export default function UpgradesCodex() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UpgradeCard title="Cargo Upgrades" icon={Package} upgrades={cargoUpgrades} />
            <UpgradeCard title="Weapon Upgrades" icon={Crosshair} upgrades={weaponUpgrades} />
            <UpgradeCard title="Shield Upgrades" icon={ShieldCheck} upgrades={shieldUpgrades} />
            <UpgradeCard title="Hull Upgrades" icon={HeartPulse} upgrades={hullUpgrades} />
            <UpgradeCard title="Fuel Upgrades" icon={Fuel} upgrades={fuelUpgrades} />
            <UpgradeCard title="Sensor Upgrades" icon={Radar} upgrades={sensorUpgrades} />
            <UpgradeCard title="Drone Upgrades" icon={Bot} upgrades={droneUpgrades} />
            <UpgradeCard title="Power Core Upgrades" icon={Zap} upgrades={powerCoreUpgrades} />

            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Wrench className="text-primary"/>Advanced Systems</CardTitle>
                    <CardDescription>Toggleable, high-cost modules that provide unique strategic advantages.</CardDescription>
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
