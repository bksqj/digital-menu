export interface StorageAdapter {
  /** Save a file, return the key it was stored under. */
  put(key: string, data: Buffer, contentType: string): Promise<string>;
  /** Read a file's bytes back — needed to hand uploaded images to an OCR/AI provider. */
  get(key: string): Promise<Buffer>;
  /** Public (or signed) URL a browser can load the file from. */
  getUrl(key: string): string;
  delete(key: string): Promise<void>;
}
