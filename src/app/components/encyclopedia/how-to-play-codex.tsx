

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
    GraduationCap, User, Rocket, Users, LineChart, Map, Briefcase, Landmark, ScrollText, BookOpen, 
    ChevronRight, ArrowRight, ShieldCheck, Sword, Scale, CarTaxiFront, Truck, LandPlot, Building, CandlestickChart, Clipboard 
} from "lucide-react";

const Section = ({ title, icon: Icon, summary, children, link }: { title: string, icon: React.ElementType, summary: string, children: React.ReactNode, link?: string }) => (
    <AccordionItem value={title}>
        <AccordionTrigger>
            <div className="flex items-center gap-3 text-left">
                <Icon className="h-6 w-6 text-primary" />
                <div>
                    <h3 className="font-headline text-lg">{title}</h3>
                </div>
            </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pl-4 border-l-2 border-primary/20 ml-3">
            <p className="text-muted-foreground italic">{summary}</p>
            
            <Collapsible>
                <CollapsibleTrigger asChild>
                    <Button variant="link" className="p-0 h-auto text-sm">
                        Show Detailed Guide <ChevronRight className="h-4 w-4 ml-1"/>
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 prose prose-invert prose-sm max-w-none prose-headings:text-primary prose-a:text-primary/90">
                    {children}
                </CollapsibleContent>
            </Collapsible>

            {link && (
                 <Button asChild variant="outline" size="sm" className="mt-2">
                    <Link href={link}>Go to {title} <ArrowRight className="h-4 w-4 ml-2"/></Link>
                 </Button>
            )}
        </AccordionContent>
    </AccordionItem>
);

export default function HowToPlayCodex() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <GraduationCap className="text-primary"/>
                    How to Play HEGGIE
                </CardTitle>
                <CardDescription>A comprehensive guide to navigating the galaxy and building your interstellar enterprise.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <Section 
                        title="Getting Started: Your First Steps"
                        icon={GraduationCap}
                        summary="Welcome to the High End Galactic Goods Interstellar Exchange (HEGGIE). This guide will help you begin your journey from a rookie captain to a galactic legend."
                    >
                        <h4>Welcome, Captain!</h4>
                        <p>Your goal in HEGGIE is to build your wealth and influence. You'll do this by choosing a career, managing businesses, trading goods, upgrading your ship, hiring crew, and completing missions. The galaxy is vast and full of opportunities—and dangers.</p>
                        
                        <h4>Your First Choices:</h4>
                        <ol>
                            <li><strong>Difficulty:</strong> When starting a new game, you'll select a difficulty. For new players, 'Easy' or 'Medium' is recommended. 'Hardcore' mode features permadeath and is for veteran players only.</li>
                            <li><strong>Career:</strong> Your career choice is crucial. It determines your starting ship, net worth, and unlocks unique gameplay loops. Don't worry, you can change careers later, but your initial choice will shape your early game. The 'Heggie Contractor' is a great choice for players who want to experience a bit of everything.</li>
                        </ol>

                        <h4>What to do First:</h4>
                        <ul>
                            <li><strong>Explore the Interface:</strong> Use the navigation menu on the left to explore different sections of the game. Get familiar with your <Link href="/captain">Captain</Link> profile, <Link href="/ship">Ship</Link> management, and the <Link href="/market">Market</Link>.</li>
                            <li><strong>Earn Some Credits:</strong> Your primary goal is to increase your Net Worth. A great starting point is the <Link href="/bar">'Bar'</Link> page (or other business pages like Residence, Commerce etc.). Click the main button to generate income. Use these initial credits to purchase upgrades for the business or for your ship.</li>
                            <li><strong>Check your Quests:</strong> Visit the <Link href="/quests">Quests</Link> page. Daily quests and objectives are a fantastic way to earn large sums of credits and learn different aspects of the game.</li>
                            <li><strong>Travel and Trade:</strong> Once you have some capital, head to the <Link href="/galaxy">Galaxy</Link> map. Traveling to a new system will change market prices. Buy goods for a low price in one system and sell them for a high price in another. This is the heart of being a trader.</li>
                        </ul>
                        <p>The universe is yours to explore. Good luck, Captain!</p>
                    </Section>

                    <Section
                        title="The Captain"
                        icon={User}
                        summary="Your identity in the galaxy. Manage your profile, finances, reputation, career, and faction allegiance."
                        link="/captain"
                    >
                        <p>The Captain page is your personal command center. Here you can view and modify key aspects of your character.</p>
                        <ul>
                            <li><strong>Profile:</strong> Change your avatar, edit your name, and generate a new backstory (bio).</li>
                            <li><strong>Finances:</strong> View your total Net Worth. This is the primary measure of your success. From here you can also access the <Link href="/bank">Galactic Bank</Link> and the <Link href="/captain/get-tokens">Token Shop</Link>.</li>
                            <li><strong>Ranking & Reputation:</strong> Your global rank on the leaderboard and your fleet size are displayed here. Your Reputation score influences mission availability and rewards. It increases through successful missions and business dealings.</li>
                            <li><strong>Career:</strong> Displays your current career and its perks/risks. You can initiate a career change from this card, which will require you to either pay a fee or complete a minigame.</li>
                            <li><strong>Faction:</strong> Manage your allegiance with the major galactic factions. Joining a faction provides powerful perks but can create enemies. Your standing with each faction is shown here.</li>
                            <li><strong>Insurance:</strong> Purchase one-time insurance policies to protect your assets against ship destruction, cargo loss, and high repair costs. Essential for mitigating risk, especially in Hardcore mode.</li>
                        </ul>
                    </Section>

                    <Section
                        title="Ship & Fleet"
                        icon={Rocket}
                        summary="Manage your active ship's systems and oversee your entire fleet. Your ship is your lifeline."
                        link="/ship"
                    >
                        <p>Your ships are your most important assets. On this page, you can maintain, upgrade, buy, and sell them.</p>
                        <ul>
                            <li><strong>Active Ship Maintenance:</strong> Your currently active ship's fuel and hull integrity are displayed here. You must refuel and repair your ship to keep it operational. These services are available at any starport.</li>
                            <li><strong>Your Fleet:</strong> This section lists all ships you own. The ship at the top of the list is your active vessel. You can Outfit, Sell, or Activate any ship in your fleet.</li>
                            <li><strong>Outfitting:</strong> Clicking 'Outfit' opens a detailed dialog where you can spend credits to upgrade individual components of a ship. Upgrades take time to install, during which the ship is unavailable for missions.</li>
                            <li><strong>Shipyard:</strong> Purchase new ship hulls to add to your fleet. Each ship type excels in different areas (e.g., Haulers for cargo, Vipers for combat).</li>
                             <li><strong>Ship Destruction & Salvage:</strong> If a ship's hull integrity reaches zero, it is destroyed. A destroyed ship is useless until it is salvaged. Salvaging a wreck is free, but all of its installed upgrades will be severely damaged, reducing their levels by half.</li>
                        </ul>
                    </Section>
                    
                    <Section
                        title="Crew"
                        icon={Users}
                        summary="Hire specialists to provide passive bonuses and enhance your ship's capabilities."
                        link="/crew"
                    >
                        <p>A good crew can be the difference between profit and disaster. Crew members provide powerful passive bonuses but require a one-time hiring fee and an ongoing salary that is automatically deducted each game cycle.</p>
                        <ul>
                            <li><strong>Engineer:</strong> Reduces fuel consumption or repair costs.</li>
                            <li><strong>Gunner:</strong> Improves your chances of winning combat encounters.</li>
                            <li><strong>Navigator:</strong> Helps you avoid the most dangerous pirate encounters.</li>
                            <li><strong>Negotiator:</strong> Improves bribe outcomes and can increase reputation gains.</li>
                        </ul>
                        <p>Your current crew and available recruits are listed on this page. Choose your crew wisely to complement your playstyle.</p>
                    </Section>

                    <Section
                        title="Market & Trading"
                        icon={LineChart}
                        summary="The heart of galactic commerce. Buy low, sell high, and watch the market trends to make your fortune."
                        link="/market"
                    >
                        <h4>The Market Interface</h4>
                        <p>This is where you'll spend a lot of your time. The market is dynamic, with prices changing every time you travel between star systems.</p>
                        <ul>
                            <li><strong>Commodity Market:</strong> A list of all goods available for trade in the current system. You can see their current price, supply, and demand. Use the filters and search bar to find specific items.</li>
                            <li><strong>Your Cargo Hold:</strong> Shows all items currently on your active ship. From here, you can initiate a sale.</li>
                            <li><strong>Market Chart:</strong> A powerful tool for analyzing price history. Track a commodity's value over time to spot trends and identify the best time to buy or sell.</li>
                        </ul>

                        <h4>Core Trading Principles</h4>
                        <ul>
                            <li><strong>Economic Specialization:</strong> Pay attention to a system's economy type (e.g., 'Industrial', 'Agricultural'). A system will produce goods related to its economy, meaning those goods will have high supply and low prices. Conversely, they will have high demand and high prices for goods they need to import. For example, buy 'Food Rations' cheap in an 'Agricultural' system and sell them for a high profit in an 'Industrial' system.</li>
                            <li><strong>Events:</strong> Random galactic events can drastically shift market prices. A "trade embargo" could make certain goods skyrocket in value, while a "mineral rush" could crash the price of ores. React quickly to these events to maximize your profits.</li>
                        </ul>
                    </Section>
                    
                    <Section
                        title="Trader Career: Warehouses"
                        icon={CandlestickChart}
                        summary="For the Trader career, build warehouses to stockpile goods and manipulate markets on a galactic scale."
                        link="/market"
                    >
                        <h4>Mastering Logistics</h4>
                        <p>As a Trader, you gain the unique ability to construct and manage a network of private warehouses in any system you visit. This transforms trading from simple arbitrage into a complex logistical puzzle.</p>
                        <ul>
                            <li><strong>Building Warehouses:</strong> On the Market page, you can build a warehouse in your current system for an initial fee. This gives you a local base of operations.</li>
                            <li><strong>Storing Goods:</strong> Transfer goods from your active ship's cargo hold into your warehouse. This allows you to stockpile commodities bought at a low price, freeing up your cargo hold for more immediate opportunities.</li>
                            <li><strong>Fulfilling Demand:</strong> When you travel to a system where a stored commodity is in high demand, you can retrieve it from your local warehouse and sell it on the market for massive profits, without needing to haul it across the galaxy.</li>
                            <li><strong>Upgrading:</strong> Warehouses can be upgraded to increase their storage capacity, allowing you to control larger quantities of goods and exert more significant influence on market prices.</li>
                        </ul>
                    </Section>

                    <Section
                        title="Stock Exchange"
                        icon={CandlestickChart}
                        summary="Engage in high-stakes trading by buying and selling shares in galactic corporations. A volatile but potentially lucrative venture."
                        link="/stocks"
                    >
                        <h4>The Galactic Stock Market</h4>
                        <p>The Stock Exchange allows you to invest in the biggest names in the galaxy, from ship manufacturers like Lakon Spaceways to your own business ventures.</p>
                        <ul>
                            <li><strong>Your Portfolio:</strong> This shows all the shares you currently own and their total current value. This is the quickest way to see how your investments are performing.</li>
                            <li><strong>Market Listing:</strong> View all tradable stocks, their current price, and their recent performance. Use the search and category filters to find specific companies.</li>
                            <li><strong>Dynamic Prices:</strong> Stock prices are not static. They fluctuate every few seconds and are subject to random market events like spikes and crashes. A shrewd investor watches the trends closely.</li>
                            <li><strong>Trading Panel:</strong> When you select a stock, the trading panel will appear. Here you can view its price history chart and use the "Buy" and "Sell" buttons to execute trades. Use the quick-trade buttons for rapid transactions.</li>
                            <li><strong>Floating Shares:</strong> If you manage to acquire full ownership of the Galactic Bank, you unlock the ability to float new shares on the market, creating your own publicly traded companies for other traders to invest in.</li>
                        </ul>
                    </Section>

                    <Section
                        title="Galaxy & Travel"
                        icon={Map}
                        summary="Navigate the stars. Travel between systems to find new markets, missions, and opportunities."
                        link="/galaxy"
                    >
                        <p>The galaxy is made up of multiple star systems, each with unique properties. Traveling between them is key to your success.</p>
                        <ul>
                            <li><strong>Galaxy Map:</strong> Shows all known systems and the trade routes connecting them. Your current location is marked. Click on a connected system to travel, or an unconnected one to negotiate a new route.</li>
                            <li><strong>System Info:</strong> Each system has a unique security level, economy, faction, and volatility. High-security systems are safer but may have lower profit margins. Anarchy systems are dangerous but can offer incredible rewards for the brave.</li>
                            <li><strong>Planet Map:</strong> Within each system are multiple planets. Traveling between planets consumes a small amount of fuel and can be necessary for certain missions or to find specific resources.</li>
                            <li><strong>Planetary Modifiers:</strong> The type of planet you are on affects the income from your business ventures. A business on a lush 'Terrestrial' world will be more profitable than the same business on a 'Barren' rock.</li>
                            <li><strong>Opening New Routes:</strong> You can't travel to a system until a trade route is established. If no route exists, you can initiate a negotiation minigame to open one. A better score in the minigame results in a lower establishment cost.</li>
                        </ul>
                    </Section>
                     <Section
                        title="Business Ventures"
                        icon={Briefcase}
                        summary="Establish and upgrade various businesses to generate passive income streams across the galaxy."
                    >
                        <p>Beyond active trading, a true tycoon builds a portfolio of income-generating businesses. Each business type has its own page, accessible from the main navigation menu.</p>
                        <ul>
                            <li><strong>Types of Businesses:</strong> You can run a <Link href="/bar">Bar</Link>, <Link href="/residence">Residence</Link>, <Link href="/commerce">Commerce</Link> Hub, <Link href="/industry">Industrial</Link> Facility, <Link href="/construction">Construction</Link> Project, or a <Link href="/recreation">Recreation</Link> facility.</li>
                            <li><strong>Core Gameplay:</strong> On each business page, you can click the main button to generate income manually. You can upgrade the business's level to increase this income. You can also hire bots to automate this process, generating passive income every second.</li>
                            <li><strong>Establishment & Expansion:</strong> Once you have hired the maximum number of bots, you can purchase the business 'establishment' itself. This unlocks a new set of options, allowing you to expand the business through several tiers (for a high cost), manage its market value, and seek partners.</li>
                            <li><strong>Partnerships:</strong> Once you own an establishment, you can sell stakes to investment partners. This gives you a large, immediate cash injection but reduces your share of the passive income.</li>
                        </ul>
                    </Section>
                     <Section
                        title="The Galactic Bank"
                        icon={Landmark}
                        summary="Secure your funds, play the market, and eventually acquire the bank itself for ultimate financial power."
                        link="/bank"
                    >
                        <p>The Galactic Bank is your financial hub. Initially, you are a client, but with enough investment, you can become its owner.</p>
                        <ul>
                            <li><strong>Client Services:</strong> As a client, you can deposit and withdraw your funds. Your deposits will accrue interest over time. The bank's share price fluctuates every five minutes, simulating a real market.</li>
                            <li><strong>Path to Ownership:</strong> You can purchase shares in the bank. Owning more than 5,000 of the 10,000 total shares gives you a majority stake, allowing you to control the bank's interest rate. Be careful: higher interest rates are good for your deposits but may lower shareholder confidence and decrease the share price, while lower rates can boost the share price.</li>
                            <li><strong>Full Acquisition:</strong> Once you own all 10,000 shares, you can pay a final, large fee to nationalize the bank, converting it into your own private business venture.</li>
                            <li><strong>Bank Ownership:</strong> After acquisition, the bank becomes your most powerful business, allowing you to upgrade its infrastructure and hire financial bots for massive passive income. You will still retain your personal bank account for deposits and withdrawals.</li>
                        </ul>
                    </Section>
                     <Section
                        title="Hauler Career: Fleet Logistics"
                        icon={Truck}
                        summary="As a Hauler, your success depends on managing a fleet of ships to complete lucrative transport contracts."
                        link="/hauler"
                    >
                        <h4>Managing Your Fleet</h4>
                        <p>Unlike other careers that focus on a single active ship, the Hauler career is about logistics. You will acquire multiple ships and assign them to contracts based on their capabilities.</p>
                        <ul>
                            <li><strong>The Contract Board:</strong> The <Link href="/hauler">Hauler</Link> page is your mission control. Here, you can scan for available trade route contracts. These contracts have specific requirements, such as cargo capacity, fuel, and even minimum ship component levels.</li>
                            <li><strong>Assigning Ships:</strong> When you accept a contract, the system automatically assigns the best-suited, available ship from your fleet. A ship is considered 'best-suited' if it meets all contract requirements with the most efficiency.</li>
                            <li><strong>Wear and Tear:</strong> Completing contracts takes a toll on your ships. They will consume fuel and suffer minor hull damage (wear-and-tear) upon completion. You must manage your fleet's condition on the <Link href="/ship">Ship</Link> page to keep them operational for future contracts.</li>
                             <li><strong>Risk vs. Reward:</strong> Contracts in more dangerous systems offer higher payouts but come with increased risk of pirate interdiction. A strong combat ship in your fleet might be necessary to protect your assets, even if it's not the one hauling the cargo.</li>
                        </ul>
                    </Section>
                     <Section
                        title="Taxi Pilot Career: Passenger Transport"
                        icon={CarTaxiFront}
                        summary="As a Taxi Pilot, you ferry passengers across the galaxy, from tourists to high-risk VIPs."
                        link="/taxi"
                    >
                        <h4>The Dispatch Network</h4>
                        <p>Your success as a Taxi Pilot relies on your reputation, speed, and the quality of your vessels. You'll manage a fleet of passenger-focused ships to take on a variety of fares.</p>
                        <ul>
                             <li><strong>Finding Fares:</strong> On the <Link href="/taxi">Taxi</Link> page, you can scan the dispatch network for available passengers. Each fare will list the destination, the payout, and any specific requirements the passenger has.</li>
                             <li><strong>Passenger Demands:</strong> Some passengers are pickier than others. A high-paying VIP might require a ship with high levels of 'Passenger Comfort' or 'Passenger Security' upgrades. You must have a ship in your fleet that meets these requirements to accept the fare.</li>
                             <li><strong>Fleet Management:</strong> You can assign any available, suitable ship from your fleet to a fare. Smaller, faster ships are great for time-sensitive bonuses, while more luxurious ships can take on the high-paying clients.</li>
                             <li><strong>Time Bonuses:</strong> Many fares offer a significant bonus for timely arrival. The travel duration is affected by your assigned ship's engine and power core levels, rewarding investment in high-performance vessels.</li>
                        </ul>
                    </Section>
                     <Section
                        title="Landlord Career: Property Management"
                        icon={LandPlot}
                        summary="Build a real estate empire by acquiring, upgrading, leasing, and selling properties across the galaxy."
                        link="/landlord"
                    >
                        <h4>Acquiring Property</h4>
                        <p>The 'Landlord' career is your gateway to real estate. On the Landlord page, you can:</p>
                        <ul>
                            <li><strong>Purchase New Properties:</strong> Buy different types of properties (Residential, Commercial, Industrial, etc.) in your current system.</li>
                            <li><strong>Scout the Market:</strong> Use the "Scout for Listings" feature to find properties being sold by NPCs. This allows you to acquire properties in various systems and potentially find a good deal.</li>
                        </ul>

                        <h4>Upgrading and Leasing</h4>
                        <ul>
                             <li><strong>Upgrades:</strong> Each property has a unique upgrade path. Investing in upgrades increases the property's value and makes it eligible for more lucrative lease agreements.</li>
                             <li><strong>Finding Tenants:</strong> Use the "Find Tenants" action to generate a list of lease proposals. Each proposal will have specific requirements for property type and level.</li>
                             <li><strong>Leases:</strong> Assign a suitable property to a lease proposal to start generating passive rent income over time.</li>
                        </ul>

                         <h4>Selling Your Properties</h4>
                        <ul>
                             <li><strong>Listing on the Market:</strong> Instead of a simple sale, you can list your properties on the open market. Set an asking price and wait for offers.</li>
                             <li><strong>Managing Offers:</strong> You may receive multiple offers from different NPC buyers. These offers can be above, at, or below your asking price. You have the power to accept the best deal or decline them all and wait for a better opportunity.</li>
                        </ul>
                    </Section>
                     <Section
                        title="Galactic Official: Diplomacy & Staff"
                        icon={Scale}
                        summary="Manage diplomatic relations by hiring staff and undertaking sensitive missions to grow your influence."
                        link="/official"
                    >
                        <h4>Building Your Diplomatic Corps</h4>
                        <p>As a Galactic Official, your power comes not just from your own actions, but from the team you build. Your primary goal is to increase your "Influence" score.</p>
                        <ul>
                            <li><strong>Hiring Staff:</strong> On the <Link href="/official">Galactic Official</Link> page, you can recruit diplomatic staff. Each staff member has a hiring fee, an ongoing salary, and a unique success rate for missions. A more skilled diplomat costs more but is more likely to succeed.</li>
                            <li><strong>Staff Limits:</strong> You cannot hire an unlimited number of staff. The size of your diplomatic corps is tied directly to your Influence. The higher your influence, the more staff members you can have on your payroll.</li>
                            <li><strong>Requesting Mandates:</strong> Use the "Request New Mandates" button to generate a list of available diplomatic missions. These missions range from simple treaty signings to high-stakes mediations between warring factions.</li>
                            <li><strong>Assigning Missions:</strong> To accept a mission, you must assign an available staff member to it. The staff member's success rate will be a key factor in the mission's outcome. Once a mission is complete, your staff member becomes available for a new assignment.</li>
                        </ul>
                        <p>Managing your staff effectively is the key to rising through the ranks from a lowly Intern to a respected Ambassador.</p>
                    </Section>
                     <Section
                        title="Quests & Objectives"
                        icon={ScrollText}
                        summary="Take on missions from the quest board for large rewards and reputation gains."
                        link="/quests"
                    >
                        <p>The Quest Board is a primary source of income and adventure. Check it often for new opportunities.</p>
                        <ul>
                            <li><strong>Quest Types:</strong> You will find various types of missions, including Bounties, Daily tasks, unique storyline Quests, and timed Objectives.</li>
                            <li><strong>Objectives:</strong> Timed Objectives challenge you to complete a certain number of actions (e.g., "Serve 100 patrons") within a time limit for a bonus reward. These are a great way to earn extra credits while working on your businesses.</li>
                            <li><strong>Career Missions:</strong> Your chosen career will unlock unique, repeatable missions on its dedicated page. For example, a Hauler can accept transport contracts that utilize their entire fleet, not just their active ship. These missions require careful fleet management, as they have specific fuel, cargo, and hull integrity requirements.</li>
                        </ul>
                    </Section>
                </Accordion>
            </CardContent>
        </Card>
    );
}


    