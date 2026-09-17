import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";
import { getDailyStats, getPeriodComparison } from "@/lib/analytics";
import { AnalyticsChart } from "@/components/business/analytics-chart";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const RANGE_OPTIONS = [
  { value: 7, label: "7 дней" },
  { value: 30, label: "30 дней" },
  { value: 90, label: "90 дней" },
];

function formatDelta(pct: number | null) {
  if (pct === null) return null;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

export default async function BusinessAnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { id } = await params;
  const { range } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await db.business.findUnique({ where: { id } });
  if (!business) notFound();
  if (business.ownerId !== session.user.id) notFound();

  const days = RANGE_OPTIONS.some((o) => o.value === Number(range)) ? Number(range) : 30;

  const storage = getStorageAdapter();
  const logoDisplayUrl = business.logoUrl
    ? `${storage.getUrl(business.logoUrl)}?v=${business.updatedAt.getTime()}`
    : null;

  const [dailyStats, comparison] = await Promise.all([
    getDailyStats(business.id, days),
    getPeriodComparison(business.id, days),
  ]);

  const basePath = `/dashboard/business/${business.id}/analytics`;
  const viewsDelta = formatDelta(comparison.viewsDeltaPct);
  const scansDelta = formatDelta(comparison.scansDeltaPct);

  return (
    <DashboardShell
      userEmail={session.user.email ?? ""}
      business={{ id: business.id, name: business.name, slug: business.slug, logoUrl: logoDisplayUrl }}
    >
      <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">Аналитика</h1>
          <div className="flex gap-1 rounded-lg border border-[var(--color-line)] p-0.5">
            {RANGE_OPTIONS.map((option) => (
              <Link
                key={option.value}
                href={`${basePath}?range=${option.value}`}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  days === option.value
                    ? "bg-[var(--color-ink)] text-white"
                    : "text-[var(--color-subtle)] hover:text-[var(--color-ink)]"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <p className="text-xs text-[var(--color-subtle)]">Просмотры меню</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">{comparison.views}</p>
              {viewsDelta && (
                <span
                  className={`text-xs font-semibold ${comparison.viewsDeltaPct! >= 0 ? "text-[var(--color-accent-strong)]" : "text-red-600"}`}
                >
                  {viewsDelta}
                </span>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
            <p className="text-xs text-[var(--color-subtle)]">QR-сканирования</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">{comparison.scans}</p>
              {scansDelta && (
                <span
                  className={`text-xs font-semibold ${comparison.scansDeltaPct! >= 0 ? "text-[var(--color-accent-strong)]" : "text-red-600"}`}
                >
                  {scansDelta}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <AnalyticsChart stats={dailyStats} />
        </div>
      </div>
    </DashboardShell>
  );
}
