"use client";

import { TierName, getTierInfo } from '@/lib/token-config';

interface TierBadgeProps {
  tier: TierName;
  showEmoji?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TierBadge({ tier, showEmoji = true, size = 'sm' }: TierBadgeProps) {
  if (tier === 'none') {
    return (
      <span className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full
        bg-concrete-800 text-concrete-500 font-mono
        ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}
      `}>
        No Tier
      </span>
    );
  }

  const tierInfo = getTierInfo(tier);
  if (!tierInfo) return null;

  const colorStyles: Record<string, string> = {
    bronze: 'bg-amber-900/30 text-amber-400 border-amber-700/50',
    silver: 'bg-gray-700/30 text-gray-300 border-gray-600/50',
    gold: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50',
    whale: 'bg-cyan-900/30 text-accent-plasma border-accent-plasma/50',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full font-medium border
      ${colorStyles[tier]}
      ${sizeStyles[size]}
    `}>
      {showEmoji && <span>{tierInfo.emoji}</span>}
      <span>{tierInfo.name}</span>
    </span>
  );
}
