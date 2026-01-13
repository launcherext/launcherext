// PumpPortal API Integration for Launch Ext
import { Keypair, VersionedTransaction, Connection } from '@solana/web3.js';
import bs58 from 'bs58';
import type { TokenMetadata, CreateTokenParams, CreateTokenResult, LaunchData } from '../types';
import { apiClient } from './api-client';
import { storage, STORAGE_KEYS } from './storage';

const PUMPPORTAL_API_URL = 'https://pumpportal.fun/api';

export class PumpPortalClient {
  private connection: Connection;

  constructor(rpcUrl: string = 'https://mainnet.helius-rpc.com/?api-key=0e492ad2-d236-41dc-97e0-860d712bc03d') {
    // Note: Public RPCs often return 403. Fallback to confirmed.
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Create a token on pump.fun using the Lightning Transaction API
   * This method signs and submits the transaction using the API key
   */
  async createTokenWithApiKey(
    params: CreateTokenParams,
    apiKey: string
  ): Promise<CreateTokenResult> {
    try {
      // Generate a new keypair for the token mint
      const mintKeypair = Keypair.generate();

      // Upload metadata to IPFS via backend proxy
      const ipfsResult = await apiClient.uploadToIPFS(params.metadata);

      // Create the token via PumpPortal Lightning API
      const response = await fetch(`${PUMPPORTAL_API_URL}/trade?api-key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          tokenMetadata: {
            name: params.metadata.name,
            symbol: params.metadata.symbol,
            uri: ipfsResult.metadataUri,
          },
          mint: bs58.encode(mintKeypair.secretKey),
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

      const data = await response.json();

      // Save launch data
      await this.saveLaunchData({
        signature: data.signature,
        mint: mintKeypair.publicKey.toBase58(),
        metadata: params.metadata,
        devBuyAmount: params.devBuyAmount || 0.1,
      });

      return {
        success: true,
        signature: data.signature,
        mintAddress: mintKeypair.publicKey.toBase58(),
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
   * Create a token using local transaction signing
   * This method is used when the user signs the transaction with their wallet
   */
  async createTokenWithWallet(
    params: CreateTokenParams,
    userPublicKey: string,
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
  ): Promise<CreateTokenResult> {
    try {
      // Generate a new keypair for the token mint
      const mintKeypair = Keypair.generate();

      // Upload metadata to IPFS via backend proxy
      const ipfsResult = await apiClient.uploadToIPFS(params.metadata);

      // Get the create transaction from PumpPortal
      const response = await fetch(`${PUMPPORTAL_API_URL}/trade-local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: userPublicKey,
          action: 'create',
          tokenMetadata: {
            name: params.metadata.name,
            symbol: params.metadata.symbol,
            uri: ipfsResult.metadataUri,
          },
          mint: mintKeypair.publicKey.toBase58(),
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

      // Get transaction bytes
      const arrayBuffer = await response.arrayBuffer();
      const transactionBytes = new Uint8Array(arrayBuffer);

      // Deserialize transaction
      const transaction = VersionedTransaction.deserialize(transactionBytes);

      // Sign with mint keypair and user wallet
      transaction.sign([mintKeypair]);
      const signedTransaction = await signTransaction(transaction);

      // Send transaction to RPC
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          maxRetries: 3,
        }
      );

      // Confirm transaction
      await this.connection.confirmTransaction(signature, 'confirmed');

      // Save launch data
      await this.saveLaunchData({
        signature,
        mint: mintKeypair.publicKey.toBase58(),
        metadata: params.metadata,
        devBuyAmount: params.devBuyAmount || 0.1,
      });

      return {
        success: true,
        signature,
        mintAddress: mintKeypair.publicKey.toBase58(),
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
   * Save launch data to local storage
   */
  private async saveLaunchData(data: {
    signature: string;
    mint: string;
    metadata: TokenMetadata;
    devBuyAmount: number;
  }): Promise<void> {
    try {
      // Get wallet address
      const wallet = await storage.get<{ address: string }>(STORAGE_KEYS.WALLET);
      if (!wallet?.address) {
        throw new Error('Wallet not connected');
      }

      // Create launch data
      const launchData: LaunchData = {
        id: `launch_${Date.now()}`,
        signature: data.signature,
        mint: data.mint,
        name: data.metadata.name,
        symbol: data.metadata.symbol,
        walletAddress: wallet.address,
        devBuyAmount: data.devBuyAmount,
        launchedAt: Date.now(),
        imageUrl: data.metadata.imageUrl,
      };

      // Get existing launches
      const existingLaunches = await storage.get<LaunchData[]>(STORAGE_KEYS.LAUNCHES) || [];

      // Add new launch
      existingLaunches.unshift(launchData);

      // Save to storage
      await storage.set(STORAGE_KEYS.LAUNCHES, existingLaunches);

      // Also save to backend if available
      try {
        await apiClient.saveLaunch(launchData);
      } catch (error) {
        console.warn('Failed to save launch to backend:', error);
        // Continue anyway - we have it in local storage
      }
    } catch (error) {
      console.error('Failed to save launch data:', error);
      // Don't throw - the token was still created
    }
  }

  /**
   * Validate token metadata
   */
  validateMetadata(metadata: Partial<TokenMetadata>): string[] {
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
}

// Export singleton instance
export const pumpPortalClient = new PumpPortalClient();
