'use client';
import { SHIPS_FOR_SALE } from "@/lib/ships";
import { cargoUpgrades, weaponUpgrades, shieldUpgrades } from "@/lib/upgrades";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Warehouse, Fuel, HeartPulse, ShieldCheck, Crosshair, Package } from 'lucide-react';

export default function ShipCodex() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Available Ship Hulls</CardTitle>
                    <CardDescription>A list of commercially available ship hulls. Each ship comes with base level components.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {SHIPS_FOR_SALE.map(ship => (
                        <div key={ship.id} className="border p-4 rounded-lg bg-background/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-2">
                                <h4 className="font-bold text-base text-primary">{ship.name}</h4>
                                <p className="text-xs text-muted-foreground">{ship.manufacturer}</p>
                                <p className="text-sm">{ship.description}</p>
                                <div className="flex flex-wrap gap-4 text-xs font-mono pt-2">
                                    <span className="flex items-center gap-1.5"><Warehouse className="h-3 w-3" /> {ship.cargo}t</span>
                                    <span className="flex items-center gap-1.5"><Fuel className="h-3 w-3" /> {ship.fuel} SU</span>
                                    <span className="flex items-center gap-1.5"><HeartPulse className="h-3 w-3" /> {ship.health}%</span>
                                    <span className="font-mono text-amber-300">{ship.cost.toLocaleString()}¢</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2"><Package className="text-primary"/>Cargo Upgrades</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {cargoUpgrades.map(upgrade => (
                            <div key={upgrade.capacity} className="flex justify-between items-center text-sm">
                                <span>{upgrade.capacity}t Capacity</span>
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
            </div>
        </div>
    )
}
