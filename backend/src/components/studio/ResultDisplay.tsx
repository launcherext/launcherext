"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { 
  Download, 
  RotateCcw, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Badge } from "@/components/primitives/Badge";

type OutputMode = "banner" | "pfp";

interface GeneratedResult {
  imageUrl: string;
  seed: number;
  prompt?: string;
}

interface ResultDisplayProps {
  result: GeneratedResult;
  tokenName: string;
  ticker: string;
  style: string;
  outputMode: OutputMode;
  onRegenerate: () => void;
  onReset: () => void;
  actionButton?: React.ReactNode;
}

export function ResultDisplay({
  result,
  tokenName,
  ticker,
  style,
  outputMode,
  onRegenerate,
  onReset,
  actionButton,
}: ResultDisplayProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [seedCopied, setSeedCopied] = useState(false);

  const isPfp = outputMode === "pfp";
  const dimensions = isPfp ? { width: 1000, height: 1000 } : { width: 1500, height: 500 };

  const handleDownload = async () => {
    if (!result.imageUrl || downloading) return;
    setDownloading(true);

    try {
      // Create canvas for exact dimensions
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas not supported");

      // Load image
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = result.imageUrl;
      });

      // Fill background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw image with cover fit
      const scale = Math.max(dimensions.width / img.width, dimensions.height / img.height);
      const x = (dimensions.width - img.width * scale) / 2;
      const y = (dimensions.height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Convert to blob and download
      const suffix = isPfp ? "pfp" : "banner";
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${ticker || tokenName}_${suffix}_${result.seed}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
        setDownloading(false);
      }, "image/png");
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(result.imageUrl, "_blank");
      setDownloading(false);
    }
  };

  const handleCopySeed = () => {
    navigator.clipboard.writeText(result.seed.toString());
    setSeedCopied(true);
    setTimeout(() => setSeedCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl"
    >
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-center gap-3 mb-6"
      >
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">
            {isPfp ? "PFP" : "Banner"} Generated!
          </h2>
          <p className="text-sm text-gray-500">
            {tokenName} • {style}
          </p>
        </div>
      </motion.div>

      {/* Image Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={clsx(
          "relative rounded-xl overflow-hidden border border-accent/30 bg-gray-900 group",
          "shadow-[0_0_40px_rgba(0,212,255,0.15)]",
          isPfp ? "max-w-md mx-auto aspect-square" : "w-full aspect-[3/1]"
        )}
      >
        {/* Loading State */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
            <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
            <p className="text-sm text-gray-400">Rendering image...</p>
          </div>
        )}

        {/* Error State */}
        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
            <ImageIcon className="w-8 h-8 text-error mb-3" />
            <p className="text-sm text-error">Failed to load image</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setImageError(false);
                setImageLoaded(false);
              }}
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        )}

        {/* The Image */}
        <motion.img
          key={result.imageUrl}
          src={result.imageUrl}
          alt={`${tokenName} ${isPfp ? "PFP" : "banner"}`}
          className={clsx(
            "w-full h-full object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />

        {/* Hover Overlay */}
        {imageLoaded && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <p className="text-white font-mono text-lg font-bold">
                {dimensions.width} × {dimensions.height}
              </p>
              <p className="text-accent text-sm mt-1">
                {isPfp ? "Profile Picture" : "DexScreener Banner"}
              </p>
            </div>
          </div>
        )}

        {/* Style Badge */}
        <Badge
          variant="accent"
          className="absolute top-3 right-3 z-10"
        >
          {style.toUpperCase()}
        </Badge>
      </motion.div>

      {/* Seed Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 mt-4"
      >
        <span className="text-xs text-gray-500">Seed:</span>
        <button
          onClick={handleCopySeed}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-900 border border-gray-800 hover:border-gray-700 text-xs font-mono text-gray-400 hover:text-foreground transition-colors"
        >
          {seedCopied ? (
            <>
              <Check className="w-3 h-3 text-success" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              {result.seed}
            </>
          )}
        </button>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-3 mt-6"
      >
        <Button
          variant="ghost"
          onClick={onReset}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Start Over
        </Button>

        <Button
          variant="secondary"
          onClick={onRegenerate}
          icon={<Sparkles className="w-4 h-4" />}
        >
          Regenerate
        </Button>

        {actionButton ? (
          actionButton
        ) : (
          <a
            href="https://marketplace.dexscreener.com/product/token-info"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              icon={<ExternalLink className="w-4 h-4" />}
            >
              Upload to Dex
            </Button>
          </a>
        )}

        <Button
          variant="primary"
          onClick={handleDownload}
          disabled={!imageLoaded || downloading}
          loading={downloading}
          icon={<Download className="w-4 h-4" />}
        >
          {downloading ? "Preparing..." : "Download PNG"}
        </Button>
      </motion.div>
    </motion.div>
  );
}
