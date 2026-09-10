"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GridIcon,
  UsersIcon,
  BuildingIcon,
  DocumentListIcon,
  ChartIcon,
  SparkleIcon,
  ActivityIcon,
  SettingsIcon,
  LogoutIcon,
} from "@/components/ui/icons";
import { logoutAction } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Обзор", icon: GridIcon },
  { href: "/admin/users", label: "Пользователи", icon: UsersIcon },
  { href: "/admin/businesses", label: "Бизнесы", icon: BuildingIcon },
  { href: "/admin/menus", label: "Меню", icon: DocumentListIcon },
  { href: "/admin/analytics", label: "Аналитика", icon: ChartIcon },
  { href: "/admin/ai", label: "AI / OCR", icon: SparkleIcon },
  { href: "/admin/activity", label: "Активность", icon: ActivityIcon },
  { href: "/admin/settings", label: "Настройки", icon: SettingsIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-60 shrink-0 flex-col bg-[var(--admin-dark)] px-3 py-4 text-white">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--admin-accent)]">
          <span className="h-2 w-2 rounded-[2px] bg-[var(--admin-dark)]" />
        </span>
        <span className="text-sm font-semibold tracking-tight">Digital Menu</span>
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white/70">
          ADMIN
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-[var(--admin-accent)] text-[var(--admin-dark)]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="truncate px-2 text-xs text-white/50">{adminEmail}</p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            <LogoutIcon className="h-4 w-4" />
            Выйти
          </button>
        </form>
      </div>
    </nav>
  );
}
