import { BannerStyle } from "@/components/core/StyleMatrix";

// ------------------------------------------------------------------
// Types & Interfaces
// ------------------------------------------------------------------

export interface StyleRecipe {
  id: string;
  name: string;
  description: string;
  visuals: {
    background: string;
    lighting: string;
    palette: string; // Descriptive color palette
    texture: string;
    composition: string;
  };
  // Specific keywords to inject for high quality
  qualityKeywords: string[];
  // Negative prompt additions specific to this style
  negativeKeywords: string[];
}

export interface StyleMatrixConfig {
  recipe: StyleRecipe;
  chaosMode: boolean; // If true, adds random noise/glitch elements
  mappedKeywords: string[]; // Keywords derived from token name/input
}

// ------------------------------------------------------------------
// 1. Curated Style Recipes (The "Golden Combinations")
// ------------------------------------------------------------------

const QUALITY_PRESETS = {
  digital: ["unreal engine 5 render", "octane render", "8k resolution", "digital art", "trending on artstation", "sharp focus"],
  photo: ["cinematic lighting", "photorealistic", "depth of field", "4k", "award winning photography", "ray tracing"],
  art: ["detailed illustration", "vector art", "crisp lines", "masterpiece", "complex background"],
};

const RECIPES: Record<BannerStyle, StyleRecipe[]> = {
  clean: [
    {
      id: "corporate_glass",
      name: "Corporate Glass",
      description: "Clean, modern, frosted glass and soft gradients",
      visuals: {
        background: "smooth soft gradient background with glassmorphism shapes",
        lighting: "soft diffuse studio lighting",
        palette: "white, silver, and soft accent colors (blue/purple)",
        texture: "frosted glass texture, clean matte finish",
        composition: "minimalist, plenty of whitespace, centered logo",
      },
      qualityKeywords: [...QUALITY_PRESETS.digital, "minimalist", "ui design", "apple aesthetic"],
      negativeKeywords: ["clutter", "noise", "dirt", "grunge"],
    },
    {
      id: "neo_banking",
      name: "Neo Banking",
      description: "Dark mode, sleek lines, fintech aesthetic",
      visuals: {
        background: "deep navy or charcoal background",
        lighting: "subtle rim lighting",
        palette: "dark background with vibrant neon blue or green thin lines",
        texture: "smooth vector curves",
        composition: "geometric patterns, financial charts in background (subtle)",
      },
      qualityKeywords: [...QUALITY_PRESETS.digital, "fintech", "modern", "sleek"],
      negativeKeywords: ["messy", "organic", "rough"],
    },
  ],
  chaotic: [
    {
      id: "market_crash",
      name: "Market Volatility",
      description: "Explosive energy, charts, numbers",
      visuals: {
        background: "chaotic trading chart overlay, japanese candlesticks",
        lighting: "harsh dramatic contrast",
        palette: "red and green neon against black",
        texture: "digital noise, scanlines, glitch effects",
        composition: "explosive, dynamic movement, overwhelming data",
      },
      qualityKeywords: ["glitch art", "datamosh", "cyberpunk", "high energy"],
      negativeKeywords: ["calm", "boring", "empty", "plain"],
    },
    {
      id: "cyber_sludge",
      name: "Cyber Sludge",
      description: "Melting digital textures, acid colors",
      visuals: {
        background: "melting digital liquid, abstract distorted forms",
        lighting: "fluorescent toxic glow",
        palette: "acid green, hot pink, toxic purple",
        texture: "slime, liquid chrome, dripping paint",
        composition: "swirling, disorienting, psychedelic",
      },
      qualityKeywords: ["psychedelic", "melting", "liquid metal", "trippy"],
      negativeKeywords: ["straight lines", "clean", "structured"],
    },
  ],
  meme: [
    {
      id: "pepe_world",
      name: "Feels Good Man",
      description: "Classic internet meme aesthetic, simplistic but funny",
      visuals: {
        background: "simple crudely drawn landscape or solid color",
        lighting: "flat lighting (cartoon style)",
        palette: "forest green, sky blue, brown",
        texture: "ms paint aesthetic, watercolor paper",
        composition: "character close-up, funny scenario",
      },
      qualityKeywords: ["internet meme", "wojak style", "cartoon", "hand drawn"],
      negativeKeywords: ["photorealistic", "3d render", "serious", "dark"],
    },
    {
      id: "deep_fried",
      name: "Deep Fried Degen",
      description: "Oversaturated, glowing eyes, intense",
      visuals: {
        background: "explosion overlay, lens flares",
        lighting: "blown out exposure",
        palette: "high saturation yellow, red, orange",
        texture: "jpeg artifacts, noise, halftone dots",
        composition: "impact font vibes, zoom effect",
      },
      qualityKeywords: ["deep fried meme", "glowing eyes", "lens flare", "intense"],
      negativeKeywords: ["subtle", "soft", "clean"],
    },
  ],
  retro: [
    {
      id: "synth_sunset",
      name: "Outrun Grid",
      description: "Classic 80s synthwave",
      visuals: {
        background: "retro sun with wireframe grid floor, mountains",
        lighting: "neon backlight",
        palette: "sunset orange, violet, magenta, cyan",
        texture: "vhs grain, scanlines, crt distortion",
        composition: "central perspective, 80s retro flyer",
      },
      qualityKeywords: ["synthwave", "retrowave", "80s aesthetic", "retro computer graphics"],
      negativeKeywords: ["modern", "flat", "minimal"],
    },
    {
      id: "pixel_kingdom",
      name: "16-bit RPG",
      description: "SNES era pixel art landscape",
      visuals: {
        background: "pixel art fantasy landscape (castle or dungeon)",
        lighting: "pixel shading",
        palette: "vibrant limited palette (16 colors)",
        texture: "pixelated, dithering",
        composition: "side scroller view or map view",
      },
      qualityKeywords: ["pixel art", "16-bit", "sprite art", "retro game"],
      negativeKeywords: ["blur", "smooth", "vector", "3d"],
    },
  ],
  vaporwave: [
    {
      id: "mall_soft",
      name: "Mallsoft Plaza",
      description: "90s mall aesthetic, pastel statues",
      visuals: {
        background: "marble tile floor, palm trees, greek statues",
        lighting: "soft pastel neon pink and teal",
        palette: "pastel pink, mint green, lavender",
        texture: "clean marble, water reflections",
        composition: "surreal spatial arrangement, floating objects",
      },
      qualityKeywords: ["vaporwave", "seapunk", "surrealism", "bryce 3d"],
      negativeKeywords: ["dark", "gritty", "intense"],
    },
    {
      id: "win95_dream",
      name: "Windows 95 Dream",
      description: "Old UI elements, clouds, computer nostalgia",
      visuals: {
        background: "windows 95 clouds, dialog boxes, error icons",
        lighting: "flat computer screen glow",
        palette: "windows teal, gray, blue",
        texture: "early cgi, digital artifacts",
        composition: "collage of digital elements",
      },
      qualityKeywords: ["webcore", "old internet", "windows 95 aesthetic"],
      negativeKeywords: ["modern ui", "sleek", "high def"],
    },
  ],
  edgy: [
    {
      id: "dark_souls",
      name: "Abyssal Void",
      description: "Dark fantasy, smoke, shadows",
      visuals: {
        background: "dark foggy void, ancient ruins",
        lighting: "dim moody cinematic lighting, volumetric fog",
        palette: "black, dark grey, muted gold or red highlights",
        texture: "smoke, dust, stone",
        composition: "ominous, cinematic wide shot",
      },
      qualityKeywords: ["dark fantasy", "gothic", "horror", "cinematic"],
      negativeKeywords: ["bright", "colorful", "happy", "cute"],
    },
    {
      id: "cyber_assassin",
      name: "Night City Rain",
      description: "Blade Runner aesthetic, rain, neon reflection",
      visuals: {
        background: "futuristic city street at night, rain",
        lighting: "neon signs reflecting in puddles",
        palette: "black, neon blue, crimson red",
        texture: "wet surfaces, rain droplets, chrome",
        composition: "low angle urban shot",
      },
      qualityKeywords: ["cyberpunk city", "wet street", "neon noir", "blade runner style"],
      negativeKeywords: ["daytime", "sunny", "nature"],
    },
  ],
};

// ------------------------------------------------------------------
// 2. Keyword Detection Heuristics
// ------------------------------------------------------------------

const KEYWORD_MAP: Record<string, string> = {
  // Elements
  "fire": "burning, flames, inferno, hot",
  "ice": "frozen, glacial, snow, ice crystals",
  "gold": "golden, shiny metallic, luxury, wealth",
  "space": "cosmic, nebula, stars, galaxy",
  "moon": "lunar surface, crater, night sky, space rocket",
  "sun": "solar, bright, sunshine, lens flare",
  
  // Creatures
  "dog": "furry, cute, puppy, paw prints",
  "cat": "feline, whiskers, sleek, kitty",
  "ape": "jungle, banana, strong, primal",
  "pepe": "green frog skin, bulging eyes",
  "chad": "muscular, strong jawline, confident",
  
  // Vibe
  "safe": "shield, lock, fortress, secure, blue",
  "gem": "diamond, crystal, sparkles, shiny",
  "rich": "money, cash, coins, luxury car",
  "speed": "motion blur, lines, lightning, fast",
};

function detectKeywords(text: string): string[] {
  const result: string[] = [];
  const lower = text.toLowerCase();
  
  Object.entries(KEYWORD_MAP).forEach(([key, value]) => {
    if (lower.includes(key)) {
      result.push(value);
    }
  });

  return result;
}

// ------------------------------------------------------------------
// 3. Logic & Exports
// ------------------------------------------------------------------

export function generateSeed(): number {
  return Math.floor(Math.random() * 999999);
}

// Pick a recipe - deterministic if recipeId or seed provided
function pickRecipe(style: BannerStyle, chaos: number, recipeId?: string, seed?: number): StyleRecipe {
  const options = RECIPES[style] || RECIPES.clean;
  
  // 1. If explicit recipeId is asked for, try to find it
  if (recipeId) {
    const found = options.find(r => r.id === recipeId);
    if (found) return found;
    // Fallback if not found in this style (could happen if style changed but id kept)
  }

  // 2. Deterministic selection based on seed
  if (seed !== undefined) {
    const index = seed % options.length;
    return options[index];
  }

  // 3. Fallback to random (should not happen if seed is passed)
  const index = Math.floor(Math.random() * options.length);
  return options[index];
}

export function generateStyleConfig(style: BannerStyle, chaos: number, contextText?: string, recipeId?: string, seed?: number): StyleMatrixConfig {
  const recipe = pickRecipe(style, chaos, recipeId, seed);
  const mappedKeywords = contextText ? detectKeywords(contextText) : [];
  
  return {
    recipe,
    chaosMode: chaos > 70, // High chaos triggers extra randomness
    mappedKeywords,
  };
}

// THE MAIN PROMPT BUILDER
export function buildPrompt(
  tokenName: string,
  ticker: string,
  tagline: string | undefined,
  creativePrompt: string | undefined, // User override
  style: BannerStyle,
  config: StyleMatrixConfig,
  seed: number
): string {
  // 1. If user HAS a specific creative prompt, prioritize it but still infuse quality
  if (creativePrompt && creativePrompt.trim().length > 10) {
    return `Create a generated image based on this request: "${creativePrompt}".
    
    Style Direction: ${config.recipe.visuals.lighting}, ${config.recipe.visuals.texture}.
    High Quality Keywords: ${config.recipe.qualityKeywords.join(", ")}.
    
    Context: Token "${tokenName}" ($${ticker}).
    
    Technical: 8k resolution, highly detailed, professional composition.`;
  }

  // 2. Otherwise, build the "Smart Recipe" Prompt
  const { recipe, mappedKeywords, chaosMode } = config;
  const { visuals } = recipe;

  // Combine context keywords
  const contextVisuals = mappedKeywords.length > 0 
    ? `Featured elements: ${mappedKeywords.join(", ")}.` 
    : "";

  const chaosInstruction = chaosMode 
    ? "Add dynamic chaotic energy, slight distortion, and intense visual overload." 
    : "Keep the composition balanced and professional.";

  return `Create a stunning cryptocurrency banner art (Aspect Ratio 3:1).
  
  SUBJECT: A mascot or logo representation for a token named "${tokenName}" (${ticker}).
  ${contextVisuals}
  
  ART DIRECTION (${recipe.name}):
  - Background: ${visuals.background}
  - Lighting: ${visuals.lighting}
  - Palette: ${visuals.palette}
  - Texture: ${visuals.texture}
  - Composition: ${visuals.composition}
  
  ATMOSPHERE: ${recipe.description}. ${chaosInstruction}
  
  QUALITY TAGS: ${recipe.qualityKeywords.join(", ")}.
  
  Make it look premium, high-budget, and visually striking. No text needed, just the art.`;
}

// PFP Version
export function buildPfpPrompt(
  tokenName: string,
  ticker: string,
  creativePrompt: string | undefined,
  style: BannerStyle,
  config: StyleMatrixConfig,
  seed: number
): string {
  const { recipe, mappedKeywords } = config;
  
  // Use the same recipe but focus on "Centered Character"
  // Ensure PFPs are not "blown out" - enforce softer lighting and cleaner background
  const lightingOverride = "soft studio lighting, 3-point lighting setup, high key";
  
  return `Create a high-quality cryptocurrency profile picture (Square Aspect Ratio).
  
  SUBJECT: A central mascot character or logo for "${tokenName}" ($${ticker}).
  Faces forward, centered, suitable for a circular crop.
  The subject must be fully visible and clear.
  
  STYLE: ${recipe.name} aesthetic.
  - Colors: ${recipe.visuals.palette}
  - Background: ${recipe.visuals.background} (Keep it simple and uncluttered for PFP)
  - Lighting: ${lightingOverride}
  
  QUALITY: ${recipe.qualityKeywords.join(", ")}, close-up shot, detailed face/icon, sharp focus, 4k.
  NEGATIVE: distorted, blown out, overexposed, cluttered, messy, text, watermark, blurry.`;
}

export function getStylePromptAddition(style: BannerStyle): string {
  // Deprecated mostly, but good for fallback
  return `Style: ${style}. Make it professional.`;
}
