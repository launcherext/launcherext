"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, ExternalLink, X, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/primitives/Button";
import { Badge } from "@/components/primitives/Badge";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenName: string;
  ticker: string;
  signature: string;
  mintAddress: string;
  bannerUrl?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  tokenName,
  ticker,
  signature,
  mintAddress,
  bannerUrl,
}: SuccessModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(mintAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pumpUrl = `https://pump.fun/${mintAddress}`;
  const solscanUrl = `https://solscan.io/tx/${signature}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed z-50 w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-green-500/10 p-6 text-center border-b border-green-500/20">
              <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Launch Successful!</h2>
              <p className="text-sm text-green-400">
                {tokenName} (${ticker}) is live
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* CA Section */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-mono tracking-wider">
                  Contract Address
                </label>
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-between p-3 bg-gray-950 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors group"
                >
                  <span className="font-mono text-sm text-gray-300 truncate mr-2">
                    {mintAddress}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-900 text-xs text-gray-400 group-hover:text-white transition-colors">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                  </div>
                </button>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={pumpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-accent text-black font-semibold rounded-xl hover:bg-accent-bright transition-colors"
                >
                  <img 
                    src="https://pump.fun/logo.png" 
                    alt="Pump" 
                    className="w-4 h-4 object-contain opacity-80"
                    onError={(e) => (e.currentTarget.style.display = 'none')} 
                  />
                  View on Pump.fun
                </a>
                
                {bannerUrl ? (
                  <button
                    onClick={(e) => {
                        e.preventDefault();
                        // 1. Download image
                        const link = document.createElement('a');
                        link.href = bannerUrl;
                        link.download = `banner-${ticker}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // 2. Open DexScreener
                        window.open('https://marketplace.dexscreener.com/product/token-info', '_blank');
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Banner & Pay Dex
                  </button>
                ) : (
                  <a
                    href={solscanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Transaction
                  </a>
                )}
              </div>
              
              {/* Extra link for transaction if banner is shown, or maybe just list it below? 
                  The layout was grid-cols-2. If we have banner, we displace the transaction link?
                  Let's make sure users can still see transaction.
               */}
               {bannerUrl && (
                  <div className="text-center mt-2">
                    <a href={solscanUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-white underline">
                        View Transaction on Solscan
                    </a>
                  </div>
               )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-950/50 border-t border-gray-800 flex justify-center">
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Close and return to dashboard
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
