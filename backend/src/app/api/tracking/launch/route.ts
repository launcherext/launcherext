import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signature, mint, name, symbol, walletAddress } = body;

    if (!signature || !mint || !name || !symbol || !walletAddress) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Persist launch
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
    console.error("Failed to track launch:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
