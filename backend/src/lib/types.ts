import { BannerStyle } from "@/components/core/StyleMatrix";

// API Request/Response types

export type OutputType = "banner" | "pfp";

export interface GenerateRequest {
  tokenName: string;
  ticker?: string;
  tagline?: string;
  creativePrompt?: string; // User's creative direction for AI
  style: BannerStyle;
  chaosLevel: number;
  imageBase64: string; // Base64 encoded token art (used as inspiration)
  variantCount?: number; // Number of variants to generate (1-5)
  outputType?: OutputType; // "banner" (1500x500) or "pfp" (1000x1000)
  generateCompanion?: boolean; // If true, generates the other type as well
  recipeId?: string; // Optional: Force a specific style recipe (e.g. "corporate_glass")
}

export interface GenerateResponse {
  success: boolean;
  banners?: GeneratedBanner[];
  error?: string;
  jobId?: string;
}

export interface GeneratedBanner {
  id: string;
  imageUrl: string; // URL or base64 of generated banner
  seed: number;
  prompt: string;
  style: BannerStyle;
  outputType: OutputType;
  recipeId?: string;
}

// Job status for async generation
export interface JobStatus {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  banners?: GeneratedBanner[];
  error?: string;
}

// Banana AI specific types
export interface BananaAIRequest {
  prompt: string;
  negative_prompt?: string;
  image?: string; // Base64 input image
  width: number;
  height: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
}

export interface BananaAIResponse {
  id: string;
  message: string;
  created: number;
  apiVersion: string;
  modelOutputs: Array<{
    image?: string; // Base64 output
    seed?: number;
  }>;
}
