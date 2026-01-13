// $DRIP Token Configuration
// Token-gated access tiers for banner generation

export const DEXGEN_CONFIG = {
  // The $DEXGEN SPL token mint address on Solana
  // Replace with actual mint address before launch
  mintAddress: process.env.NEXT_PUBLIC_DEXGEN_MINT_ADDRESS || 'YOUR_MINT_ADDRESS_HERE',

  // Launch period duration (6 hours in milliseconds)
  launchDuration: 6 * 60 * 60 * 1000,

  // Total supply for reference
  totalSupply: 1_000_000_000, // 1 Billion

  // Tier thresholds and limits
  tiers: {
    bronze: {
      name: 'Bronze',
      min: 100_000,      // 100K tokens (0.01% of supply)
      dailyLimit: 3,
      color: '#CD7F32',
      emoji: '🥉',
    },
    silver: {
      name: 'Silver',
      min: 500_000,      // 500K tokens (0.05% of supply)
      dailyLimit: 10,
      color: '#C0C0C0',
      emoji: '🥈',
    },
    gold: {
      name: 'Gold',
      min: 2_000_000,    // 2M tokens (0.2% of supply)
      dailyLimit: 25,
      color: '#FFD700',
      emoji: '🥇',
    },
    whale: {
      name: 'Whale',
      min: 10_000_000,   // 10M tokens (1% of supply)
      dailyLimit: Infinity,
      color: '#29D9FF',
      emoji: '🐋',
    },
  },
} as const;

export type TierName = 'none' | 'bronze' | 'silver' | 'gold' | 'whale';

export interface TierInfo {
  name: string;
  min: number;
  dailyLimit: number;
  color: string;
  emoji: string;
}

/**
 * Determine user's tier based on token balance
 */
export function getTierFromBalance(balance: number): TierName {
  const { tiers } = DEXGEN_CONFIG;

  if (balance >= tiers.whale.min) return 'whale';
  if (balance >= tiers.gold.min) return 'gold';
  if (balance >= tiers.silver.min) return 'silver';
  if (balance >= tiers.bronze.min) return 'bronze';
  return 'none';
}

/**
 * Get tier info by name
 */
export function getTierInfo(tier: TierName): TierInfo | null {
  if (tier === 'none') return null;
  return DEXGEN_CONFIG.tiers[tier];
}

/**
 * Get daily limit for a tier
 */
export function getDailyLimit(tier: TierName): number {
  if (tier === 'none') return 0;
  return DEXGEN_CONFIG.tiers[tier].dailyLimit;
}

/**
 * Format token amount for display (e.g., 100000 -> "100K")
 */
export function formatTokenAmount(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K`;
  }
  return amount.toString();
}

/**
 * Feature access thresholds
 * Token amounts required to unlock premium features
 */
export const FEATURE_THRESHOLDS = {
  tweetSniper: 1_000_000, // 1M $DRIP for Tweet Sniper access
} as const;

/**
 * Check if user can access Tweet Sniper feature
 */
export function canAccessTweetSniper(balance: number): boolean {
  return balance >= FEATURE_THRESHOLDS.tweetSniper;
}

/**
 * Get the amount of tokens needed to unlock a feature
 */
export function getTokensNeeded(balance: number, threshold: number): number {
  return Math.max(0, threshold - balance);
}

