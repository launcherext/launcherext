"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SavedBanner,
  getBanners,
  addBanner,
  deleteBanner,
  clearHistory,
} from "@/lib/history-storage";
import { BannerStyle } from "@/components/core/StyleMatrix";

export function useBannerHistory() {
  const [banners, setBanners] = useState<SavedBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load banners from localStorage on mount
  useEffect(() => {
    setBanners(getBanners());
    setIsLoading(false);
  }, []);

  // Add a new banner
  const saveBanner = useCallback(
    async (
      imageUrl: string,
      tokenName: string,
      ticker: string,
      style: BannerStyle,
      seed: number
    ) => {
      try {
        const newBanner = await addBanner(imageUrl, tokenName, ticker, style, seed);
        setBanners((prev) => [newBanner, ...prev].slice(0, 50));
        return newBanner;
      } catch (error) {
        console.error("Failed to save banner:", error);
        throw error;
      }
    },
    []
  );

  // Delete a banner
  const removeBanner = useCallback((id: string) => {
    deleteBanner(id);
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Clear all history
  const clearAll = useCallback(() => {
    clearHistory();
    setBanners([]);
  }, []);

  // Refresh from localStorage
  const refresh = useCallback(() => {
    setBanners(getBanners());
  }, []);

  return {
    banners,
    isLoading,
    count: banners.length,
    saveBanner,
    removeBanner,
    clearAll,
    refresh,
  };
}
