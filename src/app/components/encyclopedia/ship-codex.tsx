'use client';
import { SHIPS_FOR_SALE } from "@/lib/ships";
import { cargoUpgrades, weaponUpgrades, shieldUpgrades, hullUpgrades, fuelUpgrades, sensorUpgrades } from "@/lib/upgrades";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Warehouse, Fuel, HeartPulse, ShieldCheck, Crosshair, Package, Rocket, Radar, Users, GaugeCircle, Star, KeyRound, ChevronsUp, Wrench, Shield, Clipboard } from 'lucide-react';
import Image from 'next/image';

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
                        <div key={ship.id} className="border p-4 rounded-lg bg-background/30 flex flex-col gap-4">
                             <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="space-y-2 flex-grow">
                                    <h4 className="font-bold text-base text-primary">{ship.name} <span className="text-sm font-normal text-muted-foreground">({ship.type})</span></h4>
                                    <p className="text-xs text-muted-foreground">{ship.manufacturer}</p>
                                    <p className="text-sm">{ship.description}</p>
                                </div>
                                <div className="flex-shrink-0 text-right w-full sm:w-auto">
                                    <p className="text-lg font-mono text-amber-300 mb-2">{ship.cost.toLocaleString()}¢</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border/50 text-xs">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 font-mono">
                                    <div className="flex items-center gap-2"><Warehouse className="h-4 w-4 text-primary/70" /> <span>Cargo: {ship.cargo}t</span></div>
                                    <div className="flex items-center gap-2"><Fuel className="h-4 w-4 text-primary/70" /> <span>Fuel: {ship.fuel} SU</span></div>
                                    <div className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-primary/70" /> <span>Health: {ship.health}%</span></div>
                                    <div className="flex items-center gap-2"><GaugeCircle className="h-4 w-4 text-primary/70" /> <span>Speed: {ship.speedRating}</span></div>
                                    <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary/70" /> <span>Defense: {ship.defenseRating}</span></div>
                                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary/70" /> <span>Crew: {ship.crewCapacity}</span></div>
                                    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary/70" /> <span>Shield Slots: {ship.shieldEmitterSlots}</span></div>
                                    <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-primary/70" /> <span>Engine: {ship.engineClass}</span></div>
                                </div>
                                <div className="mt-4 pt-2 border-t border-border/50 space-y-2 text-sm">
                                    <div className="flex items-start gap-2"><ChevronsUp className="h-4 w-4 text-primary/70 mt-0.5" /> <div><span className="font-bold">Upgrade Slots:</span> <span className="text-muted-foreground">{Object.entries(ship.upgradeSlots).map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`).join(', ')}</span></div></div>
                                    <div className="flex items-start gap-2"><Star className="h-4 w-4 text-primary/70 mt-0.5" /> <div><span className="font-bold">Recommended Use:</span> <span className="text-muted-foreground">{ship.recommendedUse}</span></div></div>
                                    <div className="flex items-start gap-2"><KeyRound className="h-4 w-4 text-primary/70 mt-0.5" /> <div><span className="font-bold">HEGGIE Clearance:</span> <span className="text-muted-foreground">{ship.heggieClearance}</span></div></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Clipboard className="text-primary"/>Ship Blueprint: S-Class Shuttle</CardTitle>
                    <CardDescription>Detailed schematics and profile for the S-Class Shuttle.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-black/30 p-4 rounded-lg border border-border/50">
                        <Image
                            src="/s-class-shuttle-blueprint.png"
                            alt="S-Class Shuttle Blueprint"
                            width={956}
                            height={669}
                            className="rounded-md w-full h-auto"
                            data-ai-hint="shuttle blueprint"
                        />
                    </div>
                    <div>
                        <h4 className="font-bold text-primary mb-2">Vessel Profile</h4>
                        <div className="space-y-2 text-sm border p-4 rounded-lg bg-background/30">
                            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>Shuttle</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Designation</span><span>S-Class</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Length</span><span>18.4 meters</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Crew Capacity</span><span>2</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Cargo Bay</span><span>20 tons</span></div>
                            <div className="flex justify-between items-start gap-4"><span className="text-muted-foreground shrink-0">Primary Use</span><span className="text-right">Short-haul courier runs, secure-sector dispatches</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">HEGGIE Clearance</span><span>Tier I</span></div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-primary mb-2">Layout Overview</h4>
                        <pre className="p-4 bg-black/50 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto">
{`+---------------------------+
|   COCKPIT / BRIDGE        | ← Forward Navigation Console
|---------------------------|
|   CREW MODULE             | ← Cryopod Seating + Emergency Station
|---------------------------|
|   CORE CARGO HOLD         | ← Modular crates, bioseal locking
|---------------------------|
|   MAINTENANCE ACCESS      | ← Engine diagnostics panel
|---------------------------|
|   MICRO-PULSE ENGINE      | ← MicroPulse-5 drive + backup thruster
+---------------------------+`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-bold text-primary mb-2">Visual Description</h4>
                        <div className="border p-4 rounded-lg bg-background/30">
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                <li><span className="font-semibold text-foreground">Color Scheme:</span> Deep orange accents along a matte dark hull—reflecting HEGGIE’s guild palette.</li>
                                <li><span className="font-semibold text-foreground">Markings:</span> Sigil on left stabilizer wing, Vault Nexus registry glyph on cockpit nose.</li>
                                <li><span className="font-semibold text-foreground">Shape:</span> Compact, oblong cabin body with tapered nose and dorsal antenna arrays.</li>
                                <li><span className="font-semibold text-foreground">Underside:</span> Heat shields + retractable landing struts.</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Clipboard className="text-primary"/>Ship Blueprint: Hauler Mk. II</CardTitle>
                    <CardDescription>Detailed schematics and profile for the Hauler Mk. II.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-black/30 p-4 rounded-lg border border-border/50">
                        <Image
                            src="https://placehold.co/956x669.png"
                            alt="Hauler Mk. II Blueprint"
                            width={956}
                            height={669}
                            className="rounded-md w-full h-auto"
                            data-ai-hint="hauler blueprint"
                        />
                    </div>
                    <div>
                        <h4 className="font-bold text-primary mb-2">Vessel Profile</h4>
                        <div className="space-y-2 text-sm border p-4 rounded-lg bg-background/30">
                            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>Freighter</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Designation</span><span>Hauler Mk. II</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Manufacturer</span><span>Lakon Spaceways</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Length</span><span>64.2 meters</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Crew Capacity</span><span>6</span></div>
                            <div className="flex justify-between items-start gap-4"><span className="text-muted-foreground shrink-0">Cargo Bay</span><span className="text-right">350 tons (modular pods with HEGGIE-standard seal locks)</span></div>
                            <div className="flex justify-between items-start gap-4"><span className="text-muted-foreground shrink-0">Primary Use</span><span className="text-right">Bulk commodity transport, trade-route endurance runs, corporate freight</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">HEGGIE Clearance</span><span>Tier II</span></div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-primary mb-2">Layout Overview</h4>
                        <pre className="p-4 bg-black/50 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto">
{`+--------------------------------------------------------+
|   COCKPIT / BRIDGE                                     | ← Command console & trade terminal interface
|--------------------------------------------------------|
|   CREW QUARTERS                                        | ← Six-module living space + mess & survival gear
|--------------------------------------------------------|
|   TRADE SYSTEMS BAY                                    | ← HEGGIE holo-terminal, commodity scanner uplink
|--------------------------------------------------------|
|   PRIMARY CARGO HOLD                                   | ← Modular container racks, lockable vault pods
|--------------------------------------------------------|
|   SHIELD EMITTER ARRAY                                 | ← Midship projector domes w/ flux regulators
|--------------------------------------------------------|
|   MAINTENANCE & POWER CONDUITS                         | ← Sub-deck wiring paths & service crawl spaces
|--------------------------------------------------------|
|   ENGINE MOUNTING: GravLift-8A                         | ← Rear-mounted propulsion clusters + intake vents
+--------------------------------------------------------+`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-bold text-primary mb-2">Visual Description</h4>
                        <div className="border p-4 rounded-lg bg-background/30">
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                <li><span className="font-semibold text-foreground">Color Scheme:</span> Industrial matte grey frame with bold HEGGIE-orange struts and signal panels; Lakon’s emblem etched in radiant silver.</li>
                                <li><span className="font-semibold text-foreground">Markings:</span> HEGGIE Vault Nexus license strip spans mid-fuselage; trade legitimacy glyphs illuminated during customs scans.</li>
                                <li><span className="font-semibold text-foreground">Shape:</span> Blocky, utilitarian hull with reinforced bow; side-mounted cargo clamps visible beneath ventral plating.</li>
                                <li><span className="font-semibold text-foreground">Underside:</span> Wide gravity-field landing pads; magnetic cargo latches arranged in two parallel belts.</li>
                            </ul>
                        </div>
                    </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
    )
}
