// API Route: Fetch and analyze tweet
// POST /api/twitter/fetch

import { NextRequest, NextResponse } from 'next/server';
import { fetchTweetByUrl, parseTweetUrl } from '@/lib/twitter-service';
import { analyzeTweetForToken } from '@/lib/tweet-analyzer';

export interface TwitterFetchRequest {
  url: string;
}

export interface TwitterFetchResponse {
  success: boolean;
  tweet?: {
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
  suggestion?: {
    name: string;
    ticker: string;
    tagline: string;
    creativePrompt: string;
    theme: string;
    confidence: number;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<TwitterFetchResponse>> {
  try {
    const body = await request.json() as TwitterFetchRequest;
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Tweet URL is required',
      }, { status: 400 });
    }

    // Validate URL format first
    const tweetId = parseTweetUrl(url);
    if (!tweetId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid tweet URL. Please enter a valid Twitter/X post URL (e.g., https://x.com/username/status/123456789)',
      }, { status: 400 });
    }

    // Fetch the tweet
    const fetchResult = await fetchTweetByUrl(url);
    
    if (!fetchResult.success || !fetchResult.tweet) {
      return NextResponse.json({
        success: false,
        error: fetchResult.error || 'Failed to fetch tweet',
      }, { status: 404 });
    }

    const tweet = fetchResult.tweet;

    // Analyze the tweet for token suggestions
    const analysisResult = await analyzeTweetForToken(tweet);

    // Return combined response
    return NextResponse.json({
      success: true,
      tweet: {
        id: tweet.id,
        text: tweet.text,
        author: {
          name: tweet.author.name,
          username: tweet.author.username,
          avatar: tweet.author.avatar,
          verified: tweet.author.verified,
        },
        media: tweet.media.map(m => ({
          type: m.type,
          url: m.url,
        })),
        url: tweet.url,
        createdAt: tweet.createdAt,
        engagement: {
          likes: tweet.likeCount,
          retweets: tweet.retweetCount,
          replies: tweet.replyCount,
        },
      },
      suggestion: analysisResult.success && analysisResult.suggestion ? {
        name: analysisResult.suggestion.name,
        ticker: analysisResult.suggestion.ticker,
        tagline: analysisResult.suggestion.tagline,
        creativePrompt: analysisResult.suggestion.creativePrompt,
        theme: analysisResult.suggestion.theme,
        confidence: analysisResult.suggestion.confidence,
      } : undefined,
    });
  } catch (error) {
    console.error('Twitter fetch API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
