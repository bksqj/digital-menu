"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be blocked (permissions, non-HTTPS) — the URL is
      // already shown as plain text right above this button as a fallback.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-sm font-medium text-[var(--color-ink)] underline"
    >
      {copied ? "Скопировано!" : "Скопировать ссылку"}
    </button>
  );
}
