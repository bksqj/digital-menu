import sharp from "sharp";
import type { StorageAdapter } from "@/lib/storage";
import type { PhotoRegion } from "@/lib/validation/menu";

const MAX_DIMENSION = 480;
const JPEG_QUALITY = 82;
// Below this the crop is almost certainly a bad bounding box (a sliver, or
// the model mistaking a stray mark for a photo) rather than a real dish
// photo — skip it instead of storing something useless.
const MIN_FRACTION = 0.02;

/**
 * Crops the region the OCR provider flagged as a dish photo out of the
 * original source image, resizes it down, and stores it under its own key.
 * Returns the storage key, or null if the region was unusable (out of
 * range, degenerate, or the crop itself failed) — callers should treat a
 * null return as "no photo for this item", not an error.
 */
export async function extractItemPhoto(
  storage: StorageAdapter,
  sourceBytes: Buffer,
  region: PhotoRegion,
  itemId: string,
): Promise<string | null> {
  if (region.width < MIN_FRACTION || region.height < MIN_FRACTION) return null;

  try {
    const image = sharp(sourceBytes);
    const metadata = await image.metadata();
    const { width, height } = metadata;
    if (!width || !height) return null;

    const left = Math.max(0, Math.min(width - 1, Math.round(region.x * width)));
    const top = Math.max(0, Math.min(height - 1, Math.round(region.y * height)));
    const cropWidth = Math.max(1, Math.min(width - left, Math.round(region.width * width)));
    const cropHeight = Math.max(1, Math.min(height - top, Math.round(region.height * height)));

    const cropped = await sharp(sourceBytes)
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    const key = `items/${itemId}.jpg`;
    await storage.put(key, cropped, "image/jpeg");
    return key;
  } catch {
    // A bad crop rect (sharp throws on out-of-bounds extract, corrupt
    // source, etc.) just means no photo for this item — never fail the
    // whole upload over a cosmetic extra.
    return null;
  }
}
