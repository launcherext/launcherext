"use client";

import { useRouter } from "next/navigation";
import { HeroVideo } from "@/components/landing/HeroVideo";
import { Button } from "@/components/primitives/Button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Video */}
      <HeroVideo />

      {/* Content Overlay */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl mx-auto space-y-8">
        
        {/* Animated Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">
              The Ultimate Launchpad
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-2">
            Create. Trade. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">
              Dominate.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Launch tokens with AI-generated assets, snipe trends instantly, and track your wins with professional-grade analytics.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button 
            size="lg" 
            onClick={() => router.push('/create')}
            icon={<ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />}
            iconPosition="right"
            className="
              px-8 py-6 rounded-full text-lg
              !bg-white !text-black font-bold
              hover:!bg-zinc-100 hover:scale-[1.02]
              transition-all duration-200 ease-out
              shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]
              border border-transparent
              z-50 pointer-events-auto group
            "
          >
            Launch App
          </Button>
        </motion.div>

      </div>

      {/* Footer / Status */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 text-gray-500 text-xs font-mono uppercase tracking-widest"
      >
        DexDrip // V1.0.0
      </motion.div>
    </main>
  );
}
