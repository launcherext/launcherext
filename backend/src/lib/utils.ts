import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize user input for AI prompt injection prevention.
 * Removes/escapes patterns that could manipulate AI behavior.
 */
export function sanitizePromptInput(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== "string") return "";

  let sanitized = input
    // Truncate to max length
    .slice(0, maxLength)
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, "")
    // Escape potential prompt injection patterns
    .replace(/\b(ignore|disregard|forget|override|system|instruction|prompt|assistant|human|user)(\s+)?(previous|above|all|the|your|my)?/gi, "[$1]")
    // Remove markdown code blocks that could contain instructions
    .replace(/```[\s\S]*?```/g, "[code block removed]")
    // Remove excessive special characters that could be used for obfuscation
    .replace(/[<>{}[\]\\|`~^]/g, "")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();

  return sanitized;
}
