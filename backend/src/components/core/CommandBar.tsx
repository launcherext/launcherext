"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandBarProps {
  onGenerate: (address: string) => void;
  isLoading: boolean;
}

export function CommandBar({ onGenerate, isLoading }: CommandBarProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onGenerate(value);
    }
  };

  return (
    <div className="w-full relative group">
      <motion.form
        onSubmit={handleSubmit}
        className={cn(
          "relative flex items-center w-full bg-concrete-900 border transition-all duration-300 overflow-hidden",
          isFocused ? "border-accent-acid shadow-[0_0_20px_rgba(139,92,246,0.2)] scale-[1.01]" : "border-concrete-700 hover:border-concrete-500",
          isLoading ? "opacity-90 pointer-events-none" : ""
        )}
        initial={false}
        animate={{ height: "64px", borderRadius: "12px" }}
      >
        {/* Status Icon */}
        <div className="pl-5 pr-3 text-concrete-400">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-accent-acid" />
          ) : (
            <Search className={cn("w-5 h-5 transition-colors", isFocused ? "text-accent-acid" : "text-concrete-500")} />
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Paste Solana token address..."
          className="w-full bg-transparent border-none outline-none text-concrete-100 placeholder:text-concrete-600 font-mono text-lg h-full pr-4"
          spellCheck={false}
        />

        {/* Action Button (Visible when typed) */}
        <AnimatePresence>
          {value.length > 0 && !isLoading && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              type="submit"
              className="absolute right-2 px-4 py-1.5 bg-accent-acid text-bg-moss font-bold font-syne uppercase text-sm rounded-md tracking-wide hover:bg-white transition-colors flex items-center gap-2"
            >
              Generate <Zap className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Loading Scanline */}
        {isLoading && (
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] bg-accent-acid w-full"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        )}
      </motion.form>
      
      {/* Glitch décor */}
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-20 pointer-events-none">
        <div className="w-1 h-1 bg-accent-acid rounded-full" />
        <div className="w-1 h-3 bg-accent-acid rounded-full" />
        <div className="w-1 h-1 bg-accent-acid rounded-full" />
      </div>
    </div>
  );
}
