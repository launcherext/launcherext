"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
  value: number;
  onChange: (count: number) => void;
  className?: string;
}

const VARIANT_OPTIONS = [
  { count: 1, label: "1", description: "Single" },
  { count: 2, label: "2", description: "Pair" },
  { count: 3, label: "3", description: "Trio" },
  { count: 4, label: "4", description: "Quad" },
  { count: 5, label: "5", description: "Max" },
];

export function VariantSelector({ value, onChange, className }: VariantSelectorProps) {
  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm font-medium text-gray-400 font-mono uppercase tracking-wide mb-3">
        Variants to Generate
      </label>

      <div className="flex gap-2">
        {VARIANT_OPTIONS.map((option) => (
          <motion.button
            key={option.count}
            onClick={() => onChange(option.count)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex-1 py-3 rounded-lg border transition-all text-center",
              value === option.count
                ? "bg-accent-plasma/20 border-accent-plasma text-accent-plasma shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                : "bg-gray-900 border-white/10 text-gray-400 hover:border-gray-500 hover:text-gray-200"
            )}
          >
            <div className="font-outfit font-bold text-lg">{option.label}</div>
            <div className="text-[10px] font-mono opacity-60">{option.description}</div>
          </motion.button>
        ))}
      </div>

      <p className="text-gray-600 text-xs mt-2 font-mono text-center">
        {value === 1
          ? "Generate 1 banner"
          : `Generate ${value} different variations to choose from`}
      </p>
    </div>
  );
}
