import { NextRequest, NextResponse } from "next/server";
import { sanitizePromptInput } from "@/lib/utils";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";

interface TaglineRequest {
  tokenName: string;
  ticker?: string;
  style?: string;
}

// Generate catchy taglines using Gemini
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`tagline:${clientIP}`, RATE_LIMITS.tagline);

  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, error: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.resetIn) } }
    );
  }

  try {
    const body: TaglineRequest = await request.json();

    if (!body.tokenName) {
      return NextResponse.json(
        { success: false, error: "Token name is required" },
        { status: 400 }
      );
    }

    // Sanitize inputs to prevent prompt injection
    const sanitizedTokenName = sanitizePromptInput(body.tokenName, 100);
    const sanitizedTicker = body.ticker ? sanitizePromptInput(body.ticker, 20) : undefined;
    const sanitizedStyle = body.style ? sanitizePromptInput(body.style, 50) : undefined;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback to pre-made taglines if no API key
      return NextResponse.json({
        success: true,
        taglines: generateFallbackTaglines(sanitizedTokenName, sanitizedTicker),
      });
    }

    const taglines = await generateWithGemini(
      apiKey,
      sanitizedTokenName,
      sanitizedTicker,
      sanitizedStyle
    );

    return NextResponse.json({ success: true, taglines });
  } catch (error) {
    console.error("Tagline generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate taglines" },
      { status: 500 }
    );
  }
}

async function generateWithGemini(
  apiKey: string,
  tokenName: string,
  ticker?: string,
  style?: string
): Promise<string[]> {
  const prompt = `Generate 5 short, catchy, meme-coin style taglines for a cryptocurrency token.

Token Name: ${tokenName}
${ticker ? `Ticker: ${ticker}` : ""}
${style ? `Vibe: ${style}` : ""}

Requirements:
- Each tagline should be 3-8 words max
- Make them punchy, memorable, and degen-friendly
- Mix of funny, hype, and absurdist humor
- Perfect for a DexScreener banner
- No hashtags, just the tagline text

Return ONLY the 5 taglines, one per line, no numbering or extra text.`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 200,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Gemini API error:", error);
    throw new Error("Gemini API request failed");
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Parse the response - split by newlines and clean up
  const taglines = text
    .split("\n")
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0 && line.length < 100)
    .slice(0, 5);

  if (taglines.length === 0) {
    return generateFallbackTaglines(tokenName, ticker);
  }

  return taglines;
}

function generateFallbackTaglines(tokenName: string, ticker?: string): string[] {
  const name = tokenName.toUpperCase();
  const tick = ticker || `$${tokenName.slice(0, 4).toUpperCase()}`;

  const templates = [
    `${name} to the moon, jeets stay poor`,
    `Buy ${tick}, thank me later`,
    `Diamond hands only, paper hands exit`,
    `${name}: Built different, hits different`,
    `Ape in or cry later`,
    `${tick} is inevitable`,
    `Your portfolio needs more ${name}`,
    `${name}: The next 1000x`,
    `WAGMI with ${tick}`,
    `${name} szn is here`,
    `Don't fade ${tick}`,
    `${name}: Community driven chaos`,
  ];

  // Shuffle and return 5
  return templates.sort(() => Math.random() - 0.5).slice(0, 5);
}
