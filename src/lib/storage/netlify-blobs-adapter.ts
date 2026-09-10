import { getStore } from "@netlify/blobs";
import type { StorageAdapter } from "./types";

// One persistent (site-wide, not per-deploy) store for every uploaded file —
// menu photos, logos, generated QR codes. Files are served back through our
// own /blob/[...key] route (see that route for why: Blobs has no public URL
// of its own).
const STORE_NAME = "digital-menu-uploads";

export class NetlifyBlobsAdapter implements StorageAdapter {
  private store() {
    return getStore(STORE_NAME);
  }

  async put(key: string, data: Buffer, contentType: string): Promise<string> {
    // BlobInput wants a real ArrayBuffer — Buffer is a view (possibly into a
    // larger pooled/shared ArrayBuffer), so slice out exactly its own bytes.
    const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    await this.store().set(key, arrayBuffer as ArrayBuffer, { metadata: { contentType } });
    return key;
  }

  async get(key: string): Promise<Buffer> {
    const data = await this.store().get(key, { type: "arrayBuffer" });
    if (!data) throw new Error(`Blob not found: ${key}`);
    return Buffer.from(data);
  }

  getUrl(key: string): string {
    return `/blob/${key.split("/").map(encodeURIComponent).join("/")}`;
  }

  async delete(key: string): Promise<void> {
    await this.store().delete(key);
  }
}
