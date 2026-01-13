/**
 * Launch Tracking API for Launch Ext
 * Stores and retrieves token launch data
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Rate limiting map (in-memory, for simplicity)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(walletAddress: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(walletAddress);

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit
    rateLimits.set(walletAddress, {
      count: 1,
      resetAt: now + 60 * 1000, // 1 minute
    });
    return true;
  }

  if (limit.count >= 30) {
    // Max 30 requests per minute
    return false;
  }

  limit.count++;
  return true;
}

// GET: Retrieve launches for a wallet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(walletAddress)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Fetch launches from database
    const launches = await prisma.launch.findMany({
      where: { walletAddress },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 launches
    });

    return NextResponse.json({ success: true, launches });
  } catch (error) {
    console.error('Failed to fetch launches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch launches' },
      { status: 500 }
    );
  }
}

// POST: Save a new launch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signature, mint, name, symbol, walletAddress, devBuyAmount, imageUrl } = body;

    if (!signature || !mint || !name || !symbol || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(walletAddress)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Check if launch already exists
    const existing = await prisma.launch.findUnique({
      where: { signature },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        launch: existing,
        message: 'Launch already exists',
      });
    }

    // Create new launch
    const launch = await prisma.launch.create({
      data: {
        signature,
        mint,
        name,
        symbol,
        walletAddress,
      },
    });

    return NextResponse.json({ success: true, launch });
  } catch (error) {
    console.error('Failed to save launch:', error);
    return NextResponse.json(
      { error: 'Failed to save launch' },
      { status: 500 }
    );
  }
}
