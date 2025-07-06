'use client';
import { SHIPS_FOR_SALE } from "@/lib/ships";
import { cargoUpgrades, weaponUpgrades, shieldUpgrades } from "@/lib/upgrades";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Warehouse, Fuel, HeartPulse, ShieldCheck, Crosshair, Package, Rocket } from 'lucide-react';

const shipAnatomyData = [
    { area: 'Hull', description: 'The outer shell of the ship; structural integrity and armor plating.', gameUse: 'Shields, armor, breach points.' },
    { area: 'Port Side', description: 'Left side of the ship (when facing forward).', gameUse: 'Tactical orientation; lateral defense.' },
    { area: 'Starboard Side', description: 'Right side of the ship.', gameUse: 'Mirrored weapon arcs; docking access.' },
    { area: 'Underside', description: 'Bottom of the ship; often contains cargo bay doors, landing gear, or heat shielding.', gameUse: 'Vulnerable zone for stealth attacks.' },
    { area: 'Bridge', description: 'Central command area with controls, navigation systems, and crew stations.', gameUse: 'Command override missions; kill-switch spot.' },
    { area: 'Engine Mountings', description: 'Located at the stern; includes fusion cores, thruster arrays, and FTL generators.', gameUse: 'Sabotage targets; propulsion upgrades.' },
    { area: 'Stern', description: 'Rear section of the ship.', gameUse: 'Engine output, heat exhaust ports.' },
    { area: 'Bow', description: 'Front section, often housing sensors or weapons.', gameUse: 'Collision risk, boarding rams.' },
    { area: 'Cargo Hold', description: 'Internal storage area for goods, modules, or alien relics.', gameUse: 'Smuggling missions, item drop zones.' },
    { area: 'Crew Quarters', description: 'Living spaces for personnel; bio-readers, bunk modules, or cryopods.', gameUse: 'Morale system, event triggers.' },
    { area: 'Life Support Bay', description: 'Controls air, temperature, and pressure regulation.', gameUse: 'Tactical sabotage or repair scenarios.' },
    { area: 'Airlocks', description: 'Transition points for entry/exit, docking, or boarding.', gameUse: 'Hacking or breaching gameplay.' },
    { area: 'Landing Struts', description: 'Used for planetary docking; extendable supports for terrain.', gameUse: 'Planetary alignment missions.' },
    { area: 'Observation Deck', description: 'Panoramic viewing zone; may include tactical scope overlays.', gameUse: 'Lore, NPC dialogue, discovery triggers.' },
    { area: 'Hangar Bay', description: 'Storage and deployment zone for fighter ships or shuttles.', gameUse: 'Launch missions, reinforcements.' },
    { area: 'Shield Emitters', description: 'Devices embedded in outer structure to project energy barriers.', gameUse: 'Defense mechanics, overload sequences.' },
    { area: 'Maintenance Access Panels', description: 'Entry points for technical repairs, wiring, and conduits.', gameUse: 'Puzzle modules, repair minigames.' },
];


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

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Rocket className="text-primary"/>Core Ship Anatomy</CardTitle>
                    <CardDescription>An overview of the key areas and components of a typical starship.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shipAnatomyData.map(anatomy => (
                        <div key={anatomy.area} className="border p-4 rounded-lg bg-background/30 flex flex-col gap-2">
                            <h4 className="font-bold text-base text-primary">{anatomy.area}</h4>
                            <p className="text-sm text-muted-foreground">{anatomy.description}</p>
                            <p className="text-xs text-muted-foreground mt-auto pt-2 border-t border-border/50">
                                <span className="font-semibold text-primary/80">Game Use:</span> {anatomy.gameUse}
                            </p>
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
