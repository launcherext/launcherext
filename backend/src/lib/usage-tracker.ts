// Server-side usage tracking for token-gated access
// This tracks daily banner generations per wallet address

import { getTierFromBalance, getDailyLimit, TierName } from './token-config';

interface UsageEntry {
  count: number;
  date: string; // ISO date string (YYYY-MM-DD)
}

// In-memory store - use Redis for production
const usageStore = new Map<string, UsageEntry>();

/**
 * Get today's date as ISO string
 */
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current usage for a wallet address
 */
export function getUsage(walletAddress: string): number {
  const entry = usageStore.get(walletAddress);
  const today = getToday();

  // Reset if from a different day
  if (!entry || entry.date !== today) {
    return 0;
  }

  return entry.count;
}

/**
 * Increment usage for a wallet address
 */
export function incrementUsage(walletAddress: string): number {
  const today = getToday();
  const current = usageStore.get(walletAddress);

  // Reset if from a different day
  if (!current || current.date !== today) {
    usageStore.set(walletAddress, { count: 1, date: today });
    return 1;
  }

  current.count += 1;
  usageStore.set(walletAddress, current);
  return current.count;
}

/**
 * Check if a wallet can generate more banners today
 */
export function canGenerate(walletAddress: string, tokenBalance: number): boolean {
  const tier = getTierFromBalance(tokenBalance);
  if (tier === 'none') return false;

  const limit = getDailyLimit(tier);
  if (limit === Infinity) return true;

  const usage = getUsage(walletAddress);
  return usage < limit;
}

/**
 * Get remaining generations for a wallet
 */
export function getRemainingGenerations(walletAddress: string, tokenBalance: number): number {
  const tier = getTierFromBalance(tokenBalance);
  if (tier === 'none') return 0;

  const limit = getDailyLimit(tier);
  if (limit === Infinity) return Infinity;

  const usage = getUsage(walletAddress);
  return Math.max(0, limit - usage);
}

/**
 * Check if a wallet has exceeded their tier limit
 */
export function hasExceededLimit(walletAddress: string, tokenBalance: number): boolean {
  return !canGenerate(walletAddress, tokenBalance);
}

/**
 * Get usage stats for a wallet
 */
export function getUsageStats(walletAddress: string, tokenBalance: number): {
  tier: TierName;
  dailyLimit: number;
  used: number;
  remaining: number;
  canGenerate: boolean;
} {
  const tier = getTierFromBalance(tokenBalance);
  const dailyLimit = getDailyLimit(tier);
  const used = getUsage(walletAddress);
  const remaining = dailyLimit === Infinity ? Infinity : Math.max(0, dailyLimit - used);

  return {
    tier,
    dailyLimit,
    used,
    remaining,
    canGenerate: tier !== 'none' && (dailyLimit === Infinity || used < dailyLimit),
  };
}

/**
 * Clear all usage data (for testing)
 */
export function clearAllUsage(): void {
  usageStore.clear();
}

/**
 * Get total number of tracked wallets (for monitoring)
 */
export function getTrackedWalletCount(): number {
  return usageStore.size;
}
