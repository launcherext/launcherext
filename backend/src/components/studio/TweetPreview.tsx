"use client";

import { motion } from "framer-motion";
import { ExternalLink, Heart, Repeat2, MessageCircle, CheckCircle } from "lucide-react";
import Image from "next/image";

interface TweetPreviewProps {
  tweet: {
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
  };
}

/**
 * Tweet preview card - displays fetched tweet data
 */
export function TweetPreview({ tweet }: TweetPreviewProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
            {tweet.author.avatar ? (
              <Image
                src={tweet.author.avatar}
                alt={tweet.author.name}
                fill
                className="object-cover"
                unoptimized // External URLs
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-bold">
                {tweet.author.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground truncate">
                {tweet.author.name}
              </span>
              {tweet.author.verified && (
                <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>@{tweet.author.username}</span>
              <span>·</span>
              <span>{formatDate(tweet.createdAt)}</span>
            </div>
          </div>

          {/* Link to tweet */}
          <a
            href={tweet.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="View on X"
          >
            <ExternalLink className="w-4 h-4 text-gray-500 hover:text-accent" />
          </a>
        </div>
      </div>

      {/* Tweet Text */}
      <div className="px-4 pb-3">
        <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
          {tweet.text}
        </p>
      </div>

      {/* Media Preview */}
      {tweet.media.length > 0 && (
        <div className="px-4 pb-3">
          <div className={`grid gap-2 ${tweet.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {tweet.media.slice(0, 4).map((media, index) => (
              <div
                key={index}
                className="relative aspect-video rounded-lg overflow-hidden bg-gray-800"
              >
                {media.type === 'photo' ? (
                  <Image
                    src={media.url}
                    alt={`Tweet media ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                    {media.type === 'video' ? '🎬 Video' : '🎞️ GIF'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Stats */}
      <div className="px-4 py-3 border-t border-gray-800 flex items-center gap-6">
        <div className="flex items-center gap-1.5 text-gray-500">
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-mono">{formatNumber(tweet.engagement.replies)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <Repeat2 className="w-4 h-4" />
          <span className="text-xs font-mono">{formatNumber(tweet.engagement.retweets)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <Heart className="w-4 h-4" />
          <span className="text-xs font-mono">{formatNumber(tweet.engagement.likes)}</span>
        </div>
      </div>
    </motion.div>
  );
}
