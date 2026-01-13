// API client for backend communication

import type { TokenMetadata, LaunchData, TokenStats } from '../types';

// const DEFAULT_BACKEND_URL = 'http://localhost:3000'; // Local backend
const DEFAULT_BACKEND_URL = 'https://backend-production-c7f5.up.railway.app'; // Railway production backend - REPLACE THIS after deploying new backend

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = DEFAULT_BACKEND_URL;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  // Generate AI banner - matches quickbanner backend API
  async generateBanner(params: {
    tokenName: string;
    ticker?: string;
    tagline?: string;
    creativePrompt?: string;
    style: string;
    chaosLevel?: number;
    imageBase64?: string;
    outputType: 'banner' | 'pfp';
    variantCount?: number;
  }): Promise<{ imageUrl: string; imageBase64: string }> {
    // Build request body, only include imageBase64 if it's provided
    const requestBody: any = {
      tokenName: params.tokenName,
      ticker: params.ticker,
      tagline: params.tagline,
      creativePrompt: params.creativePrompt,
      style: params.style,
      chaosLevel: params.chaosLevel || 50,
      outputType: params.outputType,
      variantCount: params.variantCount || 1,
    };

    // Only include imageBase64 if it's actually provided (not empty string)
    if (params.imageBase64 && params.imageBase64.trim()) {
      requestBody.imageBase64 = params.imageBase64;
    }

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Banner generation failed: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    if (!data.success || !data.banners || data.banners.length === 0) {
      throw new Error('No banners generated from server');
    }

    const firstBanner = data.banners[0];
    const imageUrl = firstBanner.imageUrl;

    // If imageUrl is already a data URL, we can extract the base64
    let imageBase64 = imageUrl;
    if (imageUrl.startsWith('data:')) {
      imageBase64 = imageUrl;
    } else {
      // If it's a link, we'll keep it as a link (the preview can handle both)
      // but the extension expects imageBase64 in state for now
      imageBase64 = imageUrl;
    }

    return { imageUrl, imageBase64 };
  }

  // Save launch to database
  async saveLaunch(launch: LaunchData): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/launches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(launch),
    });

    if (!response.ok) {
      throw new Error(`Failed to save launch: ${response.statusText}`);
    }
  }

  // Get launches for wallet
  async getLaunches(walletAddress: string): Promise<LaunchData[]> {
    const response = await fetch(`${this.baseUrl}/api/launches?wallet=${walletAddress}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch launches: ${response.statusText}`);
    }

    return response.json();
  }

  // Get token stats
  async getTokenStats(mint: string): Promise<TokenStats> {
    const response = await fetch(`${this.baseUrl}/api/token-stats?mint=${mint}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch token stats: ${response.statusText}`);
    }

    return response.json();
  }

  // Upload to IPFS (proxied through backend)
  async uploadToIPFS(metadata: TokenMetadata): Promise<{ metadataUri: string }> {
    const formData = new FormData();

    if (metadata.imageBase64) {
      let blob: Blob;
      if (metadata.imageBase64.startsWith('http')) {
        // If it's a remote URL, fetch it first
        const response = await fetch(metadata.imageBase64);
        blob = await response.blob();
      } else {
        // Convert base64 to blob
        blob = await this.base64ToBlob(metadata.imageBase64);
      }

      // Compress the image if it's too large (over 2MB)
      if (blob.size > 2 * 1024 * 1024) {
        blob = await this.compressImage(blob);
      }

      formData.append('file', blob, 'token.png');
    }

    formData.append('name', metadata.name);
    formData.append('symbol', metadata.symbol);
    formData.append('description', metadata.description);
    formData.append('showName', 'true');

    if (metadata.twitter) formData.append('twitter', metadata.twitter);
    if (metadata.telegram) formData.append('telegram', metadata.telegram);
    if (metadata.website) formData.append('website', metadata.website);

    const response = await fetch(`${this.baseUrl}/api/launch/ipfs`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`IPFS upload failed: ${errorData.error || response.statusText}`);
    }

    return response.json();
  }

  private async base64ToBlob(base64: string): Promise<Blob> {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/png' });
  }

  private async compressImage(blob: Blob, maxSizeMB: number = 2): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        URL.revokeObjectURL(url);

        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions (max 1200px width while maintaining aspect ratio)
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Start with quality 0.8 and reduce if needed
        let quality = 0.8;
        const tryCompress = () => {
          canvas.toBlob(
            (compressedBlob) => {
              if (!compressedBlob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // If still too large and we can reduce quality more
              if (compressedBlob.size > maxSizeMB * 1024 * 1024 && quality > 0.5) {
                quality -= 0.1;
                tryCompress();
              } else {
                resolve(compressedBlob);
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress();
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for compression'));
      };

      img.src = url;
    });
  }
}

export const apiClient = new ApiClient();
