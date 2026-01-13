"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { StatsTicker } from "@/components/marketing/StatsTicker";
import { HeaderButton } from "@/components/layout/Header";
import { 
  FileText, 
  ArrowLeft, 
  Shield, 
  Rocket, 
  Zap, 
  Lock 
} from "lucide-react";
import Link from "next/link";
import { WalletButton } from "@/components/core/WalletButton";
import { Twitter, Github, LayoutGrid, Clock, ExternalLink } from "lucide-react";

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent selection:text-black">
      {/* Navigation */}
      <div className="flex flex-col w-full sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <StatsTicker />
        <Header
          actions={
            <>
              <div className="flex items-center gap-1 bg-gray-950/50 p-1 rounded-xl border border-white/5 mr-2">
                <HeaderButton
                  icon={<ArrowLeft className="w-4 h-4" />}
                  label="Back to Terminal"
                  href="/"
                />
              </div>

              <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />

              <div className="flex items-center gap-1">
                <HeaderButton
                  icon={<Twitter className="w-4 h-4" />}
                  href="https://x.com/dexdripfun"
                />
                <HeaderButton
                  icon={<Github className="w-4 h-4" />}
                  href="https://github.com/nullxnothing/dexdrip"
                />
              </div>

              <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />
              
              <WalletButton />
            </>
          }
        />
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title Header */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-accent/10 border border-accent/20">
              <FileText className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white">
              The <span className="text-accent">DexDrip</span> Whitepaper
            </h1>
            <p className="text-xl text-gray-500 max-w-xl mx-auto font-light">
              Weaponizing the retail trader for the memecoin supercycle.
            </p>
          </div>

          {/* Document Body */}
          <div className="prose prose-invert prose-lg max-w-none">
            
            {/* Section 1 */}
            <Section title="1. The Mission">
              <p>
                The memecoin supercycle isn't a bubble—it's a democratization of venture capital. 
                But retail traders are currently fighting with dull knives against snipers, bots, and insiders.
              </p>
              <p className="text-accent font-medium text-xl border-l-4 border-accent pl-4 my-8 bg-accent/5 py-4 pr-4">
                "Speed is the only edge left."
              </p>
              <p>
                **DexDrip** exists to weaponize the retail trader. We build professional-grade, "local-first" tools 
                that automate the creative and technical friction of launching and trading, letting you focus on execution.
              </p>
            </Section>

            {/* Section 2 */}
            <Section title="2. The Problem">
              <ul className="space-y-4 list-none pl-0">
                <ListItem icon={<Zap className="text-yellow-400" />} title="Creative Friction">
                  Launching a token requires Art, a Banner, a PFP, and a vibe. This takes 20-30 minutes manually. 
                  In crypto, 20 minutes is a lifetime.
                </ListItem>
                <ListItem icon={<Lock className="text-red-400" />} title="Technical Friction">
                  Navigating pump.fun, managing wallets, and ensuring safety is slow and prone to error.
                </ListItem>
                <ListItem icon={<Shield className="text-blue-400" />} title="Information Asymmetry">
                  Insiders know the meta before you do. You need AI to spot trends instantly.
                </ListItem>
              </ul>
            </Section>

            {/* Section 3 */}
            <Section title="3. The Solution: DexDrip Terminal">
              <p>
                DexDrip is an AI-native trading terminal that collapses the "Idea &rarr; Launch" loop to under 30 seconds.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-8">
                <FeatureCard 
                  title="Tweet Sniper" 
                  desc="Paste a viral tweet &rarr; receive a fully generated Brand (Ticker, Name, Art, Website)."
                />
                <FeatureCard 
                  title="One-Click Launch" 
                  desc="Deploy instantly to Pump.fun via PumpPortal APIs."
                />
                <FeatureCard 
                  title="Shadow Routing" 
                  desc="Your trades are local. Your keys are local. No server sees your private key."
                />
                <FeatureCard 
                  title="AI Art Engine" 
                  desc="Generates consistent, high-fidelity banners and PFPs in seconds."
                />
              </div>
            </Section>

            {/* Section 4 */}
            <Section title="4. $DRIP Tokenomics">
              <p>
                $DRIP is not a governance token. It is a **License Key**.
              </p>
              
              <div className="my-8 overflow-hidden rounded-xl border border-white/10 not-prose">
                <table className="w-full text-left bg-gray-900/50">
                  <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Feature</th>
                      <th className="px-6 py-4">Free Tier</th>
                      <th className="px-6 py-4 text-accent">Pro Tier ($DRIP Holder)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="px-6 py-4">Manual Art Studio</td>
                      <td className="px-6 py-4 text-green-400">✅ Yes</td>
                      <td className="px-6 py-4 text-green-400">✅ Yes</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">Pump.fun Launcher</td>
                      <td className="px-6 py-4 text-green-400">✅ Yes</td>
                      <td className="px-6 py-4 text-green-400">✅ Yes</td>
                    </tr>
                    <tr className="bg-accent/5">
                      <td className="px-6 py-4 font-medium text-white">Tweet Sniper (AI)</td>
                      <td className="px-6 py-4 text-gray-500">❌ No</td>
                      <td className="px-6 py-4 text-accent font-bold">✅ UNLOCKED</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">Shadow Bundles</td>
                      <td className="px-6 py-4 text-gray-500">❌ No</td>
                      <td className="px-6 py-4 text-accent">✅ UNLOCKED (Q1)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-900 border border-white/10 rounded-xl p-6 not-prose">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Supply & Requirements
                </h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Requirement</span>
                    <span className="text-white font-mono">1,000,000 $DRIP</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Total Supply</span>
                    <span className="text-white font-mono">1,000,000,000</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Tax</span>
                    <span className="text-white font-mono">0/0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Liquidity</span>
                    <span className="text-white font-mono">Burned</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Section 5 */}
            <Section title="5. Roadmap">
              <div className="space-y-6 border-l-2 border-white/10 pl-6 ml-2 my-8 not-prose">
                <RoadmapItem 
                  phase="Phase 1 (Now)" 
                  title="Launch Terminal V1" 
                  desc="Tweet Sniper + Art Engine released. Token generation event."
                  active
                />
                <RoadmapItem 
                  phase="Phase 2 (Q1 2026)" 
                  title="Shadow Bundles" 
                  desc="Launch on multiple wallets simultaneously to mimic organic volume and bypass sniper detection."
                />
                <RoadmapItem 
                  phase="Phase 3 (Q2 2026)" 
                  title="Mobile App" 
                  desc="iOS/Android app with push notifications for 'Sniper Alerts' when viral tweets drop."
                />
              </div>
            </Section>

            <div className="mt-20 pt-10 border-t border-white/10 text-center">
              <p className="text-2xl font-drip text-white mb-4">DexDrip</p>
              <p className="text-gray-500 text-sm">
                Built for the ones who click fast.
              </p>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}

// Helper Components
function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        {title}
      </h2>
      <div className="text-gray-400 leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  );
}

function ListItem({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <li className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/5">
      <div className="mt-1 flex-shrink-0">{icon}</div>
      <div>
        <strong className="text-white block mb-1">{title}</strong>
        <span className="text-sm text-gray-400">{children}</span>
      </div>
    </li>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-4 rounded-xl bg-black border border-white/10 hover:border-accent/50 transition-colors">
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function RoadmapItem({ phase, title, desc, active }: { phase: string, title: string, desc: string, active?: boolean }) {
  return (
    <div className="relative">
      <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 ${active ? 'bg-accent border-accent shadow-[0_0_10px_rgba(0,212,255,0.5)]' : 'bg-black border-gray-600'}`} />
      <div className="text-xs uppercase tracking-widest text-gray-500 mb-1 font-mono">{phase}</div>
      <h3 className={`text-lg font-bold mb-1 ${active ? 'text-white' : 'text-gray-300'}`}>{title}</h3>
      <p className="text-gray-500 text-sm">{desc}</p>
    </div>
  );
}
