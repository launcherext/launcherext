import { NextResponse } from "next/server";
import { getCreateTokenTransaction } from "@/lib/pumpportal";
import { Keypair, PublicKey } from "@solana/web3.js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { metadata, devBuyAmount, mintPublicKey, userPublicKey } = body;
    
    if (!metadata || !mintPublicKey || !userPublicKey) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Create a stub that mimics Keypair structure for the helper function
    // We only need the public key on the server to build the transaction
    const mintKeypairStub = {
      publicKey: new PublicKey(mintPublicKey)
    } as any as Keypair;

    // Use environment variable for API key (with fallback for demo)
    const apiKey = process.env.PUMP_PORTAL_API_KEY || "demo-api-key";

    const result = await getCreateTokenTransaction(
      { 
        metadata, 
        devBuyAmount: Number(devBuyAmount) || 0.1 
      },
      mintKeypairStub,
      userPublicKey,
      apiKey
    );
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return NextResponse.json({ 
      success: true, 
      transaction: result.transaction 
    });
    
  } catch (err) {
    console.error("Launch transaction error:", err);
    return NextResponse.json(
      { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to create transaction" 
      }, 
      { status: 500 }
    );
  }
}
