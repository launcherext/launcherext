import { BannerStyle } from "@/components/core/StyleMatrix";

// Types
export interface SavedBanner {
  id: string;
  imageUrl: string; // Compressed data URL (JPEG)
  thumbnail: string; // Small preview (300x100)
  tokenName: string;
  ticker: string;
  style: BannerStyle;
  seed: number;
  createdAt: number;
}

const STORAGE_KEY = "quickbanner_history";
const MAX_BANNERS = 50;
const THUMBNAIL_WIDTH = 300;
const THUMBNAIL_HEIGHT = 100;
const JPEG_QUALITY = 0.8;

// Compress image to JPEG data URL
async function compressImage(
  imageUrl: string,
  width: number,
  height: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not create canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}

// Generate thumbnail from image URL
async function generateThumbnail(imageUrl: string): Promise<string> {
  return compressImage(imageUrl, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, 0.7);
}

// Get all banners from localStorage
export function getBanners(): SavedBanner[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to read banner history:", error);
    return [];
  }
}

// Save banners to localStorage
function saveBanners(banners: SavedBanner[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
  } catch (error) {
    console.error("Failed to save banner history:", error);
    // If storage is full, try removing oldest banners
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      const reduced = banners.slice(0, Math.floor(banners.length / 2));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
      } catch {
        // Give up if still failing
        console.error("Storage quota exceeded, unable to save");
      }
    }
  }
}

// Add a new banner to history
export async function addBanner(
  imageUrl: string,
  tokenName: string,
  ticker: string,
  style: BannerStyle,
  seed: number
): Promise<SavedBanner> {
  const banners = getBanners();

  // Generate thumbnail and compress main image
  const [thumbnail, compressedImage] = await Promise.all([
    generateThumbnail(imageUrl),
    compressImage(imageUrl, 1500, 500, JPEG_QUALITY),
  ]);

  const newBanner: SavedBanner = {
    id: `banner_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    imageUrl: compressedImage,
    thumbnail,
    tokenName,
    ticker,
    style,
    seed,
    createdAt: Date.now(),
  };

  // Add to beginning (newest first)
  banners.unshift(newBanner);

  // FIFO: Remove oldest if over limit
  while (banners.length > MAX_BANNERS) {
    banners.pop();
  }

  saveBanners(banners);
  return newBanner;
}

// Delete a specific banner
export function deleteBanner(id: string): void {
  const banners = getBanners();
  const filtered = banners.filter((b) => b.id !== id);
  saveBanners(filtered);
}

// Clear all history
export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// Get a single banner by ID
export function getBannerById(id: string): SavedBanner | undefined {
  const banners = getBanners();
  return banners.find((b) => b.id === id);
}

// Get history count
export function getHistoryCount(): number {
  return getBanners().length;
}
