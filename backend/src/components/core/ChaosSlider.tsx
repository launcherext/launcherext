"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChaosSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function ChaosSlider({ value, onChange, className }: ChaosSliderProps) {
  const getChaosLabel = (val: number) => {
    if (val < 20) return "Clean";
    if (val < 40) return "Mild";
    if (val < 60) return "Spicy";
    if (val < 80) return "Unhinged";
    return "Maximum Degen";
  };

  const getChaosColor = (val: number) => {
    if (val < 20) return "text-gray-400";
    if (val < 40) return "text-accent-violet";
    if (val < 60) return "text-yellow-400";
    if (val < 80) return "text-orange-400";
    return "text-accent-plasma";
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-medium text-gray-400 font-mono uppercase tracking-wide">
          Chaos Level
        </label>
        <motion.span
          key={value}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn("text-sm font-mono font-bold", getChaosColor(value))}
        >
          {value}% — {getChaosLabel(value)}
        </motion.span>
      </div>

      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-3 appearance-none cursor-pointer rounded-full bg-gray-800
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(139,92,246,0.5)]
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-accent-plasma
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-6
            [&::-moz-range-thumb]:h-6
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-accent-plasma
            [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right,
              var(--accent-violet) 0%,
              var(--accent-plasma) ${value}%,
              var(--gray-800) ${value}%)`
          }}
        />

        {/* Tick marks */}
        <div className="flex justify-between mt-2 px-1">
          {[0, 25, 50, 75, 100].map((tick) => (
            <div
              key={tick}
              className={cn(
                "w-1 h-1 rounded-full transition-colors",
                value >= tick ? "bg-accent-plasma" : "bg-gray-700"
              )}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
        <span>ORDER</span>
        <span>CHAOS</span>
      </div>
    </div>
  );
}
