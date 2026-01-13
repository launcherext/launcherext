"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Info, X, Sparkles } from 'lucide-react';
import { useLaunch, formatTimeRemaining } from '@/contexts/LaunchContext';
import { TokenInfoModal } from './TokenInfoModal';

export function CountdownBanner() {
  const { isFreePeriod, timeRemaining, isLoading } = useLaunch();
  const [showModal, setShowModal] = useState(false);

  // Don't render if free period is over or still loading
  if (isLoading || !isFreePeriod) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="relative z-30 pointer-events-auto"
      >
        {/* Main Banner - Solid Pill Feature */}
        <div className="bg-accent-primary rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)] group border border-white/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          
          {/* Content */}
          <div className="relative px-3 py-2 flex items-center justify-center gap-3">
            {/* Sparkle icon */}
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />

            {/* Timer only on mobile, Text on desktop */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-2 py-0.5 bg-black/20 rounded-full">
                <span className="text-white font-bold text-xs tracking-wide hidden sm:inline whitespace-nowrap animate-pulse">
                  FREE ACCESS
                </span>
              </div>
               {/* Separator */}
              <div className="w-px h-3 bg-white/20 hidden sm:block" />
              
              <Clock className="w-3.5 h-3.5 text-white/90" />
              <span className="text-white font-mono font-bold text-xs tracking-wider tabular-nums">
                {formatTimeRemaining(timeRemaining)}
              </span>
            </div>

            {/* Info Icon Button */}
            <motion.button
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center w-5 h-5 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors"
            >
              <Info className="w-3 h-3 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Info Modal */}
      <TokenInfoModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
