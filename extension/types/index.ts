// Type definitions for Launch Ext

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  imageUrl?: string;
  imageBase64?: string;
}

export interface LaunchData {
  id: string;
  signature: string;
  mint: string;
  name: string;
  symbol: string;
  walletAddress: string;
  devBuyAmount: number;
  launchedAt: number;
  imageUrl?: string;
}

export interface TokenStats {
  mint: string;
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  holders: number;
  volume24h: number;
  percentChange24h: number;
  isLive: boolean;
}

export interface LaunchWithStats extends LaunchData {
  stats?: TokenStats;
  profitLoss?: number;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number;
  type: 'external' | 'embedded' | null;
}

export interface Settings {
  rpcUrl: string;
  backendUrl?: string;
  devBuyDefault: number;
  slippageDefault: number;
  priorityFee: number;
}

export interface CreateTokenParams {
  metadata: TokenMetadata;
  devBuyAmount: number;
  slippage: number;
  priorityFee: number;
}

export interface CreateTokenResult {
  success: boolean;
  signature?: string;
  mintAddress?: string;
  error?: string;
}

// Message types for background communication
export type BackgroundMessage =
  | { type: 'GET_STORAGE'; key: string }
  | { type: 'SET_STORAGE'; key: string; value: any }
  | { type: 'FETCH_API'; url: string; options: RequestInit };

export type BackgroundResponse =
  | { success: true; data: any }
  | { success: false; error: string };
