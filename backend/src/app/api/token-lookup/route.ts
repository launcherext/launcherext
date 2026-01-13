import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

interface TokenMetadata {
  name: string;
  symbol: string;
  image: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
}

interface LookupResponse {
  success: boolean;
  data?: TokenMetadata;
  error?: string;
}

// Fetch token metadata from Solana/DexScreener/Jupiter
async function fetchTokenMetadata(mintAddress: string): Promise<TokenMetadata | null> {
  try {
    // Try DexScreener first (most reliable for meme coins)
    const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (dexResponse.ok) {
      const dexData = await dexResponse.json();
      const pair = dexData.pairs?.[0];
      
      if (pair?.baseToken) {
        return {
          name: pair.baseToken.name || 'Unknown',
          symbol: pair.baseToken.symbol || 'TOKEN',
          image: pair.info?.imageUrl || '',
          website: pair.info?.websites?.[0]?.url,
          twitter: pair.info?.socials?.find((s: { type: string; url: string }) => s.type === 'twitter')?.url,
          telegram: pair.info?.socials?.find((s: { type: string; url: string }) => s.type === 'telegram')?.url,
        };
      }
    }

    // Fallback: Try Jupiter token list
    const jupiterResponse = await fetch(`https://tokens.jup.ag/token/${mintAddress}`);
    
    if (jupiterResponse.ok) {
      const jupData = await jupiterResponse.json();
      return {
        name: jupData.name || 'Unknown',
        symbol: jupData.symbol || 'TOKEN',
        image: jupData.logoURI || '',
      };
    }

    // Fallback: Try Helius DAS API if configured
    const heliusKey = process.env.HELIUS_API_KEY;
    if (heliusKey) {
      const heliusResponse = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'token-lookup',
          method: 'getAsset',
          params: { id: mintAddress },
        }),
      });

      if (heliusResponse.ok) {
        const heliusData = await heliusResponse.json();
        const content = heliusData.result?.content;
        
        if (content) {
          return {
            name: content.metadata?.name || 'Unknown',
            symbol: content.metadata?.symbol || 'TOKEN',
            image: content.files?.[0]?.uri || content.links?.image || '',
            description: content.metadata?.description,
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Token lookup error:', error);
    return null;
  }
}

// Validate Solana address
function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<LookupResponse>> {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({
      success: false,
      error: 'Contract address is required',
    }, { status: 400 });
  }

  if (!isValidSolanaAddress(address)) {
    return NextResponse.json({
      success: false,
      error: 'Invalid Solana address format',
    }, { status: 400 });
  }

  const metadata = await fetchTokenMetadata(address);

  if (!metadata) {
    return NextResponse.json({
      success: false,
      error: 'Token not found. Make sure you entered a valid token mint address.',
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: metadata,
  });
}
