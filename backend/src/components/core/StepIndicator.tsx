"use client";

import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
}

const steps = [
  { id: 1, label: "Upload Art" },
  { id: 2, label: "Name Token" },
  { id: 3, label: "Choose Style" },
  { id: 4, label: "Generate" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8 pt-4">
      <div className="flex items-center justify-between relative max-w-lg mx-auto">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -z-10" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-accent-plasma -z-10 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted || isCurrent ? "rgb(139, 92, 246)" : "rgb(31, 41, 55)",
                  borderColor: isCompleted || isCurrent ? "rgb(139, 92, 246)" : "rgb(55, 65, 81)",
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 relative z-10",
                  (isCompleted || isCurrent) ? "text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]" : "text-gray-500"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-mono font-bold">{step.id}</span>
                )}
              </motion.div>
              
              <span className={cn(
                "text-[10px] font-mono uppercase tracking-wider absolute -bottom-6 w-20 text-center transition-colors duration-300",
                isCurrent ? "text-accent-plasma font-bold" : isCompleted ? "text-gray-300" : "text-gray-600"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
