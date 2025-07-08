'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Martini, Home, Briefcase, Factory, Building2, Ticket, Landmark } from 'lucide-react';

const businessData = [
    {
        icon: Martini,
        title: "Bar",
        description: "A classic starting point for any trader. Serve drinks to patrons to generate a steady, if modest, income. Upgrade your bar and hire bots to automate service and increase profits. Can be expanded into a galactic franchise."
    },
    {
        icon: Residence,
        title: "Residence",
        description: "Establish residential properties to collect rent. A reliable source of passive income. Like other businesses, it has its own upgrade path, bot automation for rent collection, and can be expanded into a sprawling estate."
    },
    {
        icon: Commerce,
        title: "Commerce Hub",
        description: "Manage a trading post, brokering deals and processing shipments. A commerce-focused business with high potential returns based on market knowledge. Can be upgraded into a galactic conglomerate."
    },
    {
        icon: Industry,
        title: "Industrial Facility",
        description: "Oversee a factory that produces valuable goods. This business type is about output and efficiency, generating significant income through production cycles. Can be expanded into a massive industrial complex."
    },
    {
        icon: Construction,
        title: "Construction Project",
        description: "Take on large-scale construction jobs, from planetary settlements to orbital stations. A high-investment, high-reward venture that requires significant capital to scale into a megastructure project."
    },
    {
        icon: Recreation,
        title: "Recreation Facility",
        description: "Provide entertainment for the masses, from arcades to holo-theaters. A fun and profitable business that can be expanded into a luxurious galactic resort."
    },
    {
        icon: Landmark,
        title: "Galactic Bank",
        description: "The pinnacle of financial power. After acquiring 100 shares, you can take over the bank itself, turning it into your most powerful income-generating asset with immense upgrade potential and partnership opportunities."
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
