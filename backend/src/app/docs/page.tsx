"use client";

import { Header, HeaderButton } from "@/components/layout/Header";
import { ArrowLeft, Twitter, ShieldCheck, Zap, Infinity, Lock, Flame, Bot, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function DocsPage() {
  const headerContent = (
    <Header
      actions={
        <>
          <HeaderButton
            icon={<ArrowLeft className="w-4 h-4" />}
            label="Back to App"
            href="/"
          />
          <HeaderButton
            icon={<Twitter className="w-4 h-4" />}
            href="https://x.com/dexdripfun"
          />
        </>
      }
    />
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        {headerContent}
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-12">
        <div className="space-y-12">
          
          {/* Intro */}
          <section className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Platform Documentation
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              DexDrip is the ultimate tool for generating professional meme coin branding assets and launching tokens instantly on Solana.
            </p>
          </section>

          <hr className="border-gray-800" />

          {/* Modes */}
          <section className="space-y-8">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Zap className="w-6 h-6 text-accent" />
              Creation Modes
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-accent/30 transition-all">
                <h3 className="text-lg font-medium mb-2 text-white">Existing Token</h3>
                <p className="text-gray-400 text-sm">
                  Already have a token? Enter your contract address (CA) or upload an image. We'll pull your metadata and generate fresh branding assets instantly.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-accent/30 transition-all">
                <h3 className="text-lg font-medium mb-2 text-white">Create New</h3>
                <p className="text-gray-400 text-sm">
                  Launching something new? Describe your idea or upload a reference image. match the vibe, generate assets, and launch directly to Pump.fun.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-border bg-card/60 hover:border-purple-500/30 transition-all md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-medium text-white">Tweet Sniper</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">PREMIUM</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Paste a tweet URL to instantly analyze its vibe and context. Our AI generates a matching meme coin banner and PFP in seconds. Perfect for trend trading.
                </p>
              </div>

              {/* Token Incinerator */}
              <div className="p-6 rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 hover:border-orange-500/30 transition-all md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-medium text-white">Token Incinerator</h3>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 font-mono">LIVE FLYWHEEL</span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm font-medium">Mechanism</p>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      20% of all platform "Success Fees" (referrals & launch fees) are automatically used to buy back and burn $Drip. Every successful launch makes $Drip scarcer.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm font-medium">Burn Leaderboard</p>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      See which tokens have "fed the machine" the most. Top contributors gain legendary status in the community and featured placement in the gallery.
                    </p>
                  </div>
                </div>
              </div>

              {/* Propaganda Bot */}
              <div className="p-6 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-medium text-white">Viral Propaganda Bot</h3>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">COMING SOON</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Our autonomous AI agent lives on X, scanning for viral potential and aggressively promoting DexDrip-launched tokens. It tracks "Value Created" for $Drip holders in real-time.
                </p>
              </div>
            </div>
          </section>

          {/* Access Tiers */}
          <section className="space-y-8">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-accent" />
              Access & Limits
            </h2>

            <div className="space-y-4">
              {/* Free Tier */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                <div className="p-2 rounded-full bg-gray-800 text-gray-400 mt-1">
                  <FilesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-white">Free User</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Everyone can start creating immediately.
                  </p>
                  <ul className="mt-2 text-sm text-gray-500 space-y-1">
                    <li>• 3 AI generations per day</li>
                    <li>• Basic styles access</li>
                  </ul>
                </div>
              </div>

              {/* Holder Tier */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
                <div className="p-2 rounded-full bg-accent/10 text-accent mt-1">
                  <Infinity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-white">Uncapped Creator</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Hold <span className="text-accent font-mono font-bold">250,000 $DRIP</span> or more.
                  </p>
                  <ul className="mt-2 text-sm text-gray-400 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-accent">✓</span> Unlimited AI generations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-accent">✓</span> Priority generation queue
                    </li>
                  </ul>
                </div>
              </div>

              {/* Whale Tier */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-900/10 border border-purple-500/30">
                <div className="p-2 rounded-full bg-purple-500/10 text-purple-400 mt-1">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-white">Power User</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Hold <span className="text-purple-400 font-mono font-bold">1,000,000 $DRIP</span> or more.
                  </p>
                  <ul className="mt-2 text-sm text-gray-400 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400">✓</span> Everything in Uncapped Creator
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400">✓</span> Access to <strong>Tweet Sniper</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400">✓</span> Future beta features
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

function FilesIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
