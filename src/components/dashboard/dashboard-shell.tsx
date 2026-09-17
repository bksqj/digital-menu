"use client";

import { useState, type ReactNode } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTabBar } from "./dashboard-tab-bar";
import { MenuIcon, XIcon } from "@/components/ui/icons";

type ActiveBusiness = { id: string; name: string; slug: string; logoUrl: string | null };

export function DashboardShell({
  userEmail,
  business,
  children,
}: {
  userEmail: string;
  business?: ActiveBusiness | null;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-1 bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <div className="hidden md:block">
        <DashboardSidebar userEmail={userEmail} business={business ?? null} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative h-full w-60">
            <DashboardSidebar userEmail={userEmail} business={business ?? null} />
            <button
              type="button"
              aria-label="Закрыть меню"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 -right-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-[var(--color-ink)]"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="Открыть меню"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-line)] text-[var(--color-ink)]"
          >
            <MenuIcon className="h-4.5 w-4.5" />
          </button>
          <span className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
            {business?.name ?? "Digital Menu"}
          </span>
        </header>

        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </div>

      <DashboardTabBar business={business ?? null} />
    </div>
  );
}
