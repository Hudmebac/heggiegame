
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase } from 'lucide-react';
import { businessData } from '@/lib/business-data';

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
                                            <TableCell className="text-right font-mono text-amber-300">{cost.starterPrice.toLocaleString()}¢</TableCell>
                                            <TableCell className="text-right font-mono text-sky-300">{cost.isEstablishment ? 'N/A' : `+${(cost.growth * 100).toFixed(0)}%`}</TableCell>
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
