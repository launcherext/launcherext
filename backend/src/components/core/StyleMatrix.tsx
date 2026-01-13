"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, Ghost, Gamepad2, Waves, Skull, LucideIcon } from "lucide-react";

export type BannerStyle = "clean" | "chaotic" | "meme" | "retro" | "vaporwave" | "edgy";

interface StyleMatrixProps {
  selected: BannerStyle;
  onSelect: (style: BannerStyle) => void;
}

const STYLES: { id: BannerStyle; label: string; description: string; gradient: string; Icon: LucideIcon }[] = [
  {
    id: "clean",
    label: "Clean",
    description: "Minimal & Professional",
    gradient: "from-slate-600 to-slate-800",
    Icon: Sparkles
  },
  {
    id: "chaotic",
    label: "Chaotic",
    description: "Glitch & Noise",
    gradient: "from-red-500 to-orange-500",
    Icon: Zap
  },
  {
    id: "meme",
    label: "Meme",
    description: "Peak Internet Culture",
    gradient: "from-green-400 to-yellow-400",
    Icon: Ghost
  },
  {
    id: "retro",
    label: "Retro",
    description: "Pixel & Old School",
    gradient: "from-cyan-400 to-blue-600",
    Icon: Gamepad2
  },
  {
    id: "vaporwave",
    label: "Vaporwave",
    description: "A E S T H E T I C",
    gradient: "from-pink-400 via-purple-500 to-cyan-400",
    Icon: Waves
  },
  {
    id: "edgy",
    label: "Edgy",
    description: "Dark & Aggressive",
    gradient: "from-zinc-900 to-black",
    Icon: Skull
  },
];

export function StyleMatrix({ selected, onSelect }: StyleMatrixProps) {
  return (
// 1. Remove mt-8
    <div className="w-full">
      {/* 2. Remove internal label */}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {STYLES.map((style, index) => (
          <motion.button
            key={style.id}
            onClick={() => onSelect(style.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative group overflow-hidden border rounded-xl p-4 text-left transition-all duration-200 h-24",
              selected === style.id
                ? "border-accent-plasma/80 bg-accent-plasma/20 shadow-[0_0_30px_rgba(139,92,246,0.25)]"
                : "border-gray-800 hover:border-gray-600 bg-glass hover:bg-glass/80"
            )}
          >
            {/* Background Gradient Preview */}
            <div className={cn(
              "absolute inset-0 opacity-20 bg-gradient-to-br transition-opacity",
              style.gradient,
              selected === style.id ? "opacity-30" : "group-hover:opacity-25"
            )} />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <style.Icon className={cn(
                  "w-6 h-6 transition-colors duration-300",
                  selected === style.id ? "text-accent-plasma" : "text-gray-400 group-hover:text-gray-200"
                )} />
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  selected === style.id ? "bg-accent-plasma shadow-[0_0_8px_rgba(139,92,246,0.8)] scale-125" : "bg-gray-800"
                )} />
              </div>

              <div>
                <div className={cn(
                  "font-outfit font-bold text-sm uppercase tracking-wide transition-colors",
                  selected === style.id ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "text-gray-400 group-hover:text-gray-200"
                )}>
                  {style.label}
                </div>
                <div className={cn(
                  "text-[10px] font-mono mt-1 transition-colors",
                  selected === style.id ? "text-accent-plasma-bright font-bold" : "text-gray-500"
                )}>
                  {style.description}
                </div>
              </div>
            </div>

            {/* Selection Ring Effect */}
            {selected === style.id && (
              <>
                <motion.div
                  layoutId="style-ring"
                  className="absolute inset-0 border-2 border-accent-plasma rounded-xl pointer-events-none z-20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
                <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="absolute inset-0 bg-accent-plasma/10 z-0"
                />
              </>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
