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
    <div className="flex items-center gap-4">
      <form ref={formRef} action={uploadLogoAction}>
        <input type="hidden" name="businessId" value={businessId} />
        <label className="group relative block h-16 w-16 cursor-pointer overflow-hidden rounded-full">
          {logoDisplayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local upload path, not worth next/image config for an MVP
            <img
              src={logoDisplayUrl}
              alt={businessName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-xl font-semibold text-neutral-400">
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
        <form action={removeLogoAction}>
          <input type="hidden" name="businessId" value={businessId} />
          <button type="submit" className="text-xs text-red-600 underline">
            Удалить логотип
          </button>
        </form>
      )}
    </div>
  );
}
