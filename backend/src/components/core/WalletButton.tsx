"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { useDexgenWallet } from '@/contexts/WalletContext';
import { TierBadge } from './TierBadge';

export function WalletButton() {
  const { connected, connecting, disconnect, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { tier, dailyUsage, dailyLimit, isLoading, remainingGenerations } = useDexgenWallet();

  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  // Truncate wallet address
  const truncatedAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null;

  if (connecting || isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 px-4 py-2 bg-concrete-900/80 backdrop-blur-sm border border-concrete-700 rounded-lg"
      >
        <Loader2 className="w-4 h-4 text-accent-plasma animate-spin" />
        <span className="text-concrete-300 text-sm font-mono">Connecting...</span>
      </motion.div>
    );
  }

  if (connected && publicKey) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        {/* Wallet Info Card */}
        <div className="flex items-center gap-3 px-4 py-2 bg-concrete-900/80 backdrop-blur-sm border border-concrete-700 hover:border-accent-primary/50 transition-colors rounded-lg">
          {/* Tier Badge */}
          <TierBadge tier={tier} />

          {/* Address */}
          <span className="text-concrete-300 text-sm font-mono">{truncatedAddress}</span>

          {/* Daily Usage */}
          {tier !== 'none' && dailyLimit !== Infinity && (
            <div className="text-xs font-mono px-2 py-0.5 bg-concrete-800 rounded text-concrete-400">
              <span className="opacity-50 mr-1">Uses:</span>{remainingGenerations}/{dailyLimit}
            </div>
          )}

          {/* Disconnect Button */}
          <button
            onClick={handleClick}
            className="p-1.5 hover:bg-concrete-800 rounded-lg transition-colors"
            title="Disconnect Wallet"
          >
            <LogOut className="w-4 h-4 text-concrete-400 hover:text-red-400" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm btn-glow btn-glow-primary"
    >
      <Wallet className="w-4 h-4" />
      <span>Connect Wallet</span>
    </motion.button>
  );
}
