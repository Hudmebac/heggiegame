'use client';
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades } from "@/lib/upgrades";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Crosshair, ShieldCheck, HeartPulse, Fuel, Radar } from 'lucide-react';

export default function UpgradesCodex() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Package className="text-primary"/>Cargo Upgrades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {cargoUpgrades.map(upgrade => (
                        <div key={upgrade.level} className="flex justify-between items-center text-sm">
                            <span>{upgrade.name} ({upgrade.capacity}t)</span>
                            <span className="font-mono text-amber-300">{upgrade.cost.toLocaleString()}¢</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Crosshair className="text-primary"/>Weapon Upgrades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {weaponUpgrades.map(upgrade => (
                        <div key={upgrade.level} className="flex justify-between items-center text-sm">
                            <span>{upgrade.name}</span>
                            <span className="font-mono text-amber-300">{upgrade.cost.toLocaleString()}¢</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><ShieldCheck className="text-primary"/>Shield Upgrades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {shieldUpgrades.map(upgrade => (
                        <div key={upgrade.level} className="flex justify-between items-center text-sm">
                            <span>{upgrade.name}</span>
                            <span className="font-mono text-amber-300">{upgrade.cost.toLocaleString()}¢</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><HeartPulse className="text-primary"/>Hull Upgrades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {hullUpgrades.map(upgrade => (
                        <div key={upgrade.level} className="flex justify-between items-center text-sm">
                            <span>{upgrade.name} ({upgrade.health} HP)</span>
                            <span className="font-mono text-amber-300">{upgrade.cost.toLocaleString()}¢</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Fuel className="text-primary"/>Fuel Upgrades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {fuelUpgrades.map(upgrade => (
                        <div key={upgrade.level} className="flex justify-between items-center text-sm">
                            <span>{upgrade.name} ({upgrade.capacity} SU)</span>
                            <span className="font-mono text-amber-300">{upgrade.cost.toLocaleString()}¢</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Radar className="text-primary"/>Sensor Upgrades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {sensorUpgrades.map(upgrade => (
                        <div key={upgrade.level} className="flex justify-between items-center text-sm">
                            <span>{upgrade.name}</span>
                            <span className="font-mono text-amber-300">{upgrade.cost.toLocaleString()}¢</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
