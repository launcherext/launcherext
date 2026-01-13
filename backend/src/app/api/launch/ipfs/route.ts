import { NextResponse } from "next/server";

/**
 * IPFS Upload Proxy for pump.fun
 * 
 * This endpoint proxies IPFS uploads to pump.fun to avoid CORS errors
 * when calling directly from the frontend.
 */
export async function POST(req: Request) {
  try {
    // Get the form data from the request
    const formData = await req.formData();
    
    // Forward the request to pump.fun
    const response = await fetch('https://pump.fun/api/ipfs', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PumpFun IPFS error: ${response.status} - ${errorText}`);
      throw new Error(`PumpFun rejected the upload: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      ...data
    });
    
  } catch (err) {
    console.error("IPFS upload proxy error:", err);
    return NextResponse.json(
      { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to upload to IPFS" 
      }, 
      { status: 500 }
    );
  }
}
