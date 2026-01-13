import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { DEXGEN_CONFIG, getTierFromBalance, getDailyLimit } from '@/lib/token-config';

// Cache token balances for 60 seconds to reduce RPC calls
const balanceCache = new Map<string, { balance: number; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(walletAddress);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = balanceCache.get(walletAddress);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const tier = getTierFromBalance(cached.balance);
      return NextResponse.json({
        success: true,
        balance: cached.balance,
        tier,
        dailyLimit: getDailyLimit(tier),
        cached: true,
      });
    }

    // Connect to Solana
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    // Get $DEXGEN token mint address
    const mintAddress = DEXGEN_CONFIG.mintAddress;

    if (mintAddress === 'YOUR_MINT_ADDRESS_HERE') {
      // Development mode - return mock data
      console.warn('Using mock token balance - set NEXT_PUBLIC_DEXGEN_MINT_ADDRESS for production');

      // For testing, derive a "balance" from the wallet address hash
      const mockBalance = getMockBalance(walletAddress);
      const tier = getTierFromBalance(mockBalance);

      return NextResponse.json({
        success: true,
        balance: mockBalance,
        tier,
        dailyLimit: getDailyLimit(tier),
        mock: true,
      });
    }

    // Query SPL token accounts for this wallet
    let balance = 0;

    try {
      const tokenMint = new PublicKey(mintAddress);

      // Get all token accounts for this wallet with the specified mint
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: tokenMint }
      );

      // Sum up balances from all accounts (usually just one)
      for (const account of tokenAccounts.value) {
        const parsed = account.account.data.parsed;
        if (parsed?.info?.tokenAmount?.uiAmount) {
          balance += parsed.info.tokenAmount.uiAmount;
        }
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
      // Continue with 0 balance rather than failing
    }

    // Cache the result
    balanceCache.set(walletAddress, { balance, timestamp: Date.now() });

    const tier = getTierFromBalance(balance);

    return NextResponse.json({
      success: true,
      balance,
      tier,
      dailyLimit: getDailyLimit(tier),
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify token balance' },
      { status: 500 }
    );
  }
}

// Mock balance for development/testing
function getMockBalance(address: string): number {
  // Use first 8 chars of address to generate a deterministic "balance"
  const hash = address.slice(0, 8).split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  // Map to different tiers for testing
  const mod = hash % 100;
  if (mod < 20) return 0; // 20% no tokens
  if (mod < 40) return 50_000; // 20% below bronze
  if (mod < 55) return 150_000; // 15% bronze
  if (mod < 70) return 600_000; // 15% silver
  if (mod < 85) return 3_000_000; // 15% gold
  return 15_000_000; // 15% whale
}
