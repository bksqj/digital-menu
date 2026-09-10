import { z } from "zod";

/**
 * Shape that every OcrProvider must return, regardless of which AI/OCR
 * service is behind it. This is the contract between lib/ocr and the rest
 * of the app — nothing downstream should know which provider produced it.
 */
export const parsedItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  currency: z.string().length(3).nullable().optional(),
  // 0..1 — how sure the provider is about this item as a whole. Anything
  // below the app's review threshold gets flagged needsReview in the DB.
  confidence: z.number().min(0).max(1),
});

export const parsedCategorySchema = z.object({
  name: z.string().min(1).max(120),
  items: z.array(parsedItemSchema),
});

export const menuParseResultSchema = z.object({
  categories: z.array(parsedCategorySchema),
  warnings: z.array(z.string()).default([]),
});

export type ParsedItem = z.infer<typeof parsedItemSchema>;
export type ParsedCategory = z.infer<typeof parsedCategorySchema>;
export type MenuParseResult = z.infer<typeof menuParseResultSchema>;

/** Confidence below this is surfaced to the owner as "please check this". */
export const REVIEW_CONFIDENCE_THRESHOLD = 0.75;

// ---- API/form payloads (owner-facing editor) ----

export const createBusinessSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
});

export const upsertItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  currency: z.string().length(3).default("EUR"),
  available: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const upsertCategorySchema = z.object({
  name: z.string().min(1).max(120),
  sortOrder: z.number().int().default(0),
});
