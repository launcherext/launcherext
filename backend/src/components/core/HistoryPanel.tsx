"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Trash2, Clock, AlertTriangle } from "lucide-react";
import { SavedBanner } from "@/lib/history-storage";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  banners: SavedBanner[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onSelect?: (banner: SavedBanner) => void;
}

export function HistoryPanel({
  isOpen,
  onClose,
  banners,
  onDelete,
  onClearAll,
  onSelect,
}: HistoryPanelProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleDownload = async (banner: SavedBanner) => {
    try {
      const link = document.createElement("a");
      link.href = banner.imageUrl;
      link.download = `${banner.ticker || banner.tokenName}_banner_${banner.seed}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-obsidian border-l border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-accent-plasma" />
                <h2 className="font-outfit font-bold text-lg text-white">History</h2>
                <span className="px-2 py-0.5 bg-gray-800 rounded text-xs font-mono text-gray-400">
                  {banners.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-concrete-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-concrete-400" />
              </button>
            </div>

            {/* Banner list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {banners.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Clock className="w-12 h-12 text-gray-700 mb-4" />
                  <p className="text-gray-500 font-mono text-sm">No banners yet</p>
                  <p className="text-gray-600 text-xs mt-1">
                    Generated banners will appear here
                  </p>
                </div>
              ) : (
                banners.map((banner, index) => (
                  <motion.div
                    key={banner.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group relative bg-gray-900 rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div
                      className={cn(
                        "aspect-[3/1] w-full bg-black/50 cursor-pointer flex items-center justify-center",
                        onSelect && "hover:opacity-90"
                      )}
                      onClick={() => onSelect?.(banner)}
                    >
                      <img
                        src={banner.thumbnail}
                        alt={banner.tokenName}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-outfit font-bold text-white truncate">
                            {banner.tokenName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-accent-plasma text-xs font-mono">
                              {banner.ticker}
                            </span>
                            <span className="text-gray-600 text-xs">•</span>
                            <span className="text-gray-500 text-xs font-mono uppercase">
                              {banner.style}
                            </span>
                          </div>
                        </div>
                        <span className="text-gray-600 text-xs font-mono">
                          {formatDate(banner.createdAt)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleDownload(banner)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                        <button
                          onClick={() => onDelete(banner.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {banners.length > 0 && (
              <div className="p-4 border-t border-white/10">
                {showClearConfirm ? (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-300 flex-1">Clear all history?</span>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onClearAll();
                        setShowClearConfirm(false);
                      }}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs font-medium transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors font-mono"
                  >
                    Clear History
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
