// Twitter/X Tweet Fetching Service
// Uses TwitterAPI.io as an alternative to the official X API

export interface TweetAuthor {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
}

export interface TweetMedia {
  type: 'photo' | 'video' | 'animated_gif';
  url: string;
  previewUrl?: string;
}

export interface TweetData {
  id: string;
  text: string;
  author: TweetAuthor;
  media: TweetMedia[];
  createdAt: string;
  url: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
}

export interface FetchTweetResult {
  success: boolean;
  tweet?: TweetData;
  error?: string;
}

/**
 * Parse tweet URL to extract tweet ID
 * Supports: twitter.com, x.com, and various URL formats
 */
export function parseTweetUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check if it's a Twitter/X URL
    if (!hostname.includes('twitter.com') && !hostname.includes('x.com')) {
      return null;
    }
    
    // Extract tweet ID from path
    // Format: /username/status/1234567890
    const pathParts = urlObj.pathname.split('/');
    const statusIndex = pathParts.indexOf('status');
    
    if (statusIndex !== -1 && pathParts[statusIndex + 1]) {
      const tweetId = pathParts[statusIndex + 1].split('?')[0];
      // Validate it looks like a tweet ID (numeric string)
      if (/^\d+$/.test(tweetId)) {
        return tweetId;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch tweet data from TwitterAPI.io
 */
export async function fetchTweet(tweetId: string): Promise<FetchTweetResult> {
  const apiKey = process.env.TWITTERAPI_IO_KEY;
  
  if (!apiKey) {
    return {
      success: false,
      error: 'Twitter API key not configured. Please add TWITTERAPI_IO_KEY to your environment.',
    };
  }
  
  try {
    const response = await fetch(
      `https://api.twitterapi.io/twitter/tweet?id=${tweetId}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Tweet not found. It may have been deleted.' };
      }
      if (response.status === 401) {
        return { success: false, error: 'Invalid API key. Please check your TWITTERAPI_IO_KEY.' };
      }
      if (response.status === 429) {
        return { success: false, error: 'Rate limit exceeded. Please try again later.' };
      }
      return { success: false, error: `Failed to fetch tweet: ${response.statusText}` };
    }
    
    const data = await response.json();
    
    // Transform the response to our TweetData format
    const tweet = transformTweetResponse(data, tweetId);
    
    return { success: true, tweet };
  } catch (error) {
    console.error('Error fetching tweet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tweet',
    };
  }
}

/**
 * Transform TwitterAPI.io response to our TweetData format
 */
function transformTweetResponse(data: Record<string, unknown>, tweetId: string): TweetData {
  // TwitterAPI.io response structure may vary - handle common formats
  const tweetData = (data.tweet || data.data || data) as Record<string, unknown>;
  const userData = (data.user || tweetData.user || tweetData.author) as Record<string, unknown> || {};
  
  // Extract media
  const media: TweetMedia[] = [];
  const extendedEntities = tweetData.extended_entities as Record<string, unknown> | undefined;
  const mediaData = (tweetData.media || extendedEntities?.media || []) as Array<Record<string, unknown>>;
  
  for (const item of mediaData) {
    const type = item.type as string;
    if (type === 'photo' || type === 'video' || type === 'animated_gif') {
      media.push({
        type: type as TweetMedia['type'],
        url: (item.media_url_https || item.url || item.media_url) as string,
        previewUrl: item.preview_image_url as string | undefined,
      });
    }
  }
  
  // Build tweet URL
  const username = (userData.screen_name || userData.username || 'unknown') as string;
  const url = `https://x.com/${username}/status/${tweetId}`;
  
  return {
    id: tweetId,
    text: (tweetData.text || tweetData.full_text || '') as string,
    author: {
      id: (userData.id_str || userData.id || '') as string,
      name: (userData.name || 'Unknown') as string,
      username: username,
      avatar: (userData.profile_image_url_https || userData.profile_image_url || '') as string,
      verified: Boolean(userData.verified || userData.is_blue_verified),
    },
    media,
    createdAt: (tweetData.created_at || new Date().toISOString()) as string,
    url,
    likeCount: (tweetData.favorite_count || tweetData.like_count || 0) as number,
    retweetCount: (tweetData.retweet_count || 0) as number,
    replyCount: (tweetData.reply_count || 0) as number,
  };
}

/**
 * Fetch tweet by URL (convenience function)
 */
export async function fetchTweetByUrl(url: string): Promise<FetchTweetResult> {
  const tweetId = parseTweetUrl(url);
  
  if (!tweetId) {
    return {
      success: false,
      error: 'Invalid tweet URL. Please enter a valid Twitter/X post URL.',
    };
  }
  
  return fetchTweet(tweetId);
}
