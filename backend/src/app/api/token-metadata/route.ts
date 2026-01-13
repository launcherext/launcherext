import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";

interface TokenMetadata {
  name: string;
  symbol: string;
  image: string | null;
  description?: string;
}

interface JupiterToken {
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
}

// Fetch token metadata from Solana
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`metadata:${clientIP}`, RATE_LIMITS.metadata);

  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, error: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.resetIn) } }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { success: false, error: "Token address is required" },
      { status: 400 }
    );
  }

  // Validate Solana address format (base58, 32-44 chars)
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return NextResponse.json(
      { success: false, error: "Invalid Solana address format" },
      { status: 400 }
    );
  }

  try {
    // Try multiple sources for token metadata

    // 1. Try Jupiter Token List (most popular tokens)
    const jupiterResult = await fetchFromJupiter(address);
    if (jupiterResult) {
      return NextResponse.json({ success: true, metadata: jupiterResult });
    }

    // 2. Try DexScreener API
    const dexResult = await fetchFromDexScreener(address);
    if (dexResult) {
      return NextResponse.json({ success: true, metadata: dexResult });
    }

    // 3. Try Helius DAS API (if we have key)
    const heliusKey = process.env.HELIUS_API_KEY;
    if (heliusKey) {
      const heliusResult = await fetchFromHelius(address, heliusKey);
      if (heliusResult) {
        return NextResponse.json({ success: true, metadata: heliusResult });
      }
    }

    return NextResponse.json(
      { success: false, error: "Token not found. Try entering details manually." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Token metadata fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch token metadata" },
      { status: 500 }
    );
  }
}

// Fetch from Jupiter token list
async function fetchFromJupiter(address: string): Promise<TokenMetadata | null> {
  try {
    // Jupiter strict token list
    const response = await fetch(
      "https://token.jup.ag/strict",
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) return null;

    const tokens: JupiterToken[] = await response.json();
    const token = tokens.find(
      (t) => t.address.toLowerCase() === address.toLowerCase()
    );

    if (token) {
      return {
        name: token.name,
        symbol: token.symbol,
        image: token.logoURI || null,
      };
    }

    // Also try the "all" list for newer tokens
    const allResponse = await fetch(
      "https://token.jup.ag/all",
      { next: { revalidate: 3600 } }
    );

    if (allResponse.ok) {
      const allTokens: JupiterToken[] = await allResponse.json();
      const allToken = allTokens.find(
        (t) => t.address.toLowerCase() === address.toLowerCase()
      );

      if (allToken) {
        return {
          name: allToken.name,
          symbol: allToken.symbol,
          image: allToken.logoURI || null,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

// Fetch from DexScreener
async function fetchFromDexScreener(address: string): Promise<TokenMetadata | null> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      { next: { revalidate: 300 } } // Cache for 5 min
    );

    if (!response.ok) return null;

    const data = await response.json();
    const pair = data.pairs?.[0];

    if (pair) {
      // Find the token that matches our address
      const isBaseToken = pair.baseToken?.address?.toLowerCase() === address.toLowerCase();
      const token = isBaseToken ? pair.baseToken : pair.quoteToken;

      if (token) {
        return {
          name: token.name || "Unknown",
          symbol: token.symbol || "???",
          image: pair.info?.imageUrl || null,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

// Fetch from Helius DAS API
async function fetchFromHelius(address: string, apiKey: string): Promise<TokenMetadata | null> {
  try {
    const response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "quickbanner",
          method: "getAsset",
          params: { id: address },
        }),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const asset = data.result;

    if (asset?.content?.metadata) {
      return {
        name: asset.content.metadata.name || "Unknown",
        symbol: asset.content.metadata.symbol || "???",
        image: asset.content.links?.image || asset.content.files?.[0]?.uri || null,
        description: asset.content.metadata.description,
      };
    }

    return null;
  } catch {
    return null;
  }
}
