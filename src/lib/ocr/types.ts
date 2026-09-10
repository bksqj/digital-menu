import type { MenuParseResult } from "@/lib/validation/menu";

export interface OcrInputFile {
  /** Storage key/path the file was saved under (see lib/storage). */
  key: string;
  mimeType: string;
}

/**
 * Every OCR/AI backend (Claude vision, GPT-4V, Google Vision, ...) implements
 * this one method. Swapping providers means writing a new class here and
 * flipping an env var — nothing in the API routes or UI changes.
 */
export interface OcrProvider {
  parseMenu(files: OcrInputFile[]): Promise<MenuParseResult>;
}
