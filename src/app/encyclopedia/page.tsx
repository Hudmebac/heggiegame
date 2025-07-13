
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
import HowToPlayCodex from "@/app/components/encyclopedia/how-to-play-codex";
import Image from "next/image";

export default function EncyclopediaPage() {
    return (
        <div className="space-y-6">
            <div className="text-center p-8 bg-card/50 rounded-lg border border-primary/20">
                <div className="flex justify-center items-center gap-4 mb-4">
                    <Image src="/images/logo/heggieRocket.png" alt="Heggie Rocket" width={64} height={64} className="hidden sm:block" />
                    <Image src="/images/logo/heggieLogo.png" alt="Heggie Logo" width={128} height={128} />
                    <Image src="/images/logo/heggieSpaceLogo.png" alt="Heggie Space Logo" width={64} height={64} className="hidden sm:block" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-headline text-primary tracking-wider">
                    HEGGIE: High End Galactic Goods Interstellar Exchange
                </h1>
                <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
                    Welcome, Captain! 🚀 Dive into a universe of high-stakes trading, daring exploration, and strategic enterprise. 
                    Build your fortune from a humble shuttle to a galactic powerhouse. 💰 
                    Manage businesses 🏢, customize your fleet 🛠️, take on risky missions 📜, and dominate the stock market 📈. 
                    The galaxy is yours for the taking. Good luck! ✨
                </p>
            </div>
            <Tabs defaultValue="how-to-play" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-10">
                    <TabsTrigger value="how-to-play">How to Play</TabsTrigger>
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
                <TabsContent value="how-to-play">
                    <HowToPlayCodex />
                </TabsContent>
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
