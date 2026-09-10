import type { StorageAdapter } from "./types";
import { LocalDiskAdapter } from "./local-adapter";
import { NetlifyBlobsAdapter } from "./netlify-blobs-adapter";

/**
 * Same swap-by-env-flag pattern as lib/ocr. `NETLIFY` is only set at Netlify
 * *build* time, not inside the deployed function at request time — `SITE_ID`
 * is the one Netlify actually injects into the running function, so that's
 * the real signal. Local dev sets neither, so it keeps writing to
 * public/uploads with zero config.
 */
export function getStorageAdapter(): StorageAdapter {
  return process.env.SITE_ID ? new NetlifyBlobsAdapter() : new LocalDiskAdapter();
}

export type { StorageAdapter } from "./types";
