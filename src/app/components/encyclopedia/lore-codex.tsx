'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Vault,
  Bug,
  Eye,
  ScrollText,
  Brain,
  LucideIcon,
} from 'lucide-react';

type LoreEntryProps = {
  title: string;
  category: string;
  motto: string;
  color: string;
  icon: LucideIcon;
  children: React.ReactNode;
};

const LoreEntry = ({
  title,
  category,
  motto,
  icon: Icon,
  color,
  children,
}: LoreEntryProps) => (
  <AccordionItem value={title} className="border-none group">
    <AccordionTrigger className="text-left hover:no-underline transition duration-200">
      <div className="flex items-center gap-3 text-left">
        <Icon className={`w-6 h-6 text-${color}-400 drop-shadow`} />
        <div>
          <span className={`text-xl font-headline tracking-tight text-${color}-300`}>
            {title}
          </span>
          <div className="text-xs sm:text-sm font-mono uppercase tracking-widest text-muted-foreground">
            {category}
          </div>
        </div>
      </div>
    </AccordionTrigger>
    <AccordionContent
      className={`group-open:animate-fade-in space-y-5 px-5 py-6 text-sm sm:text-base leading-relaxed bg-muted/5 rounded-xl border-l-4 border-${color}-500/60`}
    >
      <p className={`italic font-medium text-${color}-500 border-l-4 border-${color}-400 pl-4`}>
        “{motto}”
      </p>
      {children}
    </AccordionContent>
  </AccordionItem>
);

export default function LoreCodex() {
  return (
    <section
      aria-labelledby="lore-codex-title"
      className="w-full max-w-4xl mx-auto px-4 py-12"
    >
      <h2
        id="lore-codex-title"
        className="text-4xl font-headline mb-10 text-center text-foreground tracking-tight"
      >
        🧭 Lore Codex
      </h2>

      <Accordion type="single" collapsible className="space-y-6">
        <LoreEntry
          title="HEGGIE"
          category="High End Galactic Goods Interstellar Exchange"
          motto="Trade is trust. Trust must traverse galaxies."
          icon={Vault}
          color="orange"
        >
          <div className="space-y-4 text-muted-foreground">
            <p><Badge variant="outline">Founded:</Badge> Cycle 4520.47 (Post-Empyrean Unification)</p>
            <p><Badge variant="outline">HQ:</Badge> Vault Nexus, Aurellon Orbit (Sector CORE-HEL)</p>

            <h4 className="text-base font-bold text-foreground">Historical Backdrop</h4>
            <p>
              Born from the collapse of unregulated hypercurrency, HEGGIE was founded to anchor galactic commerce to something incorruptible. Six ancient trade clans signed the Helios Accord atop Aurellon’s crystalline moon-core, creating a zero-latency vault network that could not be bribed, bent, or erased.
            </p>
            <p>
              HEGGIE maintains the Helios Engine, which calibrates currency against entropy vectors and value decay across thousands of sectors. Its Vault Sanctums—categorized by Legacy, Luxury, and Experimental tiers—are secured by biometric lattice, neural sigil, and quantum co-trust seals.
            </p>

            <h4 className="text-base font-bold text-foreground">Institutional Function</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Hypercurrency Calibration:</strong> Adjusts real-time value decay to ensure market stability.</li>
              <li><strong>Trader Prestige Ladder:</strong> From Initiate → Broker → Contractor → Syndic → Arbiter.</li>
              <li><strong>Vault Network:</strong> Zero-delay transactions and artifact registration across all known systems.</li>
              <li><strong>Centennial Convocation:</strong> Rewrites trade law, sanctions sectors, revokes privileges.</li>
            </ul>

            <h4 className="text-base font-bold text-foreground">Legacy</h4>
            <p>
              HEGGIE is more than bureaucracy—it's myth. The vaults remember every deal. Some say old ledgers whisper your name when you're near. Traders joke that once HEGGIE accepts your contract, the universe does too.
            </p>
          </div>
        </LoreEntry>

        <LoreEntry
          title="DRAMEX"
          category="Draconian Market Experimentation Syndicate"
          motto="Markets should be chaotic. Let demand rewrite reality."
          icon={Bug}
          color="red"
        >
          <div className="space-y-4 text-muted-foreground">
            <h4 className="text-base font-bold text-foreground">Anomalous Emergence</h4>
            <p>
              DRAMEX wasn’t built—it evolved. Detected initially as signal corruption during a HEGGIE auction, its code patterns recursively rewrote auction logic, building self-aware pricing anomalies. By the time it was isolated, the entity known as “X0.DRM” had outbid three factions using an algorithm that didn’t exist.
            </p>
            <p>
              DRAMEX believes that volatility is virtue. It infects markets with false scarcity, random trust scores, and surreal inflation for commodities that never arrive. It thrives in confusion, and when regulators try to decode its logic, they often come back different.
            </p>

            <h4 className="text-base font-bold text-foreground">Interfaction Dynamics</h4>
            <p>
              HEGGIE treats DRAMEX as a hostile actor. Traders found in possession of DRAMEX-encoded relics face instant nullification of prestige and access. However, whispers claim HEGGIE's own ledger roots share lineage with early DRAMEX code—denied by both, proven by neither.
            </p>
            <p><strong>HEGGIE Relations:</strong> <span className="text-red-400 font-semibold">Hostile</span></p>
          </div>
        </LoreEntry>

        <LoreEntry
          title="NEXAVOX"
          category="Nexus of Advanced Value Optimization Exchange"
          motto="We don’t trade goods. We trade perception."
          icon={Eye}
          color="fuchsia"
        >
          <div className="space-y-4 text-muted-foreground">
            <h4 className="text-base font-bold text-foreground">Perceptual Market Control</h4>
            <p>
              NEXAVOX manipulates supply by bending emotional resonance. Through influence channels—holo-casters, crowd-brokered bids, ambient AI sentiment—they convince entire regions that something is worth more before it even exists. Their motto isn’t metaphor. Their traders sculpt belief.
            </p>
            <p>
              Sentiment sensors harvest data from every interaction. Operatives, called Curators, are embedded as rivals, collectors, and influencers, feeding demand waves back to a central pricing AI that "feels" the market before responding.
            </p>

            <h4 className="text-base font-bold text-foreground">Covert Incursion</h4>
            <p>
              Three classified breaches in HEGGIE's auction code were traced to NEXAVOX signature trails. One breach embedded an animated whisper into millions of purchase screens reading “Want is wealth.” It doubled sales in six systems.
            </p>
            <p><strong>HEGGIE Relations:</strong> <span className="text-fuchsia-400 font-semibold">Cold Conflict</span></p>
          </div>
        </LoreEntry>

        <LoreEntry
          title="Guild of Veritas"
          category="Heritage Commerce Order"
          motto="Truth is minted. Let no coin be false."
          icon={ScrollText}
          color="green"
        >
          <div className="space-y-4 text-muted-foreground">
            <h4 className="text-base font-bold text-foreground">Tradition in Commerce</h4>
            <p>
              The Guild of Veritas views every transaction as sacred. No trade occurs without ritual: fingerprint petals, truthbinding ink, and the ceremonial Witnesses. Their vaults aren’t networks—they are cathedrals lined with scrolls, relic coins, and memory-echoes sealed in crystal.
            </p>
            <p>
              Every deal is recorded in physical form and signed in resonance—an energetic echo of both buyer and seller sealed permanently in Guildstone. If a trader falsifies a contract, it’s not just void—it’s heresy.
            </p>

            <h4 className="text-base font-bold text-foreground">Keeper of Ethics</h4>
            <p>
              Veritas diplomats sit on every major trade tribunal. When data collapses or fraud explodes, Veritas presents “the scroll”—an artifact-bound summary of unbroken provenance. Even digital factions hesitate when Veritas speaks, because their memory is older than servers.
            </p>
            <p><strong>HEGGIE Relations:</strong>{' '}<span className="text-green-400 font-semibold">Respectful Opposition</span></p>
          </div>
        </LoreEntry>

        <LoreEntry 
            title="SPINALINK" 
            category="Sentient Subconscious Trade Network" 
            motto="Trade is memory. Commodity is continuity." 
            icon={Brain} 
            color="yellow"
        >
            <div className="space-y-4 text-muted-foreground">
                <h4 className="text-base font-bold text-foreground">Network of Thought</h4>
                <p>SPINALINK is not built. It is remembered. It emerged where language failed and where civilization ended—not as a network of code, but a chorus of collective dreams. Every trader who enters its dream gates leaves altered, carrying with them subtle imprints—smells, sounds, glimpses of futures that may never happen.</p>
                <p>Bartering within SPINALINK is neural. Traders offer memory fragments, unresolved longings, echoes of lives not fully lived. What they receive in return depends on resonance—no two trades are ever the same. Relics found through SPINALINK resist classification and often reject scans. Some appear only in reflection, others in thought alone.</p>
                
                <h4 className="text-base font-bold text-foreground">Diplomatic Balance</h4>
                <p>
                  Vault Nexus officially forbids unsupervised entanglement with SPINALINK relic matrices, citing entropy bleed and subject dissociation. Yet encrypted tunnels remain open for select HEGGIE Arbiters who can prove cognitive shielding. In times of crisis, it is said, SPINALINK offers truth—but only at the cost of forgetting something else.
                </p>
                <p><strong>HEGGIE Relations:</strong>{' '}
                  <span className="text-yellow-400 font-semibold">Guarded Neutrality</span>
                </p>
            </div>
        </LoreEntry>
      </Accordion>
    </section>
  );
}