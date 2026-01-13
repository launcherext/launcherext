"use client";

import { motion } from "framer-motion";
import { Sparkles, ImageIcon } from "lucide-react";

export function PreviewSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full aspect-[3/1] bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-800 flex items-center justify-center relative overflow-hidden group"
    >
      <div className="text-center z-10 space-y-3">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto group-hover:bg-gray-700 transition-colors">
          <Sparkles className="w-6 h-6 text-gray-600 group-hover:text-accent-plasma transition-colors" />
        </div>
        <div>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest font-bold">
            Preview Pending
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Fill out the form to generate
          </p>
        </div>
      </div>
      
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle, #444 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />
    </motion.div>
  );
}
