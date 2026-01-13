// Wallet utilities for Launch Ext
import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';
import { storage, STORAGE_KEYS } from './storage';
import type { WalletState } from '../types';

// Encryption utilities using Web Crypto API
class WalletEncryption {
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password, salt);

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );

    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

    return bs58.encode(combined);
  }

  async decrypt(encryptedString: string, password: string): Promise<string> {
    const decoder = new TextDecoder();
    const combined = bs58.decode(encryptedString);

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encryptedData = combined.slice(28);

    const key = await this.deriveKey(password, salt);

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    return decoder.decode(decryptedData);
  }
}

const encryption = new WalletEncryption();

// Embedded Wallet Management
export class EmbeddedWallet {
  private keypair: Keypair | null = null;
  private connection: Connection;

  constructor(rpcUrl: string = 'https://mainnet.helius-rpc.com/?api-key=0e492ad2-d236-41dc-97e0-860d712bc03d') {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  // Create a new wallet
  create(): { publicKey: string; secretKey: string } {
    this.keypair = Keypair.generate();
    return {
      publicKey: this.keypair.publicKey.toBase58(),
      secretKey: bs58.encode(this.keypair.secretKey),
    };
  }

  // Import wallet from private key
  import(secretKey: string): { publicKey: string } {
    try {
      const decoded = bs58.decode(secretKey);
      this.keypair = Keypair.fromSecretKey(decoded);
      return {
        publicKey: this.keypair.publicKey.toBase58(),
      };
    } catch (error) {
      throw new Error('Invalid private key');
    }
  }

  // Save encrypted wallet
  async save(password: string): Promise<void> {
    if (!this.keypair) {
      throw new Error('No wallet to save');
    }

    const secretKey = bs58.encode(this.keypair.secretKey);
    const encrypted = await encryption.encrypt(secretKey, password);

    await storage.set(STORAGE_KEYS.ENCRYPTED_KEY, encrypted);
    await this.updateWalletState();
  }

  // Load encrypted wallet
  async load(password: string): Promise<void> {
    const encrypted = await storage.get<string>(STORAGE_KEYS.ENCRYPTED_KEY);
    if (!encrypted) {
      throw new Error('No saved wallet found');
    }

    try {
      const secretKey = await encryption.decrypt(encrypted, password);
      this.import(secretKey);
      await this.updateWalletState();
    } catch (error) {
      throw new Error('Incorrect password or corrupted wallet data');
    }
  }

  // Get SOL balance
  async getBalance(): Promise<number> {
    if (!this.keypair) {
      throw new Error('No wallet loaded');
    }

    try {
      const balance = await this.connection.getBalance(this.keypair.publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.warn('Failed to fetch embedded balance:', error);
      return 0;
    }
  }

  // Get keypair for signing
  getKeypair(): Keypair {
    if (!this.keypair) {
      throw new Error('No wallet loaded');
    }
    return this.keypair;
  }

  // Update wallet state in storage
  private async updateWalletState(): Promise<void> {
    if (!this.keypair) return;

    const balance = await this.getBalance();
    const walletState: WalletState = {
      connected: true,
      address: this.keypair.publicKey.toBase58(),
      balance,
      type: 'embedded',
    };

    await storage.set(STORAGE_KEYS.WALLET, walletState);
  }

  // Clear wallet data
  async clear(): Promise<void> {
    this.keypair = null;
    await storage.remove(STORAGE_KEYS.ENCRYPTED_KEY);
    await storage.remove(STORAGE_KEYS.WALLET);
  }
}

// External Wallet Management (Phantom/Solflare)
export class ExternalWallet {
  private connection: Connection;
  private provider: any = null;

  constructor(rpcUrl: string = 'https://mainnet.helius-rpc.com/?api-key=0e492ad2-d236-41dc-97e0-860d712bc03d') {
    // Note: Public RPCs often rate-limit or 403. Using Helius.
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  // Connect to Phantom wallet
  async connectPhantom(): Promise<{ publicKey: string }> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error('No active tab found');

      if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-error://') || tab.url?.startsWith('about:') || !tab.url) {
        throw new Error('Cannot connect to wallet on this page. Please navigate to a valid website (e.g., Google or your app) and try again.');
      }

      // Inject content script to ensure it's available
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/wallet-bridge.js'],
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.log('Content script already injected:', err);
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: async () => {
          const provider = (window as any).phantom?.solana || (window as any).solana;
          if (!provider?.isPhantom) throw new Error('Phantom not found');
          const resp = await provider.connect();
          return resp.publicKey.toString();
        },
      });

      const publicKey = results[0].result;
      if (!publicKey) throw new Error('Failed to get public key');

      this.provider = { type: 'phantom' }; // Mark that we're using phantom
      await this.updateWalletState(publicKey);
      return { publicKey };
    } catch (error: any) {
      throw new Error(error.message || 'Phantom wallet connection failed');
    }
  }

  // Connect to Solflare wallet
  async connectSolflare(): Promise<{ publicKey: string }> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error('No active tab found');

      // Inject content script to ensure it's available
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/wallet-bridge.js'],
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.log('Content script already injected:', err);
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: async () => {
          const provider = (window as any).solflare;
          if (!provider) throw new Error('Solflare not found');
          await provider.connect();
          return provider.publicKey.toString();
        },
      });

      const publicKey = results[0].result;
      if (!publicKey) throw new Error('Failed to get public key');

      this.provider = { type: 'solflare' };
      await this.updateWalletState(publicKey);
      return { publicKey };
    } catch (error: any) {
      throw new Error(error.message || 'Solflare wallet connection failed');
    }
  }

  // Get provider for signing transactions
  getProvider(): any {
    if (!this.provider) {
      throw new Error('No wallet connected');
    }

    return {
      signTransaction: async (transaction: any) => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) throw new Error('No active tab found');

        if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('chrome-error://') || tab.url?.startsWith('about:') || !tab.url) {
          throw new Error('Cannot sign transaction on this page. Please navigate to a valid website and try again.');
        }

        // Serialize transaction to base58 string
        const { VersionedTransaction } = await import('@solana/web3.js');
        const serializedTx = bs58.encode(transaction.serialize());
        const providerType = this.provider.type;

        try {
          // Ensure content script is injected into MAIN world
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              world: 'MAIN',
              files: ['content/wallet-bridge.js'],
            });
          } catch (err) {
            console.log('Content script injection warning:', err);
          }

          // Give content script a moment to initialize
          await new Promise(resolve => setTimeout(resolve, 100));

          // Execute signing via global bridge in MAIN world
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            world: 'MAIN',
            func: async (txBase58: string, type: string) => {
              const bridge = (window as any).__LaunchExtBridge;
              if (!bridge) throw new Error('Wallet Bridge not initialized');
              return await bridge.signTransaction(txBase58, type);
            },
            args: [serializedTx, providerType],
          });

          const response = results[0]?.result;

          if (!response || !response.success || !response.signedTransactionBase58) {
            throw new Error(response?.error || 'Failed to sign transaction');
          }

          // Deserialize signed transaction
          const signedBytes = bs58.decode(response.signedTransactionBase58);
          return VersionedTransaction.deserialize(signedBytes);

        } catch (error: any) {
          console.error('Transaction signing error:', error);
          throw new Error(`Failed to sign transaction: ${error.message}`);
        }
      }
    };
  }

  // Get SOL balance
  async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.warn('Failed to fetch balance from RPC, falling back to 0:', error);
      // If RPC fails (like the 403 you saw), don't crash the whole app, 
      // just return 0 so the user can still attempt to connect.
      return 0;
    }
  }

  // Update wallet state in storage
  private async updateWalletState(address: string): Promise<void> {
    const balance = await this.getBalance(address);
    const walletState: WalletState = {
      connected: true,
      address,
      balance,
      type: 'external',
    };

    await storage.set(STORAGE_KEYS.WALLET, walletState);
  }

  // Disconnect wallet
  async disconnect(): Promise<void> {
    if (this.provider) {
      // For external wallets, we don't necessarily need to disconnect from the page
      // just clear our local state.
    }

    this.provider = null;
    await storage.remove(STORAGE_KEYS.WALLET);
  }
}

// Wallet singleton instances
let externalInstance: ExternalWallet | null = null;
let embeddedInstance: EmbeddedWallet | null = null;

// Wallet factory
export const walletFactory = {
  createEmbedded(rpcUrl?: string): EmbeddedWallet {
    if (!embeddedInstance) {
      embeddedInstance = new EmbeddedWallet(rpcUrl);
    }
    return embeddedInstance;
  },

  createExternal(rpcUrl?: string): ExternalWallet {
    if (!externalInstance) {
      externalInstance = new ExternalWallet(rpcUrl);
    }
    return externalInstance;
  },
};
