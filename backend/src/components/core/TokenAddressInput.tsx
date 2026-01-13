"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenMetadata {
  name: string;
  symbol: string;
  image: string | null;
}

interface TokenAddressInputProps {
  onMetadataFetched: (metadata: TokenMetadata) => void;
  className?: string;
}

export function TokenAddressInput({ onMetadataFetched, className }: TokenAddressInputProps) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFetch = async () => {
    if (!address.trim() || loading) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/token-metadata?address=${encodeURIComponent(address.trim())}`);
      const data = await response.json();

      if (data.success && data.metadata) {
        onMetadataFetched(data.metadata);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Token not found");
      }
    } catch {
      setError("Failed to fetch token data");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFetch();
    }
  };

  const isValidAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address.trim());

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm font-medium text-gray-400 font-mono uppercase tracking-wide mb-2">
        Import from Solana <span className="text-gray-600">(optional)</span>
      </label>

      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError(null);
              setSuccess(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Paste token address..."
            className={cn(
                "w-full pl-10 pr-4 py-3 bg-concrete-900 border rounded-lg focus:outline-none transition-all text-gray-200 placeholder-concrete-600 font-mono text-sm",
              error
                ? "border-red-500/50 focus:border-red-500"
                : success
                ? "border-accent-plasma/50 focus:border-accent-plasma"
                : "border-concrete-700 focus:border-accent-acid focus:shadow-[0_0_15px_rgba(124,58,237,0.15)]"
            )}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-concrete-500" />
        </div>

        <motion.button
          onClick={handleFetch}
          disabled={!isValidAddress || loading}
          whileHover={isValidAddress && !loading ? { scale: 1.02 } : {}}
          whileTap={isValidAddress && !loading ? { scale: 0.98 } : {}}
          className={cn(
            "px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-2",
            isValidAddress && !loading
              ? "btn-glow btn-glow-primary"
              : "btn-glow opacity-50 cursor-not-allowed grayscale"
          )}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            <Check className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? "Fetching..." : success ? "Imported!" : "Import"}
        </motion.button>
      </div>

      {/* Status messages */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-xs mt-2 font-mono flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-accent-plasma text-xs mt-2 font-mono flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            Token data imported! Check the fields below.
          </motion.p>
        )}
      </AnimatePresence>

      <p className="text-gray-500 text-xs mt-2 font-mono">
        Auto-fill token name, ticker & image from on-chain data
      </p>
    </div>
  );
}
