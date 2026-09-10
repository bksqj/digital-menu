"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, UploadIcon, PencilIcon, LinkQrIcon, LogoutIcon, BuildingIcon } from "@/components/ui/icons";
import { logoutAction } from "@/lib/actions/auth";

type ActiveBusiness = { id: string; name: string; slug: string; logoUrl: string | null };

export function DashboardSidebar({
  userEmail,
  business,
}: {
  userEmail: string;
  business: ActiveBusiness | null;
}) {
  const pathname = usePathname();

  const navItems = business
    ? [
        { href: `/dashboard/business/${business.id}`, label: "Обзор", icon: GridIcon },
        { href: `/dashboard/business/${business.id}/menu`, label: "Загрузить меню", icon: UploadIcon },
        { href: `/dashboard/business/${business.id}/menu/editor`, label: "Редактор меню", icon: PencilIcon },
        { href: `/dashboard/business/${business.id}/qr`, label: "QR-код", icon: LinkQrIcon },
      ]
    : [];

  return (
    <nav className="flex h-full w-60 shrink-0 flex-col border-r border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-4">
      <Link href="/dashboard" className="mb-5 flex items-center gap-2.5 px-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-ink)]">
          <span className="h-2 w-2 rounded-[2px] bg-[var(--color-accent)]" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">Digital Menu</span>
      </Link>

      {business ? (
        <>
          <Link
            href="/dashboard"
            className="mb-3 px-2 text-xs font-medium text-[var(--color-subtle)] hover:text-[var(--color-ink)]"
          >
            ← Мои бизнесы
          </Link>
          <div className="mb-4 flex items-center gap-2.5 rounded-lg bg-[var(--color-canvas)] px-2.5 py-2">
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local upload path, not worth next/image config
              <img src={business.logoUrl} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]">
                <BuildingIcon className="h-3.5 w-3.5" />
              </span>
            )}
            <span className="min-w-0 truncate text-sm font-semibold text-[var(--color-ink)]">{business.name}</span>
          </div>

          <div className="flex flex-1 flex-col gap-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                      : "text-[var(--color-subtle)] hover:bg-[var(--color-canvas)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex-1 px-2 text-sm font-medium text-[var(--color-ink)]">Мои бизнесы</div>
      )}

      <div className="mt-4 border-t border-[var(--color-line)] pt-3">
        <p className="truncate px-2 text-xs text-[var(--color-subtle)]">{userEmail}</p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-subtle)] transition hover:bg-[var(--color-canvas)] hover:text-[var(--color-ink)]"
          >
            <LogoutIcon className="h-4 w-4" />
            Выйти
          </button>
        </form>
      </div>
    </nav>
  );
}
