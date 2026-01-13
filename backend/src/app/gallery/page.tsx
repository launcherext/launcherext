"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GeneratedBanner } from "@/lib/types";
import { Card } from "@/components/primitives/Card";
import { Button, IconButton } from "@/components/primitives/Button";
import { Loader2, Download, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Banner extends GeneratedBanner {
  createdAt: string;
}

export default function GalleryPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchBanners = async (cursor?: string) => {
    try {
      const url = cursor ? `/api/banners?cursor=${cursor}` : "/api/banners";
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.banners) {
        if (cursor) {
          setBanners((prev) => [...prev, ...data.banners]);
        } else {
          setBanners(data.banners);
        }
        setNextCursor(data.nextCursor);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleLoadMore = () => {
    if (nextCursor) {
      setLoadingMore(true);
      fetchBanners(nextCursor);
    }
  };

  const handleDownload = (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer'; // Added for security
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExternalLink = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col items-center justify-center mb-8 sm:mb-12 text-center space-y-3 sm:space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-white px-4">
          Community Gallery
        </h1>
        <p className="max-w-[700px] text-zinc-400 text-sm sm:text-base md:text-xl px-4">
          Explore banners created by the community. 
          <br className="hidden sm:block" />
          <span className="text-xs sm:text-sm text-zinc-500">(Only banners created after this update are shown)</span>
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 sm:py-20">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 sm:py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30 mx-4">
          <p className="text-zinc-500 text-base sm:text-lg">No banners found yet.</p>
          <Button className="mt-4" variant="outline" onClick={() => router.push('/')}>
            Create the first one
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {banners.map((banner) => (
              <Card key={banner.id} className="overflow-hidden bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all group">
                <div className="relative aspect-[3/1] w-full overflow-hidden bg-zinc-950">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.prompt || "Generated banner"}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized={true} // Bypassing Next.js optimization for simplicity with dynamic URLs
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 sm:gap-3">
                    <IconButton 
                      icon={<Download className="h-4 w-4" />}
                      aria-label="Download banner"
                      variant="ghost" 
                      size="md"
                      className="text-white hover:bg-white/20 bg-black/40"
                      onClick={(e) => handleDownload(e, banner.imageUrl, `banner-${banner.id}.png`)}
                    />
                    <IconButton 
                      icon={<ExternalLink className="h-4 w-4" />}
                      aria-label="Open image"
                      variant="ghost" 
                      size="md"
                      className="text-white hover:bg-white/20 bg-black/40"
                      onClick={(e) => handleExternalLink(e, banner.imageUrl)}
                    />
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-[10px] sm:text-xs font-mono text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded truncate">
                      {banner.style}
                    </span>
                    <span className="text-[10px] sm:text-xs text-zinc-600 flex-shrink-0">
                      {new Date(banner.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2" title={banner.prompt}>
                    {banner.prompt}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {nextCursor && (
            <div className="flex justify-center mt-10 sm:mt-12">
              <Button 
                onClick={handleLoadMore} 
                variant="secondary" 
                disabled={loadingMore}
                className="w-full sm:w-40"
                size="md"
              >
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
