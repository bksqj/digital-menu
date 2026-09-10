"use client";

import { useState, type ReactNode } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { MenuIcon, XIcon, SearchIcon } from "@/components/ui/icons";

export function AdminShell({
  adminEmail,
  children,
}: {
  adminEmail: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[var(--admin-bg)] text-[var(--admin-ink)]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AdminSidebar adminEmail={adminEmail} />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative h-full w-60">
            <AdminSidebar adminEmail={adminEmail} />
            <button
              type="button"
              aria-label="Закрыть меню"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 -right-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 sm:px-6">
          <button
            type="button"
            aria-label="Открыть меню"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border)] text-[var(--admin-ink)] md:hidden"
          >
            <MenuIcon className="h-4.5 w-4.5" />
          </button>

          <form action="/admin/users" method="get" className="relative flex-1 max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
            <input
              type="text"
              name="q"
              placeholder="Поиск пользователей по email…"
              className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] py-2 pr-3 pl-9 text-sm text-[var(--admin-ink)] outline-none focus:border-[var(--admin-ink)]"
            />
          </form>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
