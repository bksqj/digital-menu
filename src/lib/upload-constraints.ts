// Shared between the upload form (client-side accept/validation hints) and
// the server action (the check that actually matters — never trust the client).
export const ALLOWED_MENU_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_MENU_FILE_SIZE_BYTES = 15 * 1024 * 1024;
export const MAX_MENU_FILES = 6;

export const ALLOWED_LOGO_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_LOGO_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Each upload calls a paid OCR/AI API — cap per-user throughput so a spammy
// or compromised account can't run up the owner's API bill.
export const MAX_UPLOADS_PER_HOUR = 10;
