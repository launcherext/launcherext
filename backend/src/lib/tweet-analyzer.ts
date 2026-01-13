// Tweet Analyzer - AI-powered analysis for meme coin generation
// Uses Gemini to extract themes and suggest token details

import { TweetData } from './twitter-service';

export type TweetTheme = 'political' | 'crypto' | 'technology' | 'meme' | 'news' | 'entertainment' | 'sports' | 'general';

export interface TokenSuggestion {
  name: string;
  ticker: string;
  tagline: string;
  creativePrompt: string;
  theme: TweetTheme;
  confidence: number; // 0-100
}

export interface AnalyzeTweetResult {
  success: boolean;
  suggestion?: TokenSuggestion;
  error?: string;
}

/**
 * Analyze a tweet and generate token suggestions using Gemini
 */
export async function analyzeTweetForToken(tweet: TweetData): Promise<AnalyzeTweetResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return {
      success: false,
      error: 'Gemini API key not configured',
    };
  }
  
  try {
    const prompt = buildAnalysisPrompt(tweet);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }
    
    // Parse the JSON response
    const suggestion = parseGeminiResponse(text);
    
    return { success: true, suggestion };
  } catch (error) {
    console.error('Error analyzing tweet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze tweet',
    };
  }
}

/**
 * Build the analysis prompt for Gemini
 */
function buildAnalysisPrompt(tweet: TweetData): string {
  const hasMedia = tweet.media.length > 0;
  const mediaInfo = hasMedia 
    ? `The tweet includes ${tweet.media.length} ${tweet.media[0].type}(s).` 
    : 'The tweet has no media attachments.';
  
  return `You are a meme coin expert analyzing tweets for viral token potential.

Analyze this tweet and suggest a meme coin that would capitalize on it:

TWEET:
Author: @${tweet.author.username} (${tweet.author.name})${tweet.author.verified ? ' ✓ Verified' : ''}
Text: "${tweet.text}"
${mediaInfo}
Engagement: ${tweet.likeCount.toLocaleString()} likes, ${tweet.retweetCount.toLocaleString()} retweets

Generate a meme coin suggestion that:
1. Has a catchy, memorable name (2-3 words max)
2. Has a short, punchy ticker symbol (3-5 chars, all caps)
3. Has a viral tagline (max 10 words)
4. Would make a great banner/meme

Response MUST be valid JSON in this exact format:
{
  "name": "Token Name Here",
  "ticker": "TICKER",
  "tagline": "Catchy tagline here",
  "creativePrompt": "Detailed description for banner generation: include colors, style, mood, visual elements that would make this token's banner stand out. Reference the tweet's theme.",
  "theme": "political|crypto|technology|meme|news|entertainment|sports|general",
  "confidence": 85
}

Be creative, degen-friendly, and capitalize on current meme culture. The creative prompt should be detailed enough to generate a unique banner.`;
}

/**
 * Parse Gemini's JSON response
 */
function parseGeminiResponse(text: string): TokenSuggestion {
  // Extract JSON from the response (handle markdown code blocks)
  let jsonStr = text;
  
  // Remove markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }
  
  // Try to find JSON object in the text
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    jsonStr = objectMatch[0];
  }
  
  try {
    const parsed = JSON.parse(jsonStr);
    
    // Validate and sanitize the response
    return {
      name: String(parsed.name || 'Meme Token').slice(0, 50),
      ticker: String(parsed.ticker || 'MEME').toUpperCase().slice(0, 5),
      tagline: String(parsed.tagline || 'To the moon!').slice(0, 100),
      creativePrompt: String(parsed.creativePrompt || 'Create a vibrant meme coin banner'),
      theme: validateTheme(parsed.theme),
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 75)),
    };
  } catch {
    // Return default if parsing fails
    console.warn('Failed to parse Gemini response, using defaults');
    return {
      name: 'Viral Token',
      ticker: 'VIRAL',
      tagline: 'Riding the wave',
      creativePrompt: 'Create a dynamic, eye-catching meme coin banner with bold colors and viral energy',
      theme: 'meme',
      confidence: 50,
    };
  }
}

/**
 * Validate and normalize theme
 */
function validateTheme(theme: string): TweetTheme {
  const validThemes: TweetTheme[] = ['political', 'crypto', 'technology', 'meme', 'news', 'entertainment', 'sports', 'general'];
  const normalized = String(theme).toLowerCase() as TweetTheme;
  return validThemes.includes(normalized) ? normalized : 'general';
}
