"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ExternalLink, Check } from 'lucide-react';
import { DEXGEN_CONFIG, formatTokenAmount } from '@/lib/token-config';

interface TokenInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TokenInfoModal({ isOpen, onClose }: TokenInfoModalProps) {
  const tiers = DEXGEN_CONFIG.tiers;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-[70] max-h-[80vh] overflow-y-auto"
          >
            <div className="bg-black/90 border border-concrete-700/50 rounded-2xl shadow-[0_0_50px_rgba(124,58,237,0.2)] overflow-hidden backdrop-blur-xl">
              {/* Header */}
              <div className="relative p-6 border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-violet/10 to-accent-plasma/10 opacity-50" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-syne text-white tracking-wide">
                      How DexGen Works
                    </h2>
                    <p className="text-concrete-400 text-sm mt-1 font-mono">
                      Token-gated access powered by <span className="text-accent-magenta font-bold">$DRIP</span>
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                  >
                    <X className="w-5 h-5 text-concrete-400 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Launch Period Notice */}
                <div className="bg-accent-plasma/5 border border-accent-plasma/20 rounded-xl p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-plasma/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-accent-plasma/20 flex items-center justify-center flex-shrink-0 border border-accent-plasma/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                      <Check className="w-5 h-5 text-accent-plasma" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold font-syne text-lg">Launch Special</h3>
                      <p className="text-concrete-300 text-sm mt-1 leading-relaxed">
                        For the first <strong className="text-white">6 hours</strong> after launch, <strong className="text-accent-plasma">everyone</strong> gets
                        unlimited free access - no wallet required!
                      </p>
                    </div>
                  </div>
                </div>

                {/* After Launch */}
                <div className="space-y-4">
                  <div>
                     <h3 className="text-white font-bold font-syne text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-1 h-4 bg-accent-cyan rounded-full" />
                        After Launch
                     </h3>
                     <p className="text-concrete-400 text-sm leading-relaxed">
                        To continue using DexDrip, hold <strong className="text-accent-magenta">$DRIP</strong> tokens.
                        More tokens = higher daily limits.
                     </p>
                  </div>

                  {/* Tier Table */}
                  <div className="grid gap-2">
                    {Object.values(tiers).map((tier) => (
                      <div 
                        key={tier.name}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          tier.name === 'Whale' 
                            ? 'bg-accent-plasma/10 border-accent-plasma/40 shadow-[0_0_10px_rgba(139,92,246,0.1)]' 
                            : 'bg-white/5 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl filter drop-shadow-md">{tier.emoji}</span>
                          <div>
                            <span className={`font-bold text-sm ${tier.name === 'Whale' ? 'text-accent-plasma' : 'text-white'}`}>
                              {tier.name}
                            </span>
                            <p className="text-concrete-500 text-[10px] uppercase font-mono tracking-wider">
                              {formatTokenAmount(tier.min)}+ $DRIP
                            </p>
                          </div>
                        </div>
                        <span className={`font-mono text-sm ${tier.name === 'Whale' ? 'text-accent-plasma font-bold' : 'text-concrete-300'}`}>
                           {tier.name === 'Whale' ? 'Unlimited' : `${tier.dailyLimit}/day`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-center text-concrete-500 text-xs font-mono opacity-70">
                  Token required after free launch period ends
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
