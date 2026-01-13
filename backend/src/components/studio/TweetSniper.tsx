"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Twitter, 
  Search, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  CheckCircle,
  RefreshCw 
} from "lucide-react";
import { FeatureGate } from "@/components/core/FeatureGate";
import { TweetPreview } from "@/components/studio/TweetPreview";
import { Button } from "@/components/primitives/Button";
import { Input } from "@/components/primitives/Input";
import { FEATURE_THRESHOLDS } from "@/lib/token-config";

// Types for the API response
interface TweetData {
  id: string;
  text: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  media: {
    type: string;
    url: string;
  }[];
  url: string;
  createdAt: string;
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
  };
}

interface TokenSuggestion {
  name: string;
  ticker: string;
  tagline: string;
  creativePrompt: string;
  theme: string;
  confidence: number;
}

interface TweetSniperProps {
  onSuggestionApply: (suggestion: {
    tokenName: string;
    ticker: string;
    tagline: string;
    creativePrompt: string;
    tweetUrl: string;
  }) => void;
}

type SniperState = "idle" | "loading" | "success" | "error";

/**
 * Tweet Sniper component - fetch tweets and generate token suggestions
 * Token-gated: requires 1M $DRIP
 */
export function TweetSniper({ onSuggestionApply }: TweetSniperProps) {
  const [tweetUrl, setTweetUrl] = useState("");
  const [state, setState] = useState<SniperState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [tweet, setTweet] = useState<TweetData | null>(null);
  const [suggestion, setSuggestion] = useState<TokenSuggestion | null>(null);

  const handleAnalyze = async () => {
    if (!tweetUrl.trim()) return;

    setState("loading");
    setError(null);
    setTweet(null);
    setSuggestion(null);

    try {
      const response = await fetch("/api/twitter/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tweetUrl.trim() }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to analyze tweet");
      }

      setTweet(data.tweet);
      setSuggestion(data.suggestion);
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  const handleApplySuggestion = () => {
    if (!suggestion || !tweet) return;

    onSuggestionApply({
      tokenName: suggestion.name,
      ticker: suggestion.ticker,
      tagline: suggestion.tagline,
      creativePrompt: suggestion.creativePrompt,
      tweetUrl: tweet.url,
    });
  };

  const handleReset = () => {
    setTweetUrl("");
    setState("idle");
    setError(null);
    setTweet(null);
    setSuggestion(null);
  };

  return (
    <FeatureGate
      featureName="Tweet Sniper"
      requiredBalance={FEATURE_THRESHOLDS.tweetSniper}
      description="Snipe tweets and auto-generate meme coin banners. Requires 1M $DRIP to unlock."
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
            <Twitter className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Tweet Sniper</h3>
            <p className="text-xs text-gray-500">Paste a tweet URL to generate token assets</p>
          </div>
        </div>

        {/* URL Input */}
        <div className="space-y-3">
          <Input
            label="Tweet URL"
            placeholder="https://x.com/elonmusk/status/..."
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            disabled={state === "loading"}
          />

          <Button
            variant="primary"
            fullWidth
            onClick={handleAnalyze}
            disabled={!tweetUrl.trim() || state === "loading"}
            icon={
              state === "loading" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )
            }
          >
            {state === "loading" ? "Analyzing Tweet..." : "Analyze & Generate"}
          </Button>
        </div>

        {/* Error State */}
        <AnimatePresence>
          {state === "error" && error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-lg bg-red-500/10 border border-red-500/30"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-400 font-medium">Failed to analyze tweet</p>
                  <p className="text-xs text-red-400/70 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success State - Tweet Preview & Suggestion */}
        <AnimatePresence>
          {state === "success" && tweet && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-4"
            >
              {/* Tweet Preview */}
              <TweetPreview tweet={tweet} />

              {/* AI Suggestion */}
              {suggestion && (
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">AI Suggestion</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-mono">
                      {suggestion.confidence}% match
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Token Name</span>
                      <span className="font-medium text-foreground">{suggestion.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Ticker</span>
                      <span className="font-mono text-accent">${suggestion.ticker}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Theme</span>
                      <span className="capitalize text-foreground">{suggestion.theme}</span>
                    </div>
                    {suggestion.tagline && (
                      <div className="pt-2 border-t border-gray-800">
                        <span className="text-gray-400 block mb-1">Tagline</span>
                        <span className="text-foreground italic">"{suggestion.tagline}"</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleReset}
                      icon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Try Another
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleApplySuggestion}
                      icon={<CheckCircle className="w-3.5 h-3.5" />}
                      className="flex-1"
                    >
                      Use This Suggestion
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FeatureGate>
  );
}
