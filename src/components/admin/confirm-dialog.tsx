"use client";

import { useState, type ReactNode } from "react";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  danger,
  formAction,
  hiddenFields,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  formAction: (formData: FormData) => void | Promise<void>;
  hiddenFields?: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {trigger}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Закрыть"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 shadow-lg">
            <h2 className="text-base font-semibold text-[var(--admin-ink)]">{title}</h2>
            <p className="mt-1.5 text-sm text-[var(--admin-muted)]">{description}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-[var(--admin-border)] px-3.5 py-2 text-sm font-medium text-[var(--admin-ink)]"
              >
                Отмена
              </button>
              <form action={formAction}>
                {hiddenFields &&
                  Object.entries(hiddenFields).map(([key, value]) => (
                    <input key={key} type="hidden" name={key} value={value} />
                  ))}
                <button
                  type="submit"
                  className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                    danger
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-[var(--admin-accent)] text-[var(--admin-dark)] hover:brightness-95"
                  }`}
                >
                  {confirmLabel}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
