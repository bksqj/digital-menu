"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, BuildingIcon, ChartIcon, UserCircleIcon } from "@/components/ui/icons";

type ActiveBusiness = { id: string; name: string; slug: string; logoUrl: string | null };

export function DashboardTabBar({ business }: { business: ActiveBusiness | null }) {
  const pathname = usePathname();

  const businessHome = business ? `/dashboard/business/${business.id}` : "/dashboard";
  const analyticsHref = business ? `/dashboard/business/${business.id}/analytics` : "/dashboard";

  const isAnalytics = pathname.endsWith("/analytics");
  const isProfile = pathname === "/dashboard/profile";
  const isBusinessList = pathname === "/dashboard";
  const isBusinessHome = pathname.startsWith("/dashboard/business/") && !isAnalytics;

  const items = [
    { href: businessHome, label: "Главная", icon: HomeIcon, active: isBusinessHome },
    { href: "/dashboard", label: "Бизнесы", icon: BuildingIcon, active: isBusinessList },
    { href: analyticsHref, label: "Аналитика", icon: ChartIcon, active: isAnalytics },
    { href: "/dashboard/profile", label: "Профиль", icon: UserCircleIcon, active: isProfile },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-[var(--color-line)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
            item.active ? "text-[var(--color-accent-strong)]" : "text-[var(--color-subtle)]"
          }`}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
