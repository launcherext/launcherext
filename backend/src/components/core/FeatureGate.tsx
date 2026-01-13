"use client";

import { motion } from "framer-motion";
import { Lock, Wallet, ExternalLink, Coins } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useDexgenWallet } from "@/contexts/WalletContext";
import { formatTokenAmount } from "@/lib/token-config";
import { Button } from "@/components/primitives/Button";

interface FeatureGateProps {
  featureName: string;
  requiredBalance: number;
  description?: string;
  buyLink?: string;
  children: React.ReactNode;
}

/**
 * Token-gated feature wrapper
 * Shows appropriate prompts for wallet connection and token requirements
 */
export function FeatureGate({
  featureName,
  requiredBalance,
  description,
  buyLink = "https://jup.ag/swap/SOL-DRIP",
  children,
}: FeatureGateProps) {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { dexgenBalance, isLoading } = useDexgenWallet();

  const hasAccess = connected && dexgenBalance >= requiredBalance;
  const tokensNeeded = Math.max(0, requiredBalance - dexgenBalance);

  // Loading state
  if (connected && isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // User has access - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Gated state - show appropriate prompt
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6">
        {/* Lock Icon */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
          <Lock className="w-7 h-7 text-yellow-500" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-center text-foreground mb-2">
          Premium Feature
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-400 text-center mb-4 max-w-sm mx-auto">
          {description || `${featureName} requires holding $DRIP tokens to access.`}
        </p>

        {/* Requirement Box */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Required</span>
            <span className="text-sm font-mono font-medium text-accent">
              {formatTokenAmount(requiredBalance)} $DRIP
            </span>
          </div>

          {connected && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Your Balance</span>
                <span className="text-sm font-mono text-foreground">
                  {formatTokenAmount(dexgenBalance)} $DRIP
                </span>
              </div>

              {tokensNeeded > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                  <span className="text-sm text-gray-400">Need</span>
                  <span className="text-sm font-mono text-yellow-500">
                    +{formatTokenAmount(tokensNeeded)} more
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Button */}
        {!connected ? (
          <Button
            variant="primary"
            fullWidth
            icon={<Wallet className="w-4 h-4" />}
            onClick={() => setVisible(true)}
          >
            Connect Wallet
          </Button>
        ) : (
          <a
            href={buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-accent text-black font-medium text-sm hover:bg-accent/90 transition-colors"
          >
            <Coins className="w-4 h-4" />
            Buy $DRIP on Jupiter
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </motion.div>
  );
}
