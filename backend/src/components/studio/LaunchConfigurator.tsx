"use client";

import { useState, useId } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import {
  Rocket,
  ExternalLink,
  Twitter,
  MessageCircle,
  Globe,
  Image as ImageIcon,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Check,
  Copy,
} from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Input, Textarea } from "@/components/primitives/Input";
import { Badge } from "@/components/primitives/Badge";

interface LaunchConfiguratorProps {
  // Pre-filled from generation
  tokenName: string;
  ticker: string;
  description?: string;
  pfpImageUrl?: string;
  bannerImageUrl?: string;
  twitterUrl?: string; // From X sniper method
  creativePrompt?: string;
  style?: string;
  recipeId?: string;
  imageBase64?: string;
  
  // Callbacks
  onLaunch: (config: LaunchConfig) => void;
  onBack: () => void;
}

export interface LaunchConfig {
  name: string;
  symbol: string;
  description: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  pfpImageBase64?: string;
  bannerImageBase64?: string;
  devBuyAmount: number;
  mayhemMode: boolean;
  pfpImageUrl?: string;
  bannerImageUrl?: string;
}

export function LaunchConfigurator({
  tokenName,
  ticker,
  description = "",
  pfpImageUrl,
  bannerImageUrl,
  twitterUrl,
  creativePrompt,
  style,
  recipeId,
  imageBase64,
  onLaunch,
  onBack,
}: LaunchConfiguratorProps) {
  const [activePfpUrl, setActivePfpUrl] = useState(pfpImageUrl);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [config, setConfig] = useState<LaunchConfig>({
    name: tokenName,
    symbol: ticker.replace('$', ''),
    description: description,
    twitter: twitterUrl || "",
    telegram: "",
    website: "",
    devBuyAmount: 0.1,
    mayhemMode: false,
  });
  
  const [showSocialLinks, setShowSocialLinks] = useState(!!twitterUrl);
  const [showAddBanner, setShowAddBanner] = useState(!!bannerImageUrl);
  const [launching, setLaunching] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update config when activePfpUrl changes
  // We do this in an effect or when setting activePfpUrl, but for LaunchConfig it's cleaner to sync on launch or just keep it in sync.
  // Actually, config.pfpImageBase64 is expecting base64, but we have URL.
  // The original component didn't seem to set pfpImageBase64 in the state init.
  // Let's assume onLaunch handles the URL or we update it here.
  // The original code:
  // const handleLaunch = async () => { ... onLaunch(config); ... }
  // config doesn't have pfpImageUrl, only pfpImageBase64.
  // But the prop passed to LaunchConfigurator is pfpImageUrl.
  // We should add pfpImageUrl to LaunchConfig or handle it.
  // The LaunchConfig interface has pfpImageBase64?: string.
  // If we regenerate, we get a URL.
  // Let's rely on onLaunch to handle it, but we should pass the *current* image.
  // I will add pfpImageUrl to LaunchConfig interface first, or just pass it separately.
  // For now, I'll update the LaunchConfig locally to include the new URL so it's passed back.

  const handleRegeneratePfp = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenName: config.name,
          ticker: config.symbol,
          tagline: config.description,
          creativePrompt: creativePrompt || "",
          style: style || "clean", // default fallback
          chaosLevel: 50, // default
          outputType: "pfp",
          generateCompanion: false,

          recipeId: recipeId,
          imageBase64: imageBase64,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.banners?.length > 0) {
        const newUrl = data.banners[0].imageUrl;
        setActivePfpUrl(newUrl);
        // implicit: the parent onLaunch will likely need this new URL. 
        // We'll update our local config state to include it if we add a field, 
        // or we rely on the parent to take `activePfpUrl` if we passed it back?
        // Wait, onLaunch takes `LaunchConfig`. I need to put the image into LaunchConfig.
        // The interface defines `pfpImageBase64`. It should probably be `pfpImageUrl` or just `pfpImage`.
        // I will act as if I can put it in `pfpImageUrl` (adding it to the interface).
        setConfig(prev => ({ ...prev, pfpImageUrl: newUrl }));
      }
    } catch (err) {
      console.error("Failed to regenerate PFP", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleLaunch = async () => {
    setLaunching(true);
    // Ensure we pass the active image
    const finalConfig = {
      ...config,
      // If we regenerated, we might have a URL in config.pfpImageUrl (if added)
      // or we should ensure we pass the active one.
      pfpImageUrl: activePfpUrl, 
      bannerImageUrl: bannerImageUrl,
    };
    await onLaunch(finalConfig);
    setLaunching(false);
  };

  const handleCopyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
          <Rocket className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Launch Your Token</h1>
          <p className="text-sm text-gray-500">Review and confirm details before launching on pump.fun</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,300px] gap-8">
        {/* Main Form */}
        <div className="space-y-6">
          {/* Coin Details Card */}
          <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">Coin Details</h2>
              <Badge variant="warning" size="sm">Can't be changed after creation</Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Input
                label="Coin Name"
                value={config.name}
                onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Name your coin"
              />
              <Input
                label="Ticker"
                value={config.symbol}
                onChange={(e) => setConfig(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                placeholder="e.g. DOGE"
              />
            </div>

            <Textarea
              label="Description (Optional)"
              value={config.description}
              onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Write a short description"
              rows={3}
            />
          </div>

          {/* Social Links */}
          <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
            <button
              onClick={() => setShowSocialLinks(!showSocialLinks)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-300">Add social links</span>
                <span className="text-xs text-gray-600">(Optional)</span>
              </div>
              {showSocialLinks ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {showSocialLinks && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 space-y-4"
              >
                <Input
                  label="Twitter / X"
                  value={config.twitter}
                  onChange={(e) => setConfig(prev => ({ ...prev, twitter: e.target.value }))}
                  placeholder="https://x.com/..."
                  icon={<Twitter className="w-4 h-4" />}
                />
                {twitterUrl && config.twitter === twitterUrl && (
                  <div className="flex items-center gap-2 text-xs text-accent">
                    <Check className="w-3 h-3" />
                    Pre-filled from X Sniper method
                  </div>
                )}
                <Input
                  label="Telegram"
                  value={config.telegram}
                  onChange={(e) => setConfig(prev => ({ ...prev, telegram: e.target.value }))}
                  placeholder="https://t.me/..."
                  icon={<MessageCircle className="w-4 h-4" />}
                />
                <Input
                  label="Website"
                  value={config.website}
                  onChange={(e) => setConfig(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                  icon={<Globe className="w-4 h-4" />}
                />
              </motion.div>
            )}
          </div>

          {/* Mayhem Mode */}
          <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  config.mayhemMode ? "bg-accent/20" : "bg-gray-800"
                )}>
                  <Zap className={clsx("w-5 h-5", config.mayhemMode ? "text-accent" : "text-gray-500")} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">Mayhem mode</span>
                    <Badge variant="accent" size="sm">New</Badge>
                  </div>
                  <p className="text-xs text-gray-500">Increased price volume.</p>
                </div>
              </div>
              
              <button
                onClick={() => setConfig(prev => ({ ...prev, mayhemMode: !prev.mayhemMode }))}
                className={clsx(
                  "w-12 h-6 rounded-full transition-colors relative",
                  config.mayhemMode ? "bg-accent" : "bg-gray-700"
                )}
              >
                <div className={clsx(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  config.mayhemMode ? "translate-x-7" : "translate-x-1"
                )} />
              </button>
            </div>
            
            <p className="text-xs text-gray-600 mt-3 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Active for 24h, only set at creation. May increase coin supply.
              <a href="#" className="text-accent hover:underline">Learn more</a>
            </p>
          </div>

          {/* Image Upload Section */}
          <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
            <h3 className="text-sm font-medium text-foreground mb-4">Token Image</h3>
            
            {activePfpUrl ? (
              <div className="flex items-start gap-4">
                <img
                  src={activePfpUrl}
                  alt="Token PFP"
                  className="w-24 h-24 rounded-xl object-cover border border-gray-700"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-300 mb-2">Generated PFP ready to use</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="success" size="sm">
                      <Check className="w-3 h-3 mr-1" />
                      1000×1000 px
                    </Badge>
                    <button
                      onClick={() => activePfpUrl && handleCopyImageUrl(activePfpUrl)}
                      className="text-xs text-gray-500 hover:text-foreground flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied!" : "Copy URL"}
                    </button>
                    
                    <button
                      onClick={handleRegeneratePfp}
                      disabled={isRegenerating}
                      className="text-xs text-accent hover:text-accent-bright flex items-center gap-1 ml-2 transition-colors"
                    >
                      <Zap className={clsx("w-3 h-3", isRegenerating && "animate-spin")} />
                      {isRegenerating ? "Regenerating..." : "Generate New"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
                <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No image generated</p>
                <button
                  onClick={handleRegeneratePfp}
                  disabled={isRegenerating}
                  className="text-xs text-accent hover:text-accent-bright flex items-center gap-1 mx-auto mt-2 transition-colors"
                >
                  <Zap className={clsx("w-3 h-3", isRegenerating && "animate-spin")} />
                  {isRegenerating ? "Generating..." : "Generate PFP"}
                </button>
              </div>
            )}

            {/* Add Banner Section */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <button
                onClick={() => setShowAddBanner(!showAddBanner)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-foreground"
              >
                <ImageIcon className="w-4 h-4" />
                Add banner
                <span className="text-xs text-gray-600">(Optional)</span>
                {showAddBanner ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAddBanner && bannerImageUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4"
                >
                  <img
                    src={bannerImageUrl}
                    alt="Token Banner"
                    className="w-full aspect-[3/1] rounded-lg object-cover border border-gray-700"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="success" size="sm">
                      <Check className="w-3 h-3 mr-1" />
                      1500×500 px
                    </Badge>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Dev Buy Amount */}
          <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800">
            <Input
              label="Initial Dev Buy (SOL)"
              type="number"
              step="0.1"
              min="0"
              value={config.devBuyAmount}
              onChange={(e) => setConfig(prev => ({ ...prev, devBuyAmount: parseFloat(e.target.value) || 0 }))}
              hint="Amount of SOL to buy with at launch (optional)"
            />
          </div>

          {/* Warning */}
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-500 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Coin data (social links, banner, etc) can only be added now, and can't be changed or edited after creation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              variant="ghost"
              onClick={onBack}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleLaunch}
              loading={launching}
              disabled={!config.name || !config.symbol}
              icon={<Rocket className="w-4 h-4" />}
              className="flex-1"
            >
              {launching ? "Launching..." : "Launch on pump.fun"}
            </Button>
          </div>

          {/* PumpPortal Attribution */}
          <p className="text-xs text-gray-600 text-center">
            Powered by{" "}
            <a
              href="https://pumpportal.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              PumpPortal
            </a>
          </p>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-4">
          <div className="sticky top-4">
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
              <p className="text-xs text-gray-500 text-center mb-4">
                A preview of how the coin will look
              </p>
              
              {activePfpUrl ? (
                <div className="space-y-4">
                  <img
                    src={activePfpUrl}
                    alt="Preview"
                    className="w-full aspect-square rounded-xl object-cover"
                  />
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{config.name || "Token Name"}</p>
                    <p className="text-sm text-accent">${config.symbol || "TICKER"}</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-square rounded-xl bg-gray-800 flex items-center justify-center">
                  <p className="text-sm text-gray-500">No preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
