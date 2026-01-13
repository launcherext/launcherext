/**
 * Token Stats API for Launch Ext
 * Fetches token price, market cap, and other metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

// Rate limiting
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimits.set(ip, {
      count: 1,
      resetAt: now + 60 * 1000,
    });
    return true;
  }

  if (limit.count >= 60) {
    // Max 60 requests per minute per IP
    return false;
  }

  limit.count++;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mint = searchParams.get('mint');

    if (!mint) {
      return NextResponse.json(
        { error: 'Mint address is required' },
        { status: 400 }
      );
    }

    // Check rate limit
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Validate mint address
    let mintPubkey: PublicKey;
    try {
      mintPubkey = new PublicKey(mint);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid mint address' },
        { status: 400 }
      );
    }

    // Fetch token stats
    // This is a simplified version - in production, you'd fetch from pump.fun API or parse on-chain data
    const stats = {
      mint,
      name: '', // Would fetch from metadata
      symbol: '', // Would fetch from metadata
      price: Math.random() * 0.001, // Placeholder
      marketCap: Math.random() * 100000, // Placeholder
      holders: Math.floor(Math.random() * 1000), // Placeholder
      volume24h: Math.random() * 50000, // Placeholder
      percentChange24h: (Math.random() - 0.5) * 200, // Placeholder
      isLive: Math.random() > 0.5,
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Failed to fetch token stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token stats' },
      { status: 500 }
    );
  }
}
