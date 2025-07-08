'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Martini, Home, Briefcase, Factory, Building2, Ticket, Landmark, Spade } from 'lucide-react';

const businessData = [
    {
        icon: Martini,
        title: "Bar",
        description: "The social and economic cornerstone of any starport. Serve drinks, gather intel, and build a reputation. Upgrades increase income per patron, while bots automate service for passive revenue. A well-run bar can be expanded into a galactic franchise, influencing trade and culture across systems."
    },
    {
        icon: Home,
        title: "Residence",
        description: "A stable, long-term investment. Collect rent from tenants across the galaxy. Upgrades improve property value and rental income, while service bots handle automated collection. Successful property management can lead to the development of a vast galactic estate."
    },
    {
        icon: Briefcase,
        title: "Commerce Hub",
        description: "The heart of interstellar trade. Broker deals between factions, manage complex logistics, and profit from every transaction. Hub upgrades increase deal value, while trading bots automate transactions. A powerful hub can be developed into a galaxy-spanning commercial conglomerate."
    },
    {
        icon: Factory,
        title: "Industrial Facility",
        description: "The engine of production. Manufacture goods from raw materials, fulfilling large-scale orders for factions and markets. Upgrades boost production speed and efficiency, while assembly bots ensure the facility runs 24/7. Can be expanded into a massive industrial complex, dominating the supply chain."
    },
    {
        icon: Building2,
        title: "Construction Project",
        description: "Shape the galaxy itself. Undertake massive building projects, from planetary habitats to orbital megastructures. A high-capital venture where each upgrade increases project scope and payout. Can be developed into a legendary megastructure project."
    },
    {
        icon: Ticket,
        title: "Recreation Facility",
        description: "The galaxy's escape from the void. Operate entertainment venues, from vibrant arcades to luxurious holo-theaters. Upgrades enhance the quality of attractions, drawing more patrons. Can be expanded into a premier galactic resort, a destination for the wealthy and influential."
    },
    {
        icon: Landmark,
        title: "Galactic Bank",
        description: "The ultimate seat of financial power. After acquiring majority ownership, you can take control of the Galactic Bank itself. As owner, you manage vast capital flows, underwrite galactic ventures, and offer loans, turning it into the most powerful income-generating asset in your portfolio."
    },
    {
        icon: Spade,
        title: "Casino",
        description: "Engage in games of chance, from slots to high-stakes poker, at casinos across the galaxy. While not a business you can own, it's a high-risk, high-reward venue to directly leverage your credits. Success depends on luck, reputation, and nerve."
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
                        <p className="text-sm text-muted-foreground">{business.description}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
