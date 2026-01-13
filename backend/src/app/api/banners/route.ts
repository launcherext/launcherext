import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    // Check if configuration exists
    if (!process.env.POSTGRES_PRISMA_URL) {
      console.warn("POSTGRES_PRISMA_URL not found, returning empty list");
      return NextResponse.json({ banners: [], hasMore: false });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor"); // ID of the last item seen
    const take = 20;

    const banners = await prisma.banner.findMany({
      take: take + 1, // Fetch one extra to check if there are more
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0, // Skip the cursor itself
      orderBy: {
        createdAt: "desc",
      },
    });

    let hasMore = false;
    if (banners.length > take) {
      hasMore = true;
      banners.pop(); // Remove the extra item
    }

    return NextResponse.json({
      banners,
      nextCursor: hasMore ? banners[banners.length - 1].id : null,
    });
  } catch (error) {
    console.error("Failed to fetch banners:", error);
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}
