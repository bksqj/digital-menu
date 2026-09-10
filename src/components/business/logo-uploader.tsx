"use client";

import { useRef } from "react";
import { uploadLogoAction, removeLogoAction } from "@/lib/actions/logo";
import { ALLOWED_LOGO_FILE_TYPES } from "@/lib/upload-constraints";

export function LogoUploader({
  businessId,
  logoDisplayUrl,
  businessName,
}: {
  businessId: string;
  logoDisplayUrl: string | null;
  businessName: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="relative shrink-0">
      <form ref={formRef} action={uploadLogoAction}>
        <input type="hidden" name="businessId" value={businessId} />
        <label className="group relative block h-16 w-16 cursor-pointer overflow-hidden rounded-full border border-[var(--color-line)]">
          {logoDisplayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local upload path, not worth next/image config for an MVP
            <img src={logoDisplayUrl} alt={businessName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-accent-soft)] text-xl font-semibold text-[var(--color-accent-strong)]">
              {businessName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-[10px] font-medium text-transparent transition group-hover:bg-black/40 group-hover:text-white">
            Изменить
          </span>
          <input
            type="file"
            name="logo"
            accept={ALLOWED_LOGO_FILE_TYPES.join(",")}
            onChange={() => formRef.current?.requestSubmit()}
            className="hidden"
          />
        </label>
      </form>

      {logoDisplayUrl && (
        <form action={removeLogoAction} className="absolute -top-1 -right-1">
          <input type="hidden" name="businessId" value={businessId} />
          <button
            type="submit"
            title="Удалить логотип"
            aria-label="Удалить логотип"
            className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] text-xs text-[var(--color-subtle)] shadow-sm hover:text-red-600"
          >
            ×
          </button>
        </form>
      )}
    </div>
  );
}
