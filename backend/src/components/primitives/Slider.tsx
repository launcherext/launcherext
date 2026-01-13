"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  disabled?: boolean;
  className?: string;
}

/**
 * Slider - Range input
 * 
 * Obsidian Minimal design:
 * - Thin track with rounded ends
 * - Accent color for filled portion
 * - Clean value display
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  valueFormatter = (v) => String(v),
  disabled = false,
  className,
}: SliderProps) {
  const id = useId();
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={clsx("w-full", className)}>
      {/* Label and Value */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-3">
          {label && (
            <label
              htmlFor={id}
              className="text-sm font-medium text-gray-300"
            >
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm font-mono text-accent tabular-nums">
              {valueFormatter(value)}
            </span>
          )}
        </div>
      )}

      {/* Slider Track */}
      <div className="relative py-2"> {/* Added padding for touch area */}
        <div className="h-2 sm:h-2.5 bg-gray-800 rounded-full overflow-hidden">
          {/* Filled portion */}
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.1, ease: "easeOut" }}
          />
        </div>

        {/* Native range input (invisible but functional) */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={clsx(
            "absolute inset-0 w-full h-full opacity-0 cursor-pointer",
            disabled && "cursor-not-allowed"
          )}
        />

        {/* Thumb indicator - larger for mobile */}
        <motion.div
          className={clsx(
            "absolute top-1/2 -translate-y-1/2 w-5 h-5 sm:w-4 sm:h-4 bg-white rounded-full shadow-md",
            "border-2 border-accent",
            "pointer-events-none",
            disabled && "opacity-50"
          )}
          initial={false}
          animate={{ left: `calc(${percentage}% - 10px)` }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/**
 * RangeSlider - Slider with min/max handles (future enhancement)
 * For now, export as alias
 */
export { Slider as RangeSlider };
