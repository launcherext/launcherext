"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/primitives/Button";
import { Sparkles, X, Twitter, Rocket } from "lucide-react";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem("dexdrip_welcome_shown");
    if (!hasVisited) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("dexdrip_welcome_shown", "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border-strong rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-accent/10 to-transparent pointer-events-none" />
            
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 relative z-0">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 border border-accent/20">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Welcome to DexDrip
                </h2>
                <p className="text-gray-400">
                  The ultimate toolkit for meme coin creators.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <div className="mt-1 bg-accent/10 p-2 rounded-lg h-fit">
                    <Sparkles className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold text-sm">AI Art Generation</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Generate unique banners & PFPs instantly with custom styles.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <div className="mt-1 bg-purple-500/10 p-2 rounded-lg h-fit">
                    <Twitter className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold text-sm">Tweet Sniper</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Paste a tweet to auto-generate context-aware assets.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                  <div className="mt-1 bg-green-500/10 p-2 rounded-lg h-fit">
                    <Rocket className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold text-sm">Instant Launch</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Deploy your token directly to pump.fun in seconds.</p>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleClose}
                className="font-semibold"
              >
                Start Creating
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
