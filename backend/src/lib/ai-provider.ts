import { BannerStyle } from "@/components/core/StyleMatrix";
import { generateStyleConfig, buildPrompt, buildPfpPrompt, getStylePromptAddition, generateSeed } from "./styleMatrix";
import { OutputType } from "./types";

// AI Provider abstraction - supports multiple backends
// Configure via environment variables

export type AIProvider = "replicate" | "pollinations" | "banana" | "stability" | "gemini" | "mock";

interface GenerationParams {
  tokenName: string;
  ticker?: string;
  tagline?: string;
  creativePrompt?: string;
  style: BannerStyle;
  chaosLevel: number;
  imageBase64: string;
  seed?: number;
  outputType?: OutputType;
  recipeId?: string;
}

// DexDrip presets for different output types
const DIMENSIONS = {
  banner: { width: 1500, height: 500 },
  pfp: { width: 1000, height: 1000 },
} as const;

interface GenerationResult {
  imageBase64?: string;
  imageUrl?: string;
  seed: number;
  prompt: string;
  recipeId?: string;
}

// Get the configured provider
export function getProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER as AIProvider;
  return provider || "pollinations"; // Default to free Pollinations
}

// Analyze image with Gemini Vision (FREE - text output only)
async function analyzeImageWithGemini(imageBase64?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !imageBase64) {
    return ""; // Skip analysis if no API key or image
  }

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this cryptocurrency token mascot/character image for banner generation.

Describe the CHARACTER in detail (max 80 words):
1. What is it? (frog, dog, cat, person, abstract creature, etc.)
2. Art style (cartoon, anime, pixel art, hand-drawn, 3D render, meme style like Pepe)
3. Colors (list the 2-3 main colors)
4. Distinctive features (hat, glasses, expression, pose, accessories)
5. Mood/energy (cute, aggressive, chill, degen, funny)

Format your response as a detailed character description that could be used to recreate or feature this character in a banner. Be specific about visual details.`,
                },
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini analysis failed:", await response.text());
      return "";
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return text.trim();
  } catch (error) {
    console.error("Image analysis error:", error);
    return "";
  }
}

// Main generation function
export async function generateBanner(params: GenerationParams): Promise<GenerationResult> {
  const provider = getProvider();
  const seed = params.seed || generateSeed();
  const outputType = params.outputType || "banner";
  const dimensions = DIMENSIONS[outputType];
  // Combine text for context analysis
  const contextText = `${params.tokenName} ${params.ticker || ""} ${params.tagline || ""}`;
  const config = generateStyleConfig(params.style, params.chaosLevel, contextText, params.recipeId, seed);

  // Build appropriate prompt based on output type
  const prompt = outputType === "pfp"
    ? buildPfpPrompt(
        params.tokenName,
        params.ticker || "",
        params.creativePrompt,
        params.style,
        config,
        seed
      )
    : buildPrompt(
        params.tokenName,
        params.ticker || "",
        params.tagline,
        params.creativePrompt,
        params.style,
        config,
        seed
      );

  // Only add style hints when user hasn't provided their own creative direction
  // The buildPrompt function now handles this logic internally with the new Recipe system
  const fullPrompt = prompt;

  switch (provider) {
    case "pollinations": {
      // Analyze image to extract colors/style for better text-to-image
      const imageAnalysis = await analyzeImageWithGemini(params.imageBase64);
      const result = await generateWithPollinations(fullPrompt, seed, imageAnalysis, dimensions);
      return { ...result, recipeId: config.recipe.id };
    }
    case "replicate": {
      const result = await generateWithReplicate(fullPrompt, params.imageBase64, seed, dimensions);
      return { ...result, recipeId: config.recipe.id };
    }
    case "banana": {
      const result = await generateWithBanana(fullPrompt, params.imageBase64, seed, dimensions);
      return { ...result, recipeId: config.recipe.id };
    }
    case "stability": {
      const result = await generateWithStability(fullPrompt, params.imageBase64, seed, dimensions);
      return { ...result, recipeId: config.recipe.id };
    }
    case "gemini": {
      const result = await generateWithGemini(fullPrompt, params.imageBase64, seed, dimensions);
      return { ...result, recipeId: config.recipe.id };
    }
    case "mock":
    default: {
      const result = await generateMock(fullPrompt, seed, dimensions);
      return { ...result, recipeId: config.recipe.id };
    }
  }
}

// Pollinations.ai - FREE, no API key required!
async function generateWithPollinations(
  prompt: string,
  seed: number,
  imageAnalysis?: string,
  dimensions: { width: number; height: number } = { width: 1500, height: 500 }
): Promise<GenerationResult> {
  // Pollinations uses URL-based generation
  // Format: https://image.pollinations.ai/prompt/{encoded_prompt}?width=X&height=Y&seed={seed}

  // Enhance prompt with image analysis if available
  let enhancedPrompt = prompt;
  if (imageAnalysis) {
    const focusType = dimensions.width === dimensions.height ? "profile picture" : "banner";
    enhancedPrompt = `${prompt}

THE MASCOT/CHARACTER TO FEATURE:
${imageAnalysis}

IMPORTANT: Generate this exact character as the main focus of the ${focusType}. Match their art style, colors, and features precisely.`;
  }

  const encodedPrompt = encodeURIComponent(enhancedPrompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&seed=${seed}&nologo=true`;

  // Pollinations generates on-the-fly, just return the URL
  // The image will be generated when the URL is accessed
  return {
    imageUrl,
    seed,
    prompt: enhancedPrompt,
  };
}

// Replicate API with img2img support
async function generateWithReplicate(
  prompt: string,
  imageBase64: string,
  seed: number,
  dimensions: { width: number; height: number } = { width: 1500, height: 500 }
): Promise<GenerationResult> {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) {
    throw new Error("REPLICATE_API_TOKEN not configured");
  }

  // Prepare the image data URL
  const imageDataUrl = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/png;base64,${imageBase64}`;

  const outputType = dimensions.width === dimensions.height ? "profile picture" : "banner";

  // Using Stable Diffusion img2img via Replicate
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // stability-ai/sdxl - official Stability model, better safety handling
      version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      input: {
        prompt: `professional cryptocurrency ${outputType} graphic, ${prompt}`,
        image: imageDataUrl,
        negative_prompt: "blurry, low quality, watermark, ugly, deformed, amateur, cluttered",
        width: dimensions.width === 500 ? 512 : 1536,
        height: dimensions.height === 500 ? 512 : 512,
        num_outputs: 1,
        scheduler: "K_EULER",
        num_inference_steps: 25,
        guidance_scale: 7,
        prompt_strength: 0.15,
        seed: seed,
        disable_safety_checker: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate API error: ${error}`);
  }

  const prediction = await response.json();

  // Poll for completion
  let result = prediction;
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds max

  while (result.status !== "succeeded" && result.status !== "failed" && attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 1000));
    attempts++;

    const pollResponse = await fetch(
      `https://api.replicate.com/v1/predictions/${prediction.id}`,
      {
        headers: { Authorization: `Token ${apiKey}` },
      }
    );
    result = await pollResponse.json();
  }

  if (result.status === "failed") {
    throw new Error(`Generation failed: ${result.error || "Unknown error"}`);
  }

  if (result.status !== "succeeded") {
    throw new Error("Generation timed out");
  }

  return {
    imageUrl: result.output?.[0] || result.output,
    seed,
    prompt,
  };
}

// Banana AI (custom model deployment)
async function generateWithBanana(
  prompt: string,
  imageBase64: string,
  seed: number,
  dimensions: { width: number; height: number } = { width: 1500, height: 500 }
): Promise<GenerationResult> {
  const apiKey = process.env.BANANA_API_KEY;
  const modelKey = process.env.BANANA_MODEL_KEY;

  if (!apiKey || !modelKey) {
    throw new Error("BANANA_API_KEY or BANANA_MODEL_KEY not configured");
  }

  const response = await fetch("https://api.banana.dev/start/v4/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apiKey,
      modelKey,
      modelInputs: {
        prompt,
        negative_prompt: "blurry, low quality, distorted text",
        image: imageBase64,
        width: dimensions.width,
        height: dimensions.height,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        seed,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Banana API error: ${await response.text()}`);
  }

  const result = await response.json();

  return {
    imageBase64: result.modelOutputs?.[0]?.image,
    seed,
    prompt,
  };
}

// Stability AI
async function generateWithStability(
  prompt: string,
  imageBase64: string,
  seed: number,
  dimensions: { width: number; height: number } = { width: 1500, height: 500 }
): Promise<GenerationResult> {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    throw new Error("STABILITY_API_KEY not configured");
  }

  // Stability AI requires specific dimension multiples
  const width = dimensions.width === 500 ? 512 : 1536;
  const height = dimensions.height === 500 ? 512 : 512;

  const response = await fetch(
    "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [
          { text: prompt, weight: 1 },
          { text: "blurry, low quality, distorted", weight: -1 },
        ],
        cfg_scale: 7,
        width,
        height,
        steps: 30,
        seed,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Stability API error: ${await response.text()}`);
  }

  const result = await response.json();

  return {
    imageBase64: result.artifacts?.[0]?.base64,
    seed,
    prompt,
  };
}

// Google Gemini (Nano Banana) - Image generation with Gemini 2.5 Flash
async function generateWithGemini(
  prompt: string,
  imageBase64: string,
  seed: number,
  dimensions: { width: number; height: number } = { width: 1500, height: 500 }
): Promise<GenerationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  // Strip data URL prefix if present to get raw base64
  const base64Data = imageBase64 ? imageBase64.replace(/^data:image\/\w+;base64,/, "") : "";
  
  const isPfp = dimensions.width === dimensions.height;

  // Map dimensions to Gemini aspect ratios
  // Banner (1500x500) = 3:1, using 21:9 (2.33:1) - closest available ratio
  // PFP (1000x1000) = 1:1
  const aspectRatio = isPfp ? "1:1" : "21:9";

  // Build the request for Gemini image generation
  const parts: any[] = [
    {
      text: `${prompt}
${base64Data ? "\nReference image is attached - use it as the mascot logo." : ""}
No text, watermarks, or overlays in the output.`,
    },
  ];

  // Add image part ONLY if base64 data exists
  if (base64Data) {
    parts.push({
      inline_data: {
        mime_type: "image/png",
        data: base64Data,
      },
    });
  }

  const requestBody = {
    contents: [
      {
        parts: parts,
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    },
  };

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      // Check for specific modality error
      if (errorText.includes("response modalities")) {
        console.warn("Gemini model doesn't support image generation, falling back to Pollinations...");
        return generateWithPollinations(prompt, seed, undefined, dimensions);
      }
      console.error("Gemini API error response:", errorText);
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const result = await response.json();

    // Check for blocked content or safety filters
    if (result.promptFeedback?.blockReason) {
      console.error("Gemini blocked request:", result.promptFeedback);
      throw new Error(`Content blocked: ${result.promptFeedback.blockReason}`);
    }

    // Extract the image from the response
    const candidates = result.candidates;
    if (!candidates || candidates.length === 0) {
      console.error("Gemini response:", JSON.stringify(result, null, 2));
      throw new Error("No image generated from Gemini - check safety filters");
    }

    // Check if the candidate was blocked
    if (candidates[0].finishReason === "SAFETY") {
      console.error("Gemini safety filter triggered:", candidates[0]);
      throw new Error("Image generation blocked by safety filters");
    }

    // Find the image part in the response (response uses camelCase: inlineData)
    const responseParts = candidates[0].content?.parts || [];
    const imagePart = responseParts.find(
      (part: { inlineData?: { mimeType: string; data: string } }) =>
        part.inlineData?.mimeType?.startsWith("image/")
    );

    if (!imagePart?.inlineData?.data) {
      // Log what we got for debugging
      console.error("Gemini response parts:", JSON.stringify(responseParts, null, 2));
      // Check if we got text instead of image
      const textPart = responseParts.find((part: { text?: string }) => part.text);
      if (textPart) {
        console.error("Gemini returned text instead of image:", textPart.text);
      }
      throw new Error("No image data in Gemini response");
    }

    // Validate base64 data is not empty or too short
    if (imagePart.inlineData.data.length < 100) {
      console.error("Gemini returned invalid image data (too short)");
      throw new Error("Invalid image data from Gemini");
    }

    return {
      imageBase64: imagePart.inlineData.data,
      seed,
      prompt,
    };
  } catch (error) {
    console.warn("Gemini generation failed, falling back to Pollinations:", error);
    return generateWithPollinations(prompt, seed, undefined, dimensions);
  }
}

// Mock generator for development/testing
async function generateMock(
  prompt: string,
  seed: number,
  dimensions: { width: number; height: number } = { width: 1500, height: 500 }
): Promise<GenerationResult> {
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 2000));

  const isPfp = dimensions.width === dimensions.height;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  // Return a placeholder - in real usage, you'd want a real image here
  const svg = `
    <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a2e"/>
          <stop offset="50%" style="stop-color:#16213e"/>
          <stop offset="100%" style="stop-color:#0f0f23"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <text x="${centerX}" y="${centerY - 50}" text-anchor="middle" fill="#dfff4f" font-size="${isPfp ? 48 : 72}" font-family="Arial Black">
        MOCK ${isPfp ? "PFP" : "BANNER"}
      </text>
      <text x="${centerX}" y="${centerY + 20}" text-anchor="middle" fill="#888" font-size="${isPfp ? 18 : 24}" font-family="monospace">
        Seed: ${seed}
      </text>
      <text x="${centerX}" y="${centerY + 60}" text-anchor="middle" fill="#666" font-size="${isPfp ? 12 : 16}" font-family="monospace">
        Set AI_PROVIDER=pollinations for free AI generation
      </text>
      <text x="${centerX}" y="${centerY + 100}" text-anchor="middle" fill="#444" font-size="12" font-family="monospace">
        ${dimensions.width} x ${dimensions.height} px
      </text>
    </svg>
  `;

  const base64 = Buffer.from(svg).toString("base64");

  return {
    imageBase64: base64,
    seed,
    prompt,
  };
}
