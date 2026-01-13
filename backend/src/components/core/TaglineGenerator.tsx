"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaglineGeneratorProps {
  tokenName: string;
  ticker?: string;
  style?: string;
  value: string;
  onChange: (tagline: string) => void;
  className?: string;
}

export function TaglineGenerator({
  tokenName,
  ticker,
  style,
  value,
  onChange,
  className,
}: TaglineGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGenerate = async () => {
    if (!tokenName.trim() || loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/generate-tagline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenName, ticker, style }),
      });

      const data = await response.json();

      if (data.success && data.taglines?.length > 0) {
        setSuggestions(data.taglines);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Tagline generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectTagline = (tagline: string) => {
    onChange(tagline);
    setShowSuggestions(false);
  };

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm font-medium text-gray-400 font-mono uppercase tracking-wide mb-2">
        Tagline / Meme Quote <span className="text-gray-600">(optional)</span>
      </label>

      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. To the moon!"
            className="flex-1 px-4 py-3 bg-concrete-900 border border-concrete-700 rounded-lg focus:outline-none focus:border-accent-acid focus:shadow-[0_0_15px_rgba(124,58,237,0.15)] transition-all text-concrete-100 placeholder-concrete-500"
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
             <motion.button
              onClick={handleGenerate}
              disabled={!tokenName.trim() || loading}
              whileHover={tokenName.trim() && !loading ? { scale: 1.1 } : {}}
              whileTap={tokenName.trim() && !loading ? { scale: 0.9 } : {}}
              className={cn(
                "p-2 rounded-lg transition-all flex items-center justify-center",
                tokenName.trim() && !loading
                  ? "text-accent-plasma hover:bg-accent-plasma/10 hover:shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                  : "text-gray-600 cursor-not-allowed opacity-50"
              )}
              title={!tokenName.trim() ? "Enter token name first" : "Generate AI tagline"}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/10 rounded-lg overflow-hidden shadow-xl"
            >
              <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-white/5">
                <span className="text-xs font-mono text-gray-400">AI Suggestions</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="text-gray-400 hover:text-accent-plasma transition-colors"
                  >
                    <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                  </button>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto">
                {suggestions.map((tagline, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => selectTagline(tagline)}
                    className="w-full px-4 py-3 text-left text-gray-200 hover:bg-accent-plasma/10 hover:text-accent-plasma transition-colors border-b border-gray-800 last:border-0"
                  >
                    "{tagline}"
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!tokenName.trim() && (
        <p className="text-gray-600 text-xs mt-1 font-mono text-left pl-1">
          Enter token name first to generate AI taglines
        </p>
      )}
    </div>
  );
}
