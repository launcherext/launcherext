/**
 * PumpPortal API Integration
 * 
 * For launching tokens on pump.fun via PumpPortal
 * https://pumpportal.fun/creation
 */

import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  imageBase64: string;
}

interface CreateTokenParams {
  metadata: TokenMetadata;
  devBuyAmount?: number; // SOL amount for initial dev buy
  slippage?: number;
  priorityFee?: number;
}

interface CreateTokenResult {
  success: boolean;
  signature?: string;
  mintAddress?: string;
  error?: string;
}

interface IPFSUploadResult {
  metadataUri: string;
  metadata: {
    name: string;
    symbol: string;
    description: string;
    image: string;
  };
}

/**
 * Upload token metadata and image to IPFS via pump.fun (through our proxy to avoid CORS)
 */
async function uploadToIPFS(metadata: TokenMetadata): Promise<IPFSUploadResult> {
  const formData = new FormData();
  
  // Convert base64 image to blob
  const imageBlob = await base64ToBlob(metadata.imageBase64);
  formData.append('file', imageBlob, 'token.png');
  
  // Add metadata
  formData.append('name', metadata.name);
  formData.append('symbol', metadata.symbol);
  formData.append('description', metadata.description);
  formData.append('showName', 'true');
  
  if (metadata.twitter) formData.append('twitter', metadata.twitter);
  if (metadata.telegram) formData.append('telegram', metadata.telegram);
  if (metadata.website) formData.append('website', metadata.website);

  // Use backend proxy to avoid CORS (pump.fun doesn't allow direct browser calls)
  const response = await fetch('/api/launch/ipfs', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `IPFS upload failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new token on pump.fun via PumpPortal
 * 
 * NOTE: This requires a PumpPortal API key and the user's wallet to sign
 */
export async function createTokenViaPumpPortal(
  params: CreateTokenParams,
  apiKey: string
): Promise<CreateTokenResult> {
  try {
    // Generate a new keypair for the token mint
    const mintKeypair = Keypair.generate();
    
    // Upload to IPFS first
    const ipfsResult = await uploadToIPFS(params.metadata);
    
    // Create the token
    const response = await fetch(`https://pumpportal.fun/api/trade?api-key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        tokenMetadata: {
          name: ipfsResult.metadata.name,
          symbol: ipfsResult.metadata.symbol,
          uri: ipfsResult.metadataUri,
        },
        mint: bs58.encode(mintKeypair.secretKey),
        denominatedInSol: 'true',
        amount: params.devBuyAmount || 0.1, // Default 0.1 SOL dev buy
        slippage: params.slippage || 10,
        priorityFee: params.priorityFee || 0.0005,
        pool: 'pump',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PumpPortal API error: ${errorText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      signature: data.signature,
      mintAddress: mintKeypair.publicKey.toString(),
    };
  } catch (error) {
    console.error('Token creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get transaction data without executing (for client-side wallet signing)
 * This is safer as the server doesn't need to hold private keys
 */
export async function getCreateTokenTransaction(
  params: CreateTokenParams,
  mintKeypair: Keypair,
  userPublicKey: string,
  apiKey: string
): Promise<{ transaction?: string; error?: string }> {
  try {
    // Upload to IPFS first
    const ipfsResult = await uploadToIPFS(params.metadata);
    
    const response = await fetch(`https://pumpportal.fun/api/trade-local?api-key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        publicKey: userPublicKey,
        action: 'create',
        tokenMetadata: {
          name: ipfsResult.metadata.name,
          symbol: ipfsResult.metadata.symbol,
          uri: ipfsResult.metadataUri,
        },
        mint: mintKeypair.publicKey.toString(),
        denominatedInSol: 'true',
        amount: params.devBuyAmount || 0.1,
        slippage: params.slippage || 10,
        priorityFee: params.priorityFee || 0.0005,
        pool: 'pump',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PumpPortal API error: ${errorText}`);
    }

    // The API might return JSON or raw content. 
    // We try to parse as JSON, but if that fails/is empty, we assume the body IS the transaction.
    const arrayBuffer = await response.arrayBuffer();
    try {
        const text = new TextDecoder().decode(arrayBuffer);
        const data = JSON.parse(text);
        if (data.transaction || data.tx) {
             return { transaction: data.transaction || data.tx };
        }
        // If it parsed as JSON but has no transaction field, maybe the JSON IS the error or something else?
        // But for "trade-local", it might just be the string?
    } catch (e) {
        // Parsing failed, it's not JSON.
    }

    // Fallback: The body is the transaction.
    // We assume it's binary data (serialized transaction).
    // Our frontend expects a base58 string.
    const signature = bs58.encode(new Uint8Array(arrayBuffer));
    return { transaction: signature };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Convert base64 image to Blob
 */
async function base64ToBlob(base64: string): Promise<Blob> {
  // Remove data URL prefix if present
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  
  // Decode base64
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/png' });
}

/**
 * Validate token metadata
 */
export function validateTokenMetadata(metadata: Partial<TokenMetadata>): string[] {
  const errors: string[] = [];
  
  if (!metadata.name?.trim()) {
    errors.push('Token name is required');
  } else if (metadata.name.length > 32) {
    errors.push('Token name must be 32 characters or less');
  }
  
  if (!metadata.symbol?.trim()) {
    errors.push('Token symbol is required');
  } else if (metadata.symbol.length > 10) {
    errors.push('Token symbol must be 10 characters or less');
  }
  
  if (!metadata.imageBase64) {
    errors.push('Token image is required');
  }
  
  if (!metadata.description?.trim()) {
    errors.push('Token description is required');
  } else if (metadata.description.length > 500) {
    errors.push('Description must be 500 characters or less');
  }
  
  return errors;
}
