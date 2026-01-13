import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch latest banners
    const banners = await prisma.banner.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        outputType: true,
        prompt: true, // we might parse token name from prompt if not stored separately
        // Actually, schema shows 'prompt' but not 'tokenName'. 
        // We'll trust the prompt usually contains it or display "New Generation"
      }
    });

    // 2. Fetch latest launches
    const launches = await prisma.launch.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // 3. Combine and sort
    const events = [
      ...banners.map(b => ({
        type: 'generate',
        text: b.outputType === 'pfp' ? 'New PFP Generated' : 'New Banner Generated',
        createdAt: b.createdAt,
        id: b.id,
      })),
      ...launches.map(l => ({
        type: 'launch',
        text: `Token $${l.symbol} launched on DexGen`,
        createdAt: l.createdAt,
        id: l.id,
        link: `https://pump.fun/${l.mint}`
      }))
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("Failed to fetch activity:", error);
    return NextResponse.json(
      { success: false, error: "Check server logs" },
      { status: 500 }
    );
  }
}
