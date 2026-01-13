"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { getTierFromBalance, getDailyLimit, TierName } from '@/lib/token-config';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface DexgenWalletState {
  connected: boolean;
  address: string | null;
  dexgenBalance: number;
  tier: TierName;
  dailyUsage: number;
  dailyLimit: number;
  isLoading: boolean;
  error: string | null;
}

interface DexgenWalletContextType extends DexgenWalletState {
  refreshBalance: () => Promise<void>;
  incrementUsage: () => void;
  canGenerate: boolean;
  remainingGenerations: number;
}

const DexgenWalletContext = createContext<DexgenWalletContextType | undefined>(undefined);

const USAGE_STORAGE_KEY = 'dexgen_daily_usage';

function getStoredUsage(address: string): { count: number; date: string } {
  try {
    const stored = localStorage.getItem(`${USAGE_STORAGE_KEY}_${address}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return { count: 0, date: new Date().toISOString().split('T')[0] };
}

function setStoredUsage(address: string, count: number) {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(`${USAGE_STORAGE_KEY}_${address}`, JSON.stringify({ count, date: today }));
}

function DexgenWalletContextProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const [state, setState] = useState<DexgenWalletState>({
    connected: false,
    address: null,
    dexgenBalance: 0,
    tier: 'none',
    dailyUsage: 0,
    dailyLimit: 0,
    isLoading: false,
    error: null,
  });

  // Fetch $DEXGEN balance
  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const address = publicKey.toBase58();

      // Call our API to verify token balance
      const response = await fetch('/api/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to verify token balance');
      }

      const tier = getTierFromBalance(data.balance);
      const dailyLimit = getDailyLimit(tier);

      // Get today's usage from localStorage
      const usage = getStoredUsage(address);
      const today = new Date().toISOString().split('T')[0];
      const dailyUsage = usage.date === today ? usage.count : 0;

      setState({
        connected: true,
        address,
        dexgenBalance: data.balance,
        tier,
        dailyUsage,
        dailyLimit,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balance',
      }));
    }
  }, [publicKey]);

  // Update state when wallet connects/disconnects
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
    } else {
      setState({
        connected: false,
        address: null,
        dexgenBalance: 0,
        tier: 'none',
        dailyUsage: 0,
        dailyLimit: 0,
        isLoading: false,
        error: null,
      });
    }
  }, [connected, publicKey, refreshBalance]);

  // Increment usage count
  const incrementUsage = useCallback(() => {
    if (!state.address) return;

    const newUsage = state.dailyUsage + 1;
    setStoredUsage(state.address, newUsage);
    setState(prev => ({ ...prev, dailyUsage: newUsage }));
  }, [state.address, state.dailyUsage]);

  // Calculate derived values
  const canGenerate = state.dailyLimit === Infinity || state.dailyUsage < state.dailyLimit;
  const remainingGenerations = state.dailyLimit === Infinity ? Infinity : Math.max(0, state.dailyLimit - state.dailyUsage);

  return (
    <DexgenWalletContext.Provider
      value={{
        ...state,
        refreshBalance,
        incrementUsage,
        canGenerate,
        remainingGenerations,
      }}
    >
      {children}
    </DexgenWalletContext.Provider>
  );
}

export function WalletContextProvider({ children }: { children: ReactNode }) {
  // Solana network - use mainnet for production
  const endpoint = useMemo(() =>
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'),
    []
  );

  // Supported wallets
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <DexgenWalletContextProvider>
            {children}
          </DexgenWalletContextProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

export function useDexgenWallet(): DexgenWalletContextType {
  const context = useContext(DexgenWalletContext);
  if (context === undefined) {
    throw new Error('useDexgenWallet must be used within a WalletContextProvider');
  }
  return context;
}

// Re-export the useWallet hook for connecting/disconnecting
export { useWallet } from '@solana/wallet-adapter-react';
