"use client";

import { motion } from "framer-motion";
import { Image, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type GenerationMode = "banner" | "pfp";

interface ModeSelectorProps {
  selected: GenerationMode;
  onSelect: (mode: GenerationMode) => void;
}

const MODES: { id: GenerationMode; label: string; icon: typeof Image; description: string }[] = [
  {
    id: "banner",
    label: "Banner",
    icon: Image,
    description: "1500×500 DexScreener",
  },
  {
    id: "pfp",
    label: "Profile Pic",
    icon: User,
    description: "1000×1000 Square",
  },
];

export function ModeSelector({ selected, onSelect }: ModeSelectorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-center gap-2 p-1 bg-gray-900/50 rounded-xl border border-white/10">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selected === mode.id;

          return (
            <motion.button
              key={mode.id}
              onClick={() => onSelect(mode.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
                isSelected
                  ? "text-bg-deep"
                  : "text-gray-400 hover:text-gray-200"
              )}
            >
              {/* Active background */}
              {isSelected && (
                <motion.div
                  layoutId="mode-bg"
                  className="absolute inset-0 bg-[#3e2c70] rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}

              {/* Content */}
              <div className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="font-outfit font-bold text-sm hidden sm:inline">
                  {mode.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Mode description */}
      <motion.p
        key={selected}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-gray-500 text-xs font-mono mt-3"
      >
        {MODES.find((m) => m.id === selected)?.description}
      </motion.p>
    </div>
  );
}
