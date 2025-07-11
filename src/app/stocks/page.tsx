
'use client';
import { useGame } from '@/app/components/game-provider';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CandlestickChart, TrendingUp, TrendingDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Stock } from '@/lib/types';
import { Input } from '@/components/ui/input';

const PortfolioCard = ({ portfolio, stocks, onSelectStock }: { portfolio: any[], stocks: Stock[], onSelectStock: (stock: Stock) => void }) => {
    const portfolioValue = portfolio.reduce((acc, holding) => {
        const currentStock = stocks.find(s => s.id === holding.id);
        return acc + (currentStock ? currentStock.price * holding.shares : 0);
    }, 0);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="font-headline text-lg">Your Portfolio</CardTitle>
                <CardDescription>Total Value: {portfolioValue.toLocaleString()}¢</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    {portfolio.length > 0 ? portfolio.map(holding => {
                        const stock = stocks.find(s => s.id === holding.id);
                        if (!stock) return null;
                        return (
                            <div 
                                key={holding.id} 
                                className="flex justify-between items-center p-2 rounded bg-card/50 cursor-pointer hover:bg-muted transition-colors"
                                onClick={() => onSelectStock(stock)}
                            >
                                <div>
                                    <p className="font-semibold">{stock.name}</p>
                                    <p className="text-xs text-muted-foreground">{holding.shares} shares</p>
                                </div>
                                <p className="font-mono text-amber-300">{(stock.price * holding.shares).toLocaleString()}¢</p>
                            </div>
                        )
                    }) : <p className="text-muted-foreground text-center">You do not own any shares.</p>}
                </div>
            </CardContent>
        </Card>
    );
}

const TradePanel = ({ stock, ownedShares, netWorth, onBuy, onSell }: { stock: Stock, ownedShares: number, netWorth: number, onBuy: (id: string, amount: number) => void, onSell: (id: string, amount: number) => void }) => {
    const [tradeAmount, setTradeAmount] = useState(1);
    const canAfford = netWorth >= stock.price * tradeAmount;
    
    return (
        <Card className="sticky top-6">
            <CardHeader>
                <CardTitle className="font-headline text-lg">{stock.name}</CardTitle>
                <CardDescription>Price: {stock.price.toLocaleString()}¢</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-40 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stock.history.map((price, index) => ({name: index, price}))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="name" hide />
                            <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide/>
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                            <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                    <p className="text-sm">You own: <span className="font-mono">{ownedShares}</span> shares</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setTradeAmount(prev => Math.max(1, prev - 1))}>-</Button>
                        <Input type="number" value={tradeAmount} onChange={e => setTradeAmount(Number(e.target.value))} className="w-20 text-center bg-background border border-input rounded-md"/>
                        <Button variant="outline" onClick={() => setTradeAmount(prev => prev + 1)}>+</Button>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => onBuy(stock.id, tradeAmount)} disabled={!canAfford}>Buy ({ (stock.price * tradeAmount).toLocaleString() }¢)</Button>
                        <Button variant="destructive" onClick={() => onSell(stock.id, tradeAmount)} disabled={ownedShares < tradeAmount}>Sell ({ (stock.price * tradeAmount).toLocaleString() }¢)</Button>
                    </div>
                    {!canAfford && <p className="text-destructive text-xs">Insufficient funds.</p>}
                </div>
            </CardContent>
        </Card>
    )
}

export default function StocksPage() {
    const { gameState, handleBuyStock, handleSellStock } = useGame();
    const [sortKey, setSortKey] = useState<keyof Stock>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

    if (!gameState) return null;

    const { playerStats } = gameState;
    const { portfolio, stocks } = playerStats;
    
    const sortedStocks = [...stocks].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
    });

    const handleSort = (key: keyof Stock) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };
    
    const ownedShares = portfolio.find(s => s.id === selectedStock?.id)?.shares || 0;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2"><CandlestickChart className="text-primary"/> HEGGIE Stock Exchange</CardTitle>
                    <CardDescription>Buy and sell shares in galactic corporations. Prices fluctuate dynamically.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-3">
                    <PortfolioCard portfolio={portfolio} stocks={stocks} onSelectStock={setSelectedStock} />
                </div>

                <div className="xl:col-span-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Galactic Market</CardTitle>
                            <CardDescription>Click on a stock to view details and trade.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead onClick={() => handleSort('name')} className="cursor-pointer">Name {sortKey === 'name' && (sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                                        <TableHead onClick={() => handleSort('price')} className="cursor-pointer">Price {sortKey === 'price' && (sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                                        <TableHead onClick={() => handleSort('changePercent')} className="cursor-pointer">Change (24h) {sortKey === 'changePercent' && (sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedStocks.map(stock => (
                                        <TableRow key={stock.id} onClick={() => setSelectedStock(stock)} className="cursor-pointer" data-state={selectedStock?.id === stock.id ? 'selected' : ''}>
                                            <TableCell className="font-medium">{stock.name}</TableCell>
                                            <TableCell className="font-mono text-amber-300">{stock.price.toLocaleString()}</TableCell>
                                            <TableCell className={cn(stock.changePercent >= 0 ? 'text-green-400' : 'text-destructive')}>
                                                <span className="flex items-center gap-1">
                                                    {stock.changePercent >= 0 ? <TrendingUp /> : <TrendingDown />}
                                                    {stock.changePercent.toFixed(2)}%
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="xl:col-span-3">
                    {selectedStock ? (
                        <TradePanel 
                            stock={selectedStock}
                            ownedShares={ownedShares}
                            netWorth={playerStats.netWorth}
                            onBuy={handleBuyStock}
                            onSell={handleSellStock}
                        />
                    ) : (
                        <Card className="h-full flex items-center justify-center text-center">
                            <CardHeader>
                                <CardTitle className="font-headline">Select a Stock</CardTitle>
                                <CardDescription>Click on a stock from the market or your portfolio to see details.</CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
