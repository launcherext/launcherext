// Text Layer types and canvas rendering utilities

export interface TextLayerEffects {
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  outline: boolean;
  outlineColor: string;
  outlineWidth: number;
  glow: boolean;
  glowColor: string;
  glowBlur: number;
}

export interface TextLayer {
  id: string;
  text: string;
  x: number; // 0-1 relative position
  y: number; // 0-1 relative position
  fontSize: number; // in pixels
  fontFamily: string;
  color: string;
  effects: TextLayerEffects;
  rotation: number; // degrees
}

// Available fonts - these should be loaded in the app
export const AVAILABLE_FONTS = [
  { id: "Impact", name: "Impact", description: "Classic meme font" },
  { id: "Arial Black", name: "Arial Black", description: "Bold & readable" },
  { id: "Syne", name: "Syne", description: "App branding font" },
  { id: "monospace", name: "Monospace", description: "Tech/code style" },
  { id: "Georgia", name: "Georgia", description: "Elegant serif" },
  { id: "Verdana", name: "Verdana", description: "Clean & modern" },
] as const;

// Preset colors
export const COLOR_PRESETS = [
  "#FFFFFF", // White
  "#000000", // Black
  "#8B5CF6", // Violet (app accent)
  "#EC4899", // Pink
  "#22D3EE", // Cyan
  "#FF6B00", // Orange
  "#A78BFA", // Light violet
  "#EF4444", // Red
  "#22C55E", // Green
  "#FACC15", // Yellow
];

// Create a default text layer
export function createTextLayer(text: string = "Your Text"): TextLayer {
  return {
    id: `layer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    text,
    x: 0.5, // Center
    y: 0.5,
    fontSize: 64,
    fontFamily: "Impact",
    color: "#FFFFFF",
    effects: {
      shadow: true,
      shadowColor: "#000000",
      shadowBlur: 4,
      outline: true,
      outlineColor: "#000000",
      outlineWidth: 2,
      glow: false,
      glowColor: "#8B5CF6",
      glowBlur: 10,
    },
    rotation: 0,
  };
}

// Render text layers onto a canvas
export function renderTextLayers(
  ctx: CanvasRenderingContext2D,
  layers: TextLayer[],
  canvasWidth: number,
  canvasHeight: number
): void {
  layers.forEach((layer) => {
    renderTextLayer(ctx, layer, canvasWidth, canvasHeight);
  });
}

// Render a single text layer
export function renderTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  canvasWidth: number,
  canvasHeight: number
): void {
  const x = layer.x * canvasWidth;
  const y = layer.y * canvasHeight;

  ctx.save();

  // Move to position and rotate
  ctx.translate(x, y);
  if (layer.rotation !== 0) {
    ctx.rotate((layer.rotation * Math.PI) / 180);
  }

  // Set font
  ctx.font = `bold ${layer.fontSize}px ${layer.fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Glow effect (rendered first, behind everything)
  if (layer.effects.glow) {
    ctx.shadowColor = layer.effects.glowColor;
    ctx.shadowBlur = layer.effects.glowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = layer.effects.glowColor;
    ctx.globalAlpha = 0.5;
    ctx.fillText(layer.text, 0, 0);
    ctx.globalAlpha = 1;
  }

  // Reset shadow for outline/text
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // Outline (stroke)
  if (layer.effects.outline) {
    ctx.strokeStyle = layer.effects.outlineColor;
    ctx.lineWidth = layer.effects.outlineWidth * 2;
    ctx.lineJoin = "round";
    ctx.strokeText(layer.text, 0, 0);
  }

  // Shadow
  if (layer.effects.shadow) {
    ctx.shadowColor = layer.effects.shadowColor;
    ctx.shadowBlur = layer.effects.shadowBlur;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }

  // Main fill
  ctx.fillStyle = layer.color;
  ctx.fillText(layer.text, 0, 0);

  ctx.restore();
}

// Render banner with text layers to a data URL
export async function renderBannerWithText(
  baseImageUrl: string,
  layers: TextLayer[],
  width: number = 1500,
  height: number = 500
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not create canvas context"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Draw base image with "cover" fit
      const scale = Math.max(width / img.width, height / img.height);
      const x = (width / 2) - (img.width / 2) * scale;
      const y = (height / 2) - (img.height / 2) * scale;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Draw text layers
      renderTextLayers(ctx, layers, width, height);

      // Convert to data URL
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      reject(new Error("Failed to load base image"));
    };

    img.src = baseImageUrl;
  });
}

// Get text dimensions for hit testing
export function getTextBounds(
  layer: TextLayer,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number; width: number; height: number } {
  // Create temporary canvas to measure text
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return { x: 0, y: 0, width: 100, height: 50 };
  }

  ctx.font = `bold ${layer.fontSize}px ${layer.fontFamily}`;
  const metrics = ctx.measureText(layer.text);

  const textWidth = metrics.width;
  const textHeight = layer.fontSize * 1.2; // Approximate height

  const x = layer.x * canvasWidth - textWidth / 2;
  const y = layer.y * canvasHeight - textHeight / 2;

  return {
    x,
    y,
    width: textWidth,
    height: textHeight,
  };
}

// Check if a point is inside a text layer
export function isPointInLayer(
  px: number,
  py: number,
  layer: TextLayer,
  canvasWidth: number,
  canvasHeight: number
): boolean {
  const bounds = getTextBounds(layer, canvasWidth, canvasHeight);
  const padding = 10; // Extra hit area

  return (
    px >= bounds.x - padding &&
    px <= bounds.x + bounds.width + padding &&
    py >= bounds.y - padding &&
    py <= bounds.y + bounds.height + padding
  );
}
