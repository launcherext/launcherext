/**
 * Rate Limiting Middleware API
 * Check rate limits for various actions
 */

import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limit store
interface ActionLimit {
  count: number;
  resetAt: number;
}

interface UserLimits {
  generateBanner: ActionLimit;
  createToken: ActionLimit;
}

const rateLimits = new Map<string, UserLimits>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  generateBanner: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 10 per hour
  },
  createToken: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 5 per hour
  },
};

function checkLimit(
  walletAddress: string,
  action: keyof UserLimits
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const config = RATE_LIMITS[action];

  let userLimits = rateLimits.get(walletAddress);

  if (!userLimits) {
    userLimits = {
      generateBanner: { count: 0, resetAt: now + config.windowMs },
      createToken: { count: 0, resetAt: now + config.windowMs },
    };
    rateLimits.set(walletAddress, userLimits);
  }

  const actionLimit = userLimits[action];

  // Reset if window expired
  if (now > actionLimit.resetAt) {
    actionLimit.count = 0;
    actionLimit.resetAt = now + config.windowMs;
  }

  const remaining = Math.max(0, config.maxRequests - actionLimit.count);
  const allowed = actionLimit.count < config.maxRequests;

  if (allowed) {
    actionLimit.count++;
  }

  return {
    allowed,
    remaining: allowed ? remaining - 1 : remaining,
    resetAt: actionLimit.resetAt,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, action } = body;

    if (!walletAddress || !action) {
      return NextResponse.json(
        { error: 'Wallet address and action are required' },
        { status: 400 }
      );
    }

    if (!(action in RATE_LIMITS)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const result = checkLimit(walletAddress, action);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          remaining: result.remaining,
          resetAt: result.resetAt,
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      remaining: result.remaining,
      resetAt: result.resetAt,
    });
  } catch (error) {
    console.error('Rate limit check error:', error);
    return NextResponse.json(
      { error: 'Failed to check rate limit' },
      { status: 500 }
    );
  }
}
