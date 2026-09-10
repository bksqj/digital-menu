import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-[var(--color-canvas)] px-5 py-16">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-ink)]">
          <span className="h-2 w-2 rounded-[2px] bg-[var(--color-accent)]" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
          Digital Menu
        </span>
      </Link>

      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-8">
        {children}
      </div>
    </main>
  );
}

export const authInputClass =
  "rounded-lg border border-[var(--color-line)] bg-[var(--color-canvas)] px-3.5 py-2.5 text-base text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-ink)]";

export const authPrimaryButtonClass =
  "mt-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-base font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-accent-strong)] hover:text-white";
