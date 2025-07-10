
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Martini, Home, Briefcase, Factory, Building2, Ticket, Landmark, Spade, Coins, ChevronsUp, Bot, Percent } from 'lucide-react';

const businessData = [
    {
        icon: Martini,
        title: "Bar",
        description: "The social and economic cornerstone of any starport. Serve drinks, gather intel, and build a reputation. Upgrades increase income per patron, while bots automate service for passive revenue. A well-run bar can be expanded into a galactic franchise, influencing trade and culture across systems.",
        costs: [
            { label: "Upgrade Cost", value: "200", percent: 15, icon: ChevronsUp },
            { label: "Bot Cost", value: "400", percent: 25, icon: Bot },
            { label: "Establishment", value: "100,000", icon: Coins },
        ]
    },
    {
        icon: Home,
        title: "Residence",
        description: "A stable, long-term investment. Collect rent from tenants across the galaxy. Upgrades improve property value and rental income, while service bots handle automated collection. Successful property management can lead to the development of a vast galactic estate.",
        costs: [
            { label: "Upgrade Cost", value: "250", percent: 30, icon: ChevronsUp },
            { label: "Bot Cost", value: "300", percent: 30, icon: Bot },
            { label: "Deed Issuance", value: "400,000", icon: Coins },
        ]
    },
    {
        icon: Briefcase,
        title: "Commerce Hub",
        description: "The heart of interstellar trade. Broker deals between factions, manage complex logistics, and profit from every transaction. Hub upgrades increase deal value, while trading bots automate transactions. A powerful hub can be developed into a galaxy-spanning commercial conglomerate.",
        costs: [
            { label: "Upgrade Cost", value: "300", percent: 35, icon: ChevronsUp },
            { label: "Bot Cost", value: "400", percent: 35, icon: Bot },
            { label: "Expansion", value: "800,000", icon: Coins },
        ]
    },
    {
        icon: Factory,
        title: "Industrial Facility",
        description: "The engine of production. Manufacture goods from raw materials, fulfilling large-scale orders for factions and markets. Upgrades boost production speed and efficiency, while assembly bots ensure the facility runs 24/7. Can be expanded into a massive industrial complex, dominating the supply chain.",
        costs: [
            { label: "Upgrade Cost", value: "350", percent: 40, icon: ChevronsUp },
            { label: "Bot Cost", value: "200", percent: 50, icon: Bot },
            { label: "Permit", value: "1,200,000", icon: Coins },
        ]
    },
    {
        icon: Building2,
        title: "Construction Project",
        description: "Shape the galaxy itself. Undertake massive building projects, from planetary habitats to orbital megastructures. A high-capital venture where each upgrade increases project scope and payout. Can be developed into a legendary megastructure project.",
        costs: [
            { label: "Upgrade Cost", value: "400", percent: 75, icon: ChevronsUp },
            { label: "Bot Cost", value: "750", percent: 80, icon: Bot },
            { label: "Deed Licensing", value: "2,400,000", icon: Coins },
        ]
    },
    {
        icon: Ticket,
        title: "Recreation Facility",
        description: "The galaxy's escape from the void. Operate entertainment venues, from vibrant arcades to luxurious holo-theaters. Upgrades enhance the quality of attractions, drawing more patrons. Can be expanded into a premier galactic resort, a destination for the wealthy and influential.",
        costs: [
            { label: "Upgrade Cost", value: "500", percent: 80, icon: ChevronsUp },
            { label: "Bot Cost", value: "1,000", percent: 90, icon: Bot },
            { label: "Facility Expansion", value: "3,000,000", icon: Coins },
        ]
    },
    {
        icon: Landmark,
        title: "Galactic Bank",
        description: "The ultimate seat of financial power. After acquiring majority ownership, you can take control of the Galactic Bank itself. As owner, you manage vast capital flows, underwrite galactic ventures, and offer loans, turning it into the most powerful income-generating asset in your portfolio.",
        costs: []
    },
    {
        icon: Spade,
        title: "Casino",
        description: "Engage in games of chance, from slots to high-stakes poker, at casinos across the galaxy. While not a business you can own, it's a high-risk, high-reward venue to directly leverage your credits. Success depends on luck, reputation, and nerve.",
        costs: []
    }
]

export default function BusinessCodex() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2"><Briefcase className="text-primary"/>Business Ventures</CardTitle>
                <CardDescription>An overview of the different income-generating businesses you can establish across the galaxy.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {businessData.map(business => (
                    <div key={business.title} className="border p-4 rounded-lg bg-background/30 flex flex-col gap-2">
                        <h4 className="font-bold text-base text-primary flex items-center gap-2">
                            <business.icon className="h-5 w-5" />
                            {business.title}
                        </h4>
                        <p className="text-sm text-muted-foreground flex-grow">{business.description}</p>
                        {business.costs.length > 0 && (
                             <div className="pt-2 mt-auto border-t border-border/50 space-y-2 text-xs">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Action</TableHead>
                                            <TableHead className="text-right">Base Cost</TableHead>
                                            <TableHead className="text-right">Growth</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {business.costs.map(cost => (
                                        <TableRow key={cost.label}>
                                            <TableCell className="font-medium flex items-center gap-1"><cost.icon className="h-3 w-3" />{cost.label}</TableCell>
                                            <TableCell className="text-right font-mono text-amber-300">{Number(cost.value).toLocaleString()}¢</TableCell>
                                            <TableCell className="text-right font-mono text-sky-300">{cost.percent ? `+${cost.percent}%` : 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
