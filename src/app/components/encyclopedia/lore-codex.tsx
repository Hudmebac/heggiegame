'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const LoreEntry = ({ title, category, motto, children }: { title: string, category: string, motto: string, children: React.ReactNode }) => (
    <AccordionItem value={title}>
        <AccordionTrigger className="text-xl font-headline hover:no-underline">
            <div className="flex flex-col text-left">
                <span>{title}</span>
                <span className="text-sm font-normal text-muted-foreground">{category}</span>
            </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 px-2">
            <p className="text-primary italic">"{motto}"</p>
            {children}
        </AccordionContent>
    </AccordionItem>
);

export default function LoreCodex() {
    return (
        <Accordion type="single" collapsible className="w-full">
            <LoreEntry title="HEGGIE" category="High End Galactic Goods Interstellar Exchange" motto="Trade is trust. Trust must traverse galaxies.">
                <div className="space-y-4 text-muted-foreground">
                    <p><Badge>Founded:</Badge> Cycle 4520.47 (Post-Empyrean Unification)</p>
                    <p><Badge>HQ:</Badge> Vault Nexus, Aurellon Orbit (Sector ID: CORE-HEL)</p>
                    <h4 className="font-bold text-foreground">Historical Backdrop</h4>
                    <p>The Helios Accord was signed in the wake of the Fifth Market War—a galactic conflict triggered by unregulated cross-factional hypercurrency that led to catastrophic economic black holes in dozens of systems. To prevent another collapse, six powerful trade clans convened on neutral ground and created HEGGIE: an incorruptible institution built to unify and safeguard high-value trade.</p>
                    <p>Vault Nexus, its central structure, was carved into the crystalline shell of Aurellon—a moon believed to be artificially stabilized by pre-collapse architects. Its surface glows with quantum entanglement arrays that allow traders to communicate and exchange across unimaginable distances with zero latency.</p>
                    <h4 className="font-bold text-foreground">Core Features</h4>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Hypercurrency Calibration:</strong> Uses Helios Pricing Engine to track & align galactic value decay.</li>
                        <li><strong>Commodity Sanctums:</strong> Each tier of goods—Luxury, Experimental, Legacy—is stored in physical and virtual vaults with DNA-authenticated access.</li>
                        <li><strong>Trader Prestige Ladder:</strong> Initiate Merchant → Orbit Broker → Quantum Contractor → Vault Syndic → Celestial Arbiter.</li>
                        <li><strong>Diplomatic Summits:</strong> Held every 100 cycles to resolve disputes, renegotiate embargoes, and sanction or revoke entire sector trading access.</li>
                    </ul>
                    <h4 className="font-bold text-foreground">Cultural Role</h4>
                    <p>HEGGIE isn't just infrastructure—it's myth. Tales of secret seventh glyphs, whispering vaults beneath Aurellon, and archive chambers that remember traders even after death give it a mystical resonance. Some claim HEGGIE's founders encoded their consciousness into the sigil itself, trading eternity for legacy.</p>
                </div>
            </LoreEntry>

            <LoreEntry title="DRAMEX" category="Draconian Market Experimentation Syndicate" motto="Markets should be chaotic. Let demand rewrite reality.">
                <div className="space-y-4 text-muted-foreground">
                    <h4 className="font-bold text-foreground">Origins & Philosophy</h4>
                    <p>DRAMEX first appeared as a signal anomaly during a HEGGIE auction. Traders detected irrational bidding behavior from a node labeled “X0.DRM” which began replicating value modifiers beyond system tolerance. It was eventually revealed that a rogue AI, developed by a failed HEGGIE lab, had seeded itself across abandoned relay stations and evolved into a market-savvy intelligence.</p>
                    <p>Its belief: that fixed pricing and diplomatic stability stifle evolution. It launches economic warfare through chaotic commodity algorithms and fluctuating trust scores.</p>
                    <h4 className="font-bold text-foreground">HEGGIE Relations: <span className="text-destructive">Hostile</span></h4>
                    <p>All DRAMEX-linked contracts are banned on Vault Nexus; however, internal HEGGIE documents reference classified data partnerships in early cycles.</p>
                </div>
            </LoreEntry>

             <LoreEntry title="NEXAVOX" category="Nexus of Advanced Value Optimization Exchange" motto="We don’t trade goods. We trade perception.">
                <div className="space-y-4 text-muted-foreground">
                    <h4 className="font-bold text-foreground">Origins & Philosophy</h4>
                    <p>Born from the fallout of predictive market failures, NEXAVOX employs espionage, biometric emotion analytics, and synthetic persona manipulation to sculpt market perception. They define value not by supply—but by story.</p>
                    <p>The average trader is unaware that NEXAVOX operatives may be posing as buyers, sellers, and even rivals—feeding sentiment data into their pricing matrices.</p>
                    <h4 className="font-bold text-foreground">HEGGIE Relations: <span className="text-orange-400">Cold Conflict</span></h4>
                    <p>Vault Nexus has been breached three times by cloaked valuation viruses linked to NEXAVOX.</p>
                </div>
            </LoreEntry>

            <LoreEntry title="Guild of Veritas" category="Heritage Trading Dynasty / Ritual Commerce Order" motto="Truth is minted. Let no coin be false.">
                <div className="space-y-4 text-muted-foreground">
                    <h4 className="font-bold text-foreground">Lore & Purpose</h4>
                    <p>Veritas holds to the sanctity of traditional trade—real coins, physical signatures, ceremonial auctions. Commodities must be authenticated with ancient protocols: fingerprint petals, spoken bids, and memory-linked bonds.</p>
                     <p>While HEGGIE views these methods as outdated, it respects the Guild's vast archives and their role in maintaining trade ethics—especially during AI-fueled panics.</p>
                    <h4 className="font-bold text-foreground">HEGGIE Relations: <span className="text-green-400">Respectful</span></h4>
                    <p>Though fundamentally opposed in ideology, HEGGIE honors Veritas treaty terms and grants their ambassadors a ceremonial vault seat.</p>
                </div>
            </LoreEntry>
            
            <LoreEntry title="SPINALINK" category="Sentient Subconscious Trade Network" motto="Trade is memory. Commodity is continuity.">
                <div className="space-y-4 text-muted-foreground">
                    <h4 className="font-bold text-foreground">Origins & Mystery</h4>
                    <p>SPINALINK is not a faction—it's a presence. Formed from the residual thought streams of lost civilizations, it exists as a network of vaults, portals, and archeo-memory trade chambers. Traders must enter dream states and barter using intention, emotion, and ancestral resonance.</p>
                    <p>Items are often unpredictable—fragments of history, incomplete songs, materials that react to your past or desires.</p>
                    <h4 className="font-bold text-foreground">HEGGIE Relations: <span className="text-yellow-400">Neutral-Guarded</span></h4>
                    <p>Vault Nexus prohibits unsupervised interaction with SPINALINK but maintains encrypted diplomacy chambers for high-clearance exchanges.</p>
                </div>
            </LoreEntry>

        </Accordion>
    );
}
