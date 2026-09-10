import { mkdir, writeFile, unlink, readFile } from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from "./types";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

/**
 * Dev-only adapter: writes straight to /public/uploads so files are served
 * by Next.js's static file handler with zero extra config. Swap for
 * S3Adapter in production — same interface, nothing else changes.
 */
export class LocalDiskAdapter implements StorageAdapter {
  async put(key: string, data: Buffer, _contentType: string): Promise<string> {
    const filePath = path.join(UPLOAD_ROOT, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
    return key;
  }

  async get(key: string): Promise<Buffer> {
    return readFile(path.join(UPLOAD_ROOT, key));
  }

  getUrl(key: string): string {
    return `/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    await unlink(path.join(UPLOAD_ROOT, key)).catch(() => {});
  }
}
