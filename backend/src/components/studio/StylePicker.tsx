"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

export type StyleOption = {
  id: string;
  label: string;
  description: string;
  gradient?: string; // Optional gradient for visual preview
};

interface StylePickerProps {
  options: StyleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * StylePicker - Horizontal pill selector for styles
 * 
 * Obsidian Minimal design:
 * - Horizontal scrolling pills
 * - Accent color for selected
 * - Clean, minimal labels
 */
export function StylePicker({
  options,
  value,
  onChange,
  className,
}: StylePickerProps) {
  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const isSelected = value === option.id;
        
        return (
          <motion.button
            key={option.id}
            onClick={() => onChange(option.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={clsx(
              "px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 min-h-[44px] flex items-center",
              isSelected
                ? "bg-accent text-black shadow-[0_0_20px_rgba(0,212,255,0.3)]"
                : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-gray-300"
            )}
          >
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * StylePickerGrid - Grid version for more visual selection
 */
interface StylePickerGridProps {
  options: StyleOption[];
  value: string;
  onChange: (value: string) => void;
  columns?: 2 | 3;
  className?: string;
}

export function StylePickerGrid({
  options,
  value,
  onChange,
  columns = 3,
  className,
}: StylePickerGridProps) {
  return (
    <div
      className={clsx(
        "grid gap-2 sm:gap-3",
        columns === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.id;

        return (
          <motion.button
            key={option.id}
            onClick={() => onChange(option.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={clsx(
              "relative p-3 sm:p-4 rounded-lg border text-left transition-all duration-150 overflow-hidden min-h-[64px]",
              isSelected
                ? "border-accent bg-accent/10"
                : "border-gray-800 bg-gray-900 hover:border-gray-700"
            )}
          >
            {/* Optional gradient preview */}
            {option.gradient && (
              <div
                className="absolute inset-0 opacity-30"
                style={{ background: option.gradient }}
              />
            )}

            <div className="relative z-10">
              <div
                className={clsx(
                  "text-xs sm:text-sm font-medium",
                  isSelected ? "text-foreground" : "text-gray-400"
                )}
              >
                {option.label}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
                {option.description}
              </div>
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <motion.div
                layoutId="style-indicator"
                className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
