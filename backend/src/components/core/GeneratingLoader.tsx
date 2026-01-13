"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const LOADING_MESSAGES = [
  "Summoning the AI...",
  "Brewing degen energy...",
  "Consulting the meme lords...",
  "Generating pure chaos...",
  "Adding extra pump...",
  "Maximizing gains...",
  "Channeling diamond hands...",
  "Injecting hopium...",
];

type OutputType = "banner" | "pfp";

interface GeneratingLoaderProps {
  outputType?: OutputType;
}

export function GeneratingLoader({ outputType = "banner" }: GeneratingLoaderProps) {
  const randomMessage = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
  const isPfp = outputType === "pfp";
  const dimensions = isPfp ? "1000 x 1000" : "1500 x 500";
  const aspectClass = isPfp ? "aspect-square max-w-md" : "aspect-[3/1] max-w-2xl";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full py-16 flex flex-col items-center justify-center"
    >
      {/* Animated banner placeholder */}
      <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden border border-white/10 bg-gray-900 mb-8`}>
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-accent-plasma/10 via-accent-violet/10 to-accent-plasma/10"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            ease: "linear",
            repeat: Infinity,
          }}
          style={{ backgroundSize: "200% 100%" }}
        />

        {/* Scanning line */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-plasma to-transparent"
          animate={{
            y: [0, 166, 0], // Move down and back up (aspect ratio 3:1 means height is ~1/3 width)
          }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity,
          }}
        />

        {/* Corner decorations */}
        <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-accent-plasma/30 rounded-tl" />
        <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-accent-plasma/30 rounded-tr" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-accent-plasma/30 rounded-bl" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-accent-plasma/30 rounded-br" />

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
          >
            <Sparkles className="w-12 h-12 text-accent-plasma" />
          </motion.div>
        </div>

        {/* Dimensions badge */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded text-gray-500 text-xs font-mono">
          {dimensions}
        </div>
      </div>

      {/* Loading text */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.p
          className="text-accent-plasma font-outfit font-bold text-xl mb-2"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {randomMessage}
        </motion.p>
        <p className="text-gray-500 font-mono text-sm">
          This usually takes 10-30 seconds
        </p>
      </motion.div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-accent-plasma"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
