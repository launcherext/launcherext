import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { generateBanner } from "@/lib/ai-provider";
import { GenerateRequest, GenerateResponse, GeneratedBanner, OutputType } from "@/lib/types";
import { generateSeed } from "@/lib/styleMatrix";
import { sanitizePromptInput } from "@/lib/utils";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";
import { DEXGEN_CONFIG, getTierFromBalance, getDailyLimit } from "@/lib/token-config";
import { getUsage, incrementUsage, canGenerate as canGenerateCheck } from "@/lib/usage-tracker";
import { Connection, PublicKey } from "@solana/web3.js";

// Cache for launch time (server-side)
let serverLaunchTime: number | null = null;
const LAUNCH_TIME_KEY = 'DEXGEN_LAUNCH_TIME';

export const maxDuration = 60; // Allow 60 seconds for generation
export const dynamic = 'force-dynamic'; // Disable static optimization


function isInFreePeriod(): boolean {
  // OPEN ACCESS MODE: App is open to everyone while launch is rescheduled
  // Set this to false when ready to enforce token gating
  const OPEN_ACCESS = true;
  if (OPEN_ACCESS) return true;

  // Check environment variable for launch time
  const envLaunchTime = process.env.DEXGEN_LAUNCH_TIME;
  if (envLaunchTime) {
    const launchTime = parseInt(envLaunchTime, 10);
    const elapsed = Date.now() - launchTime;
    return elapsed < DEXGEN_CONFIG.launchDuration;
  }

  // Fallback: use server memory (resets on restart)
  if (!serverLaunchTime) {
    serverLaunchTime = Date.now();
  }
  const elapsed = Date.now() - serverLaunchTime;
  return elapsed < DEXGEN_CONFIG.launchDuration;
}

// Verify token balance directly (server-side)
async function verifyTokenBalance(walletAddress: string): Promise<number> {
  const mintAddress = DEXGEN_CONFIG.mintAddress;

  // Mock mode for development
  if (mintAddress === 'YOUR_MINT_ADDRESS_HERE') {
    // Return a mock balance based on address hash
    const hash = walletAddress.slice(0, 8).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mod = hash % 100;
    if (mod < 20) return 0;
    if (mod < 40) return 50_000;
    if (mod < 55) return 150_000;
    if (mod < 70) return 600_000;
    if (mod < 85) return 3_000_000;
    return 15_000_000;
  }

  try {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');
    const publicKey = new PublicKey(walletAddress);
    const tokenMint = new PublicKey(mintAddress);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { mint: tokenMint }
    );

    let balance = 0;
    for (const account of tokenAccounts.value) {
      const parsed = account.account.data.parsed;
      if (parsed?.info?.tokenAmount?.uiAmount) {
        balance += parsed.info.tokenAmount.uiAmount;
      }
    }
    return balance;
  } catch {
    return 0;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`generate:${clientIP}`, RATE_LIMITS.generate);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        success: false,
        error: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.`,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimit.resetIn),
          "Retry-After": String(rateLimit.resetIn),
        },
      }
    );
  }

  try {
    const body = await request.json();

    // Token gating check (skip during free launch period)
    const freePeriod = isInFreePeriod();

    if (!freePeriod) {
      const walletAddress = body.walletAddress;

      if (!walletAddress) {
        return NextResponse.json(
          {
            success: false,
            error: "Wallet connection required. Hold $DEXGEN tokens to generate banners.",
            requiresWallet: true,
          },
          { status: 401 }
        );
      }

      // Verify token balance
      const balance = await verifyTokenBalance(walletAddress);
      const tier = getTierFromBalance(balance);

      if (tier === 'none') {
        return NextResponse.json(
          {
            success: false,
            error: "Insufficient $DEXGEN tokens. Hold at least 100K tokens to generate banners.",
            requiresTokens: true,
            currentBalance: balance,
            minimumRequired: DEXGEN_CONFIG.tiers.bronze.min,
          },
          { status: 403 }
        );
      }

      // Check daily usage limit
      const dailyLimit = getDailyLimit(tier);
      const currentUsage = getUsage(walletAddress);

      if (dailyLimit !== Infinity && currentUsage >= dailyLimit) {
        return NextResponse.json(
          {
            success: false,
            error: `Daily limit reached (${dailyLimit}/${dailyLimit}). Upgrade your tier or try again tomorrow.`,
            limitReached: true,
            tier,
            dailyLimit,
            used: currentUsage,
          },
          { status: 429 }
        );
      }

      // Increment usage after validation passes (will be decremented if generation fails)
      incrementUsage(walletAddress);
    }

    // Validate required fields
    if (!body.tokenName?.trim()) {
      return NextResponse.json(
        { success: false, error: "Token name is required" },
        { status: 400 }
      );
    }

    // Image is optional if creative prompt is provided
    if (!body.imageBase64 && !body.creativePrompt?.trim()) {
      return NextResponse.json(
        { success: false, error: "Token image or creative prompt is required" },
        { status: 400 }
      );
    }

    if (!body.style) {
      return NextResponse.json(
        { success: false, error: "Style is required" },
        { status: 400 }
      );
    }

    // Sanitize user inputs to prevent prompt injection
    const sanitizedTokenName = sanitizePromptInput(body.tokenName, 100);
    const sanitizedTicker = body.ticker ? sanitizePromptInput(body.ticker, 20) : undefined;
    const sanitizedTagline = body.tagline ? sanitizePromptInput(body.tagline, 200) : undefined;
    const sanitizedCreativePrompt = body.creativePrompt ? sanitizePromptInput(body.creativePrompt, 500) : undefined;

    const variantCount = Math.min(Math.max(body.variantCount || 1, 1), 5);

    // Generate all variants in parallel for faster response
    const generationPromises = Array.from({ length: variantCount }, async (_, i) => {
      const seed = generateSeed();
      const results: GeneratedBanner[] = [];

      // Helper to process result
      const processResult = async (type: OutputType, currentSeed: number) => {
        const result = await generateBanner({
          tokenName: sanitizedTokenName,
          ticker: sanitizedTicker,
          tagline: sanitizedTagline,
          creativePrompt: sanitizedCreativePrompt,
          style: body.style,
          chaosLevel: body.chaosLevel ?? 50,
          imageBase64: body.imageBase64,
          seed: currentSeed,
          outputType: type,
          recipeId: body.recipeId,
        });

        // Determine the correct data URL format or Blob upload
        let imageUrl = result.imageUrl || '';
        if (!imageUrl && result.imageBase64) {
          const isSvg = result.imageBase64.startsWith('PHN2Zy') || result.imageBase64.startsWith('PD94bW');
          const mimeType = isSvg ? 'image/svg+xml' : 'image/png';
          imageUrl = `data:${mimeType};base64,${result.imageBase64}`;
        }

        // PERSISTENCE: Upload to Vercel Blob and save to DB
        // Skip in development for faster iteration - Pollinations URLs work fine directly
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
        if (isProduction && process.env.BLOB_READ_WRITE_TOKEN && process.env.POSTGRES_PRISMA_URL) {
          try {
            // 1. Upload to Blob
            let blobUrl = imageUrl;
            // If it's a data URL, convert to buffer
            if (imageUrl.startsWith('data:')) {
              const base64Data = imageUrl.split(',')[1];
              const buffer = Buffer.from(base64Data, 'base64');
              const filename = `banners/${Date.now()}_${i}_${type}.png`; // assuming png for simplicity
              const blob = await put(filename, buffer, { access: 'public' });
              blobUrl = blob.url;
            } else if (imageUrl.startsWith('http')) {
              // If it's a remote URL (Pollinations), fetch and re-upload to ensure persistence
              const response = await fetch(imageUrl);
              const blobData = await response.blob();
              const filename = `banners/${Date.now()}_${i}_${type}.png`;
              const blob = await put(filename, blobData, { access: 'public' });
              blobUrl = blob.url;
            }

            // 2. Save to DB
            const banner = await prisma.banner.create({
              data: {
                prompt: result.prompt,
                style: body.style,
                imageUrl: blobUrl,
                seed: result.seed,
                outputType: type,
                recipeId: result.recipeId,
                walletAddress: body.walletAddress || null, // Optional tracking
              },
            });
            
            // Return the Blob URL instead of the data URL if successful
            imageUrl = blobUrl;
          } catch (error) {
            console.error("Persistence failed:", error);
            // Continue without failing the request
          }
        }

        return {
          id: `asset_${Date.now()}_${i}_${type}`,
          imageUrl: imageUrl || '',
          seed: result.seed,
          prompt: result.prompt,
          style: body.style,
          outputType: type,
          recipeId: result.recipeId,
        };
      };

      // 1. Generate Primary
      const primaryType = body.outputType || 'banner';
      results.push(await processResult(primaryType, seed));

      // 2. Generate Companion if requested
      if (body.generateCompanion) {
        const companionType = primaryType === 'pfp' ? 'banner' : 'pfp';
        // Use same seed for consistency
        results.push(await processResult(companionType, seed));
      }

      return results;
    });

    const bannersArrays = await Promise.all(generationPromises);
    const banners = bannersArrays.flat();

    return NextResponse.json({
      success: true,
      banners,
    });
  } catch (error) {
    console.error("Generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Health check / info endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "ok",
    provider: process.env.AI_PROVIDER || "mock",
    version: "1.0.0",
  });
}
