'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ItemCodex from "@/app/components/encyclopedia/item-codex";
import ShipCodex from "@/app/components/encyclopedia/ship-codex";
import AnatomyCodex from "@/app/components/encyclopedia/anatomy-codex";
import UpgradesCodex from "@/app/components/encyclopedia/upgrades-codex";
import LoreCodex from "@/app/components/encyclopedia/lore-codex";
import SystemCodex from "@/app/components/encyclopedia/system-codex";
import BusinessCodex from "@/app/components/encyclopedia/business-codex";
import GameplayCodex from "@/app/components/encyclopedia/gameplay-codex";
import CareerCodex from "@/app/components/encyclopedia/career-codex";

export default function EncyclopediaPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-headline text-slate-200 tracking-wider">Galactic Encyclopedia</h2>
                <p className="text-muted-foreground">An archive of all known commodities, ships, and galactic lore.</p>
            </div>
            <Tabs defaultValue="commodities" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-9">
                    <TabsTrigger value="commodities">Commodities</TabsTrigger>
                    <TabsTrigger value="ships">Ships</TabsTrigger>
                    <TabsTrigger value="careers">Careers</TabsTrigger>
                    <TabsTrigger value="anatomy">Anatomy</TabsTrigger>
                    <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
                    <TabsTrigger value="business">Business</TabsTrigger>
                    <TabsTrigger value="gameplay">Gameplay</TabsTrigger>
                    <TabsTrigger value="lore">Lore</TabsTrigger>
                    <TabsTrigger value="systems">Systems</TabsTrigger>
                </TabsList>
                <TabsContent value="commodities">
                    <ItemCodex />
                </TabsContent>
                <TabsContent value="ships">
                    <ShipCodex />
                </TabsContent>
                <TabsContent value="careers">
                    <CareerCodex />
                </TabsContent>
                <TabsContent value="anatomy">
                    <AnatomyCodex />
                </TabsContent>
                 <TabsContent value="upgrades">
                    <UpgradesCodex />
                </TabsContent>
                <TabsContent value="business">
                    <BusinessCodex />
                </TabsContent>
                <TabsContent value="gameplay">
                    <GameplayCodex />
                </TabsContent>
                <TabsContent value="lore">
                    <LoreCodex />
                </TabsContent>
                <TabsContent value="systems">
                    <SystemCodex />
                </TabsContent>
            </Tabs>
        </div>
    );
}
