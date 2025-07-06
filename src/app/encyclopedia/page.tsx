'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ItemCodex from "@/app/components/encyclopedia/item-codex";
import ShipCodex from "@/app/components/encyclopedia/ship-codex";
import LoreCodex from "@/app/components/encyclopedia/lore-codex";

export default function EncyclopediaPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-headline text-slate-200 tracking-wider">Galactic Encyclopedia</h2>
                <p className="text-muted-foreground">An archive of all known commodities, ships, and galactic lore.</p>
            </div>
            <Tabs defaultValue="commodities" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="commodities">Commodities</TabsTrigger>
                    <TabsTrigger value="ships">Ships & Upgrades</TabsTrigger>
                    <TabsTrigger value="lore">Lore</TabsTrigger>
                </TabsList>
                <TabsContent value="commodities">
                    <ItemCodex />
                </TabsContent>
                <TabsContent value="ships">
                    <ShipCodex />
                </TabsContent>
                <TabsContent value="lore">
                    <LoreCodex />
                </TabsContent>
            </Tabs>
        </div>
    );
}
