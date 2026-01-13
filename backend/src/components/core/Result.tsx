"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, RefreshCw, Check, Copy, Sparkles, ImageIcon, Loader2, CreditCard, Clock, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { type BannerStyle } from "./StyleMatrix";
import { TextEditor } from "./TextEditor";

interface Metadata {
  name: string;
  ticker: string;
  image: string;
}

type OutputType = "banner" | "pfp";

interface ResultProps {
  metadata: Metadata;
  style: BannerStyle;
  generatedImageUrl?: string;
  seed?: number;
  outputType?: OutputType;
  onReset: () => void;
  onRegenerate?: () => void;
  onSaveToHistory?: (
    imageUrl: string,
    tokenName: string,
    ticker: string,
    style: BannerStyle,
    seed: number
  ) => Promise<unknown>;
}

export function Result({ metadata, style, generatedImageUrl, seed, outputType = "banner", onReset, onRegenerate, onSaveToHistory }: ResultProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Dimensions based on output type
  const dimensions = outputType === "pfp"
    ? { width: 1000, height: 1000 }
    : { width: 1500, height: 500 };
  const isPfp = outputType === "pfp";
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [textEditorOpen, setTextEditorOpen] = useState(false);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // The image URL to display/download (edited if available, otherwise original)
  const displayImageUrl = editedImageUrl || generatedImageUrl;

  // Auto-save to history when image loads
  useEffect(() => {
    if (imageLoaded && generatedImageUrl && seed && onSaveToHistory && !savedToHistory) {
      onSaveToHistory(generatedImageUrl, metadata.name, metadata.ticker, style, seed)
        .then(() => setSavedToHistory(true))
        .catch((err) => console.error("Failed to save to history:", err));
    }
  }, [imageLoaded, generatedImageUrl, seed, onSaveToHistory, savedToHistory, metadata.name, metadata.ticker, style]);

  const handleDownload = async () => {
    if (!displayImageUrl || downloading) return;

    setDownloading(true);

    try {
      // Create a canvas to ensure exact dimensions
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not create canvas context");
      }

      // Load the image
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = displayImageUrl;
      });

      // Fill background first
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw image with "cover" fit to fill the entire canvas (matches display behavior)
      // This ensures downloaded images are exactly 1500x500 (or 1000x1000 for PFPs)
      // AI generates 16:9 images which we crop to 3:1 for banners
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
          link.download = `${metadata.ticker || metadata.name}_${suffix}_${seed || Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
        setDownloading(false);
      }, "image/png");
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: direct download
      const suffix = isPfp ? "pfp" : "banner";
      try {
        const link = document.createElement("a");
        link.href = displayImageUrl;
        link.download = `${metadata.ticker || metadata.name}_${suffix}_${seed || Date.now()}.png`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        window.open(displayImageUrl, "_blank");
      }
      setDownloading(false);
    }
  };

  // Handle text editor apply
  const handleTextApply = (newImageUrl: string) => {
    setEditedImageUrl(newImageUrl);
  };

  const handleCopySeed = () => {
    if (seed) {
      navigator.clipboard.writeText(seed.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
      className="w-full"
    >
      {/* Success indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 mb-6 flex-wrap"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-8 h-8 rounded-full bg-accent-plasma/20 flex items-center justify-center"
        >
          <Sparkles className="w-5 h-5 text-accent-plasma" />
        </motion.div>
        <span className="text-accent-plasma font-outfit font-bold">{isPfp ? "PFP Generated!" : "Banner Generated!"}</span>
        {seed && (
          <button
            onClick={handleCopySeed}
            className="ml-2 flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200 text-xs font-mono transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-accent-plasma" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied!" : `Seed: ${seed}`}
          </button>
        )}
        {savedToHistory && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-2 flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-gray-500 text-xs font-mono"
          >
            <Clock className="w-3 h-3" />
            Saved
          </motion.span>
        )}
      </motion.div>

      {/* The Banner/PFP Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "relative rounded-xl overflow-hidden border-2 border-dexgen shadow-[0_0_40px_rgba(0,240,255,0.15)] group bg-gray-900",
          isPfp ? "w-full max-w-[500px] mx-auto aspect-square" : "w-full aspect-[3/1]"
        )}
      >
        {/* Loading state */}
        {!imageLoaded && !imageError && displayImageUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-glass z-10">
            <Loader2 className="w-8 h-8 text-accent-plasma animate-spin mb-3" />
            <p className="text-gray-400 font-mono text-sm">Rendering banner...</p>
            <p className="text-gray-600 font-mono text-xs mt-1">This may take a moment</p>
          </div>
        )}

        {/* Error state */}
        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-concrete-900 z-10">
            <ImageIcon className="w-8 h-8 text-red-400 mb-3" />
            <p className="text-red-400 font-mono text-sm">Failed to load image</p>
            <button
              onClick={() => {
                setImageError(false);
                setImageLoaded(false);
              }}
              className="mt-3 px-4 py-2 rounded-lg text-sm btn-glow text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* The actual image */}
        {displayImageUrl && (
          <motion.img
            key={displayImageUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            src={displayImageUrl}
            alt={`${metadata.name} banner`}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Hover overlay */}
        {imageLoaded && (
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-20">
            <div className="text-center">
              <p className="text-white font-mono text-xl font-bold">{dimensions.width} x {dimensions.height} px</p>
              <p className="text-accent-acid font-mono text-sm mt-1">{isPfp ? "Profile Picture Ready" : "DexScreener Ready"}</p>
            </div>
          </div>
        )}

        {/* Corner badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-accent-acid text-xs font-mono z-10">
          {style.toUpperCase()}
        </div>
      </motion.div>

      {/* Token info recap */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 flex items-center gap-4 p-4 bg-concrete-900/80 rounded-xl border border-concrete-800"
      >
        {metadata.image && (
          <img
            src={metadata.image}
            alt={metadata.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-concrete-700"
          />
        )}
        <div className="flex-1">
          <p className="text-white font-outfit font-bold text-lg">{metadata.name}</p>
          <p className="text-accent-plasma text-sm font-mono">{metadata.ticker}</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-gray-500 text-xs font-mono">STYLE</p>
          <p className="text-gray-300 text-sm font-mono uppercase">{style}</p>
        </div>
      </motion.div>

      {/* Action Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-6 gap-4"
      >
        <div className="text-center sm:text-left">
          <h3 className="text-white font-outfit font-bold text-lg">Ready to Download</h3>
          <p className="text-gray-500 text-xs font-mono">
            PNG format • {isPfp ? "Perfect for social media" : "Optimized for DexScreener"}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onReset}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-lg btn-glow text-concrete-300 hover:text-white text-sm font-medium"
          >
            Reset
          </button>

          <button
            onClick={() => setTextEditorOpen(true)}
            disabled={!imageLoaded}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-lg btn-glow text-gray-300 hover:text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Type className="w-4 h-4" />
            Add Text
          </button>

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-lg btn-glow text-accent-cyan hover:text-white text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              New
            </button>
          )}

          <a
            href="https://marketplace.dexscreener.com/product/token-info"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-lg btn-glow text-accent-cyan hover:text-white text-sm font-medium"
          >
            <CreditCard className="w-4 h-4" />
            Pay Dex!
          </a>

          <motion.button
            onClick={handleDownload}
            disabled={!displayImageUrl || !imageLoaded || downloading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 sm:flex-none px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-outfit disabled:opacity-50 disabled:cursor-not-allowed btn-glow btn-glow-primary"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Text Editor Modal */}
      {generatedImageUrl && (
        <TextEditor
          isOpen={textEditorOpen}
          onClose={() => setTextEditorOpen(false)}
          baseImageUrl={generatedImageUrl}
          onApply={handleTextApply}
        />
      )}

      {/* Hidden canvas for download */}
      <canvas ref={canvasRef} className="hidden" width={dimensions.width} height={dimensions.height} />
    </motion.div>
  );
}
