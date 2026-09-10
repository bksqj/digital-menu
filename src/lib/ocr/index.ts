import type { OcrProvider } from "./types";
import { MockOcrProvider } from "./mock-provider";
import { GeminiOcrProvider } from "./gemini-provider";

/**
 * Single place that decides which OCR/AI backend is live. Falls back to the
 * mock when no key is configured, so local dev never needs one.
 */
export function getOcrProvider(): OcrProvider {
  return process.env.GOOGLE_API_KEY ? new GeminiOcrProvider() : new MockOcrProvider();
}

export type { OcrProvider, OcrInputFile } from "./types";
