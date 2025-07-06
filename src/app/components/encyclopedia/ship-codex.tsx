'use client';
import { SHIPS_FOR_SALE } from "@/lib/ships";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Warehouse, Fuel, HeartPulse, ShieldCheck, Users, GaugeCircle, Star, KeyRound, ChevronsUp, Wrench, Shield, Clipboard } from 'lucide-react';
import Image from 'next/image';

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
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Clipboard className="text-primary"/>Ship Blueprint: Viper Combat Escort</CardTitle>
                    <CardDescription>Detailed schematics and profile for the Viper Combat Escort.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-black/30 p-4 rounded-lg border border-border/50">
                        <Image
                            src="https://placehold.co/956x669.png"
                            alt="Viper Combat Escort Blueprint"
                            width={956}
                            height={669}
                            className="rounded-md w-full h-auto"
                            data-ai-hint="viper blueprint"
                        />
                    </div>
                    <div>
                        <h4 className="font-bold text-primary mb-2">Vessel Profile</h4>
                        <div className="space-y-2 text-sm border p-4 rounded-lg bg-background/30">
                            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>Escort</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Designation</span><span>Viper Combat Escort</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Manufacturer</span><span>Faulcon deLacy</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Length</span><span>32.7 meters</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Crew Capacity</span><span>2</span></div>
                            <div className="flex justify-between items-start gap-4"><span className="text-muted-foreground shrink-0">Cargo Bay</span><span className="text-right">10 tons (tactical pod capacity)</span></div>
                            <div className="flex justify-between items-start gap-4"><span className="text-muted-foreground shrink-0">Primary Use</span><span className="text-right">Bounty hunting, security patrol, HEGGIE convoy defense</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">HEGGIE Clearance</span><span>Tier III</span></div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-primary mb-2">Layout Overview</h4>
                        <pre className="p-4 bg-black/50 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto">
{`+-------------------------------------------------------+
|   COCKPIT / BRIDGE                                    | ← Combat controls, encrypted HEGGIE ops terminal
|-------------------------------------------------------|
|   CREW CORE                                           | ← Two-seat tactical pod, oxygen buffer tanks
|-------------------------------------------------------|
|   WEAPON BAY                                          | ← Internal mount racks: pulse cannons, ion disruptors
|-------------------------------------------------------|
|   SHIELD EMITTER CLUSTER                             | ← Triple dome array, stacked mid-deck
|-------------------------------------------------------|
|   STEALTH CORE MODULE                                 | ← EM dampeners, subspace masking coils
|-------------------------------------------------------|
|   ENGINE BLOCK: TalonDrive-VX                         | ← High-thrust propulsion, afterburner ring
|-------------------------------------------------------|
|   THRUSTER VEINS                                      | ← Vectoring exhaust ports for agility maneuvering
+-------------------------------------------------------+`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-bold text-primary mb-2">Visual Description</h4>
                        <div className="border p-4 rounded-lg bg-background/30">
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                <li><span className="font-semibold text-foreground">Color Scheme:</span> Sleek carbon-black hull with bold HEGGIE-orange slash striping across fins and emitter rings.</li>
                                <li><span className="font-semibold text-foreground">Markings:</span> Faulcon deLacy crest on both engine mounts; HEGGIE “Tier III Escort” badge engraved near the canopy hatch.</li>
                                <li><span className="font-semibold text-foreground">Shape:</span> Viper profile—angular nose, sharp swept wings, ventral fins for stabilizing drift.</li>
                                <li><span className="font-semibold text-foreground">Underside:</span> Reinforced heat-resistant shielding, plasma recoil dampeners, and magnetic emergency clamp.</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2"><Clipboard className="text-primary"/>Ship Blueprint: Leviathan Super-Freighter</CardTitle>
                    <CardDescription>Detailed schematics and profile for the Leviathan Super-Freighter.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-black/30 p-4 rounded-lg border border-border/50">
                        <Image
                            src="https://placehold.co/956x669.png"
                            alt="Leviathan Super-Freighter Blueprint"
                            width={956}
                            height={669}
                            className="rounded-md w-full h-auto"
                            data-ai-hint="freighter blueprint"
                        />
                    </div>
                    <div>
                        <h4 className="font-bold text-primary mb-2">Vessel Profile</h4>
                        <div className="space-y-2 text-sm border p-4 rounded-lg bg-background/30">
                            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>Super-Freighter</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Designation</span><span>Leviathan</span></div>
                            <div className="flex justify-between items-start gap-4"><span className="text-muted-foreground shrink-0">Manufacturer</span><span className="text-right">HEGGIE Heavy Transport Division (Originally licensed by Kessler &amp; Holt)</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Length</span><span>428 meters</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Crew Capacity</span><span>22</span></div>
                            <div className="flex justify-between items-start gap-4"><span className="text-muted-foreground shrink-0">Cargo Bay</span><span className="text-right">1,800 tons (multi-deck vault-to-vault pods)</span></div>
                            <div className="flex justify-between items-start gap-4"><span className="text-muted-foreground shrink-0">Primary Use</span><span className="text-right">High-value commodity transfers, multi-faction logistics, orbital export</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">HEGGIE Clearance</span><span>Tier IV</span></div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-primary mb-2">Layout Overview</h4>
                        <pre className="p-4 bg-black/50 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto">
{`+-----------------------------------------------------------------------+
|   COMMAND BRIDGE & DIPLOMATIC CHAMBER                                | ← Multi-tier ops deck with HEGGIE secure channels
|-----------------------------------------------------------------------|
|   CREW CITADEL                                                        | ← Living quarters, command bunks, internal transit rail
|-----------------------------------------------------------------------|
|   CARGO SUPERSTRUCTURE BAY                                            | ← Triple-deck modular container grid with magnetic anchors
|-----------------------------------------------------------------------|
|   TRADE CONTROL TERMINAL                                              | ← Integrated holo-pads, trader ID scanner & vault channel uplinks
|-----------------------------------------------------------------------|
|   DEFENSE CORE ARRAY                                                  | ← Dual plasma shield belts, HEGGIE registry flux armor
|-----------------------------------------------------------------------|
|   ENGINE BLOCK: MagDrive-TitanCore                                    | ← Energy-intensive warp-capable drive cluster
|-----------------------------------------------------------------------|
|   HANGAR BAY (Optional Modules)                                       | ← External skiff slots, drone deployment cradles
+-----------------------------------------------------------------------+`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-bold text-primary mb-2">Visual Description</h4>
                        <div className="border p-4 rounded-lg bg-background/30">
                            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                                <li><span className="font-semibold text-foreground">Color Scheme:</span> Embossed silver alloy hull with wide HEGGIE-orange cargo lattice, crimson identifier rings across vault port seals.</li>
                                <li><span className="font-semibold text-foreground">Markings:</span> Tier IV access glyph near primary airlock; HEGGIE platinum crest emblazoned across dorsal command dome.</li>
                                <li><span className="font-semibold text-foreground">Shape:</span> Towering fuselage structure layered with strut architecture; octagonal midsection shaped for cargo layering.</li>
                                <li><span className="font-semibold text-foreground">Underside:</span> Quad landing gear arrays, shield emitter cradles, and stabilizing anchor hatches for orbital suspension.</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
