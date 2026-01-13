/**
 * Content Script: Wallet Bridge
 * Bridges wallet providers from webpage context to extension context
 * Required because extension popups can't directly access window.phantom/solana
 */

import { VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

// Global type definition for the bridge
declare global {
  interface Window {
    __LaunchExtBridge: {
      signTransaction: (transactionBase58: string, providerType: string) => Promise<{ success: boolean; signedTransactionBase58?: string; error?: string }>;
    }
  }
}

const Bridge = {
  async signTransaction(transactionBase58: string, providerType: string) {
    try {
      const provider = providerType === 'phantom'
        ? ((window as any).phantom?.solana || (window as any).solana)
        : (window as any).solflare;

      if (!provider) {
        return { success: false, error: `${providerType} wallet not found` };
      }

      // Deserialize using our bundled @solana/web3.js
      const txBytes = bs58.decode(transactionBase58);
      
      // We need to ensure VersionedTransaction is available. 
      // Since this script is bundled, it should be fine.
      const tx = VersionedTransaction.deserialize(txBytes);

      // Sign with wallet provider
      const signedTx = await provider.signTransaction(tx);

      // Serialize and encode back
      const signedBytes = signedTx.serialize();
      const signedBase58 = bs58.encode(signedBytes);

      return {
        success: true,
        signedTransactionBase58: signedBase58,
      };
    } catch (error: any) {
      console.error('Wallet Bridge Error:', error);
      return {
        success: false,
        error: error.message || 'Transaction signing failed',
      };
    }
  }
};

// Expose on window for executeScript to call
(window as any).__LaunchExtBridge = Bridge;

// Notify that bridge is loaded
console.log('Launch Ext Wallet Bridge Loaded');

