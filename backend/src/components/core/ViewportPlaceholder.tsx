"use client";

import { motion } from "framer-motion";
import { Sparkles, Command } from "lucide-react";

export function ViewportPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center text-center opacity-60 select-none">
      <motion.div 
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1] 
        }} 
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="w-48 h-48 border border-accent-primary/20 rounded-full flex items-center justify-center mb-6 relative"
      >
        <div className="absolute inset-0 border border-accent-secondary/10 rounded-full scale-75 border-dashed" />
        <Sparkles className="w-8 h-8 text-accent-primary/40" />
      </motion.div>
      
      <h2 className="text-2xl font-syne font-bold text-white mb-2 tracking-tight">
        Awaiting Input
      </h2>
      <p className="text-concrete-400 font-mono text-sm max-w-xs">
        Configure your parameters in the control deck to generate a spectral banner.
      </p>
    </div>
  );
}
