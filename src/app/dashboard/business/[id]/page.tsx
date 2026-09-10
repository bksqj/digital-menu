import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";
import { getDailyStats } from "@/lib/analytics";
import { deleteBusinessAction } from "@/lib/actions/business";
import { LogoUploader } from "@/components/business/logo-uploader";
import { AnalyticsChart } from "@/components/business/analytics-chart";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MobileMenuPreview } from "@/components/admin/mobile-menu-preview";
import { LinkIcon } from "@/components/ui/icons";

const ANALYTICS_WINDOW_DAYS = 14;

const LOGO_ERROR_MESSAGES: Record<string, string> = {
  no_logo: "Выберите файл логотипа.",
  bad_logo_type: "Поддерживаются только JPG, PNG и WEBP.",
  logo_too_large: "Файл слишком большой (максимум 5 МБ).",
};

export default async function BusinessOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await db.business.findUnique({
    where: { id },
    include: {
      menus: {
        include: {
          categories: {
            orderBy: { sortOrder: "asc" },
            include: { items: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });
  if (!business) notFound();
  if (business.ownerId !== session.user.id) notFound();

  const menu = business.menus[0];
  const published = menu?.status === "PUBLISHED";
  const storage = getStorageAdapter();
  // Cache-bust: the blob route serves files with a year-long immutable
  // Cache-Control, but a re-uploaded logo overwrites the same storage key —
  // without a version param a browser that cached the old logo would never
  // see the new one.
  const logoDisplayUrl = business.logoUrl
    ? `${storage.getUrl(business.logoUrl)}?v=${business.updatedAt.getTime()}`
    : null;

  const [viewCount, scanCount, dailyStats] = await Promise.all([
    db.analyticsEvent.count({ where: { businessId: business.id, type: "view" } }),
    db.analyticsEvent.count({ where: { businessId: business.id, type: "qr_scan" } }),
    getDailyStats(business.id, ANALYTICS_WINDOW_DAYS),
  ]);

  return (
    <DashboardShell
      userEmail={session.user.email ?? ""}
      business={{ id: business.id, name: business.name, slug: business.slug, logoUrl: logoDisplayUrl }}
    >
      <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-6 sm:py-16">
        <div className="mb-6 flex items-center gap-4">
          <LogoUploader
            businessId={business.id}
            logoDisplayUrl={logoDisplayUrl}
            businessName={business.name}
          />
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <h1 className="truncate text-2xl font-bold tracking-tight text-[var(--color-ink)]">
              {business.name}
            </h1>
            <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-subtle)]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${published ? "bg-[var(--color-accent-strong)]" : "bg-[var(--color-line)]"}`}
              />
              {published ? "Опубликовано" : "Черновик"}
            </span>
          </div>
        </div>

        {error && (
          <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {LOGO_ERROR_MESSAGES[error] ?? "Что-то пошло не так."}
          </p>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <p className="text-sm text-[var(--color-subtle)]">
            Публичная страница:{" "}
            <span className="font-mono text-[var(--color-ink)]">/m/{business.slug}</span>
          </p>
          <Link
            href={`/m/${business.slug}`}
            target="_blank"
            className="ml-auto flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3.5 py-1.5 text-xs font-medium text-[var(--color-ink)] transition hover:border-[var(--color-ink)]"
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Открыть меню
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                <p className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">{viewCount}</p>
                <p className="text-xs text-[var(--color-subtle)]">Просмотры</p>
              </div>
              <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
                <p className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">{scanCount}</p>
                <p className="text-xs text-[var(--color-subtle)]">Сканирования QR</p>
              </div>
            </div>

            <AnalyticsChart stats={dailyStats} />

            <form action={deleteBusinessAction} className="border-t border-[var(--color-line)] pt-6">
              <input type="hidden" name="id" value={business.id} />
              <button type="submit" className="text-sm text-red-600 underline">
                Удалить бизнес
              </button>
            </form>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Превью меню</p>
            <MobileMenuPreview
              businessName={business.name}
              logoUrl={logoDisplayUrl}
              categories={
                menu?.categories.map((c) => ({
                  id: c.id,
                  name: c.name,
                  items: c.items
                    .filter((i) => i.available)
                    .map((i) => ({
                      id: i.id,
                      name: i.name,
                      description: i.description,
                      price: i.price ? Number(i.price) : null,
                      currency: i.currency,
                    })),
                })) ?? []
              }
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
