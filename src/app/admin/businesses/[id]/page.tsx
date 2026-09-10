import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusinessDetail } from "@/lib/admin/businesses";
import { getStorageAdapter } from "@/lib/storage";
import { StatusBadge } from "@/components/admin/status-badge";
import { MobileMenuPreview } from "@/components/admin/mobile-menu-preview";
import { EmptyState } from "@/components/admin/empty-state";
import { formatNumber, formatRelativeTime } from "@/lib/admin/format";
import { SparkleIcon, BuildingIcon } from "@/components/ui/icons";

export default async function AdminBusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await getBusinessDetail(id);
  if (!business) notFound();

  const storage = getStorageAdapter();
  const logoDisplayUrl = business.logoUrl ? storage.getUrl(business.logoUrl) : null;

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/businesses" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-ink)]">
        ← Бизнесы
      </Link>

      <div className="flex flex-wrap items-center gap-4">
        {logoDisplayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local upload path, not worth next/image config for an admin panel
          <img src={logoDisplayUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--admin-bg)] text-[var(--admin-muted)]">
            <BuildingIcon className="h-6 w-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-[var(--admin-ink)]">{business.name}</h1>
          {business.description && <p className="text-sm text-[var(--admin-muted)]">{business.description}</p>}
        </div>
        {business.published ? (
          <StatusBadge label="Опубликовано" variant="success" />
        ) : (
          <StatusBadge label="Черновик" variant="neutral" />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/m/${business.slug}`}
          target="_blank"
          className="rounded-lg border border-[var(--admin-border)] px-3.5 py-2 text-sm font-medium text-[var(--admin-ink)] transition hover:border-[var(--admin-ink)]"
        >
          Открыть публичное меню
        </Link>
        <Link
          href={`/admin/users/${business.owner.id}`}
          className="rounded-lg border border-[var(--admin-border)] px-3.5 py-2 text-sm font-medium text-[var(--admin-ink)] transition hover:border-[var(--admin-ink)]"
        >
          Владелец: {business.owner.email}
        </Link>
        {business.qrCode?.pngPath && (
          <a
            href={storage.getUrl(business.qrCode.pngPath)}
            target="_blank"
            className="rounded-lg border border-[var(--admin-border)] px-3.5 py-2 text-sm font-medium text-[var(--admin-ink)] transition hover:border-[var(--admin-ink)]"
          >
            Открыть QR
          </a>
        )}
      </div>

      <p className="text-sm text-[var(--admin-muted)]">
        Публичная страница: <span className="font-mono text-[var(--admin-ink)]">/m/{business.slug}</span>
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
          <p className="text-2xl font-bold text-[var(--admin-ink)]">{formatNumber(business.views)}</p>
          <p className="text-xs text-[var(--admin-muted)]">Просмотры</p>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
          <p className="text-2xl font-bold text-[var(--admin-ink)]">{formatNumber(business.scans)}</p>
          <p className="text-xs text-[var(--admin-muted)]">QR-сканирования</p>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
          <p className="text-2xl font-bold text-[var(--admin-ink)]">{business.itemCount}</p>
          <p className="text-xs text-[var(--admin-muted)]">Позиций в меню</p>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
          <p className="text-2xl font-bold text-[var(--admin-ink)]">{business.aiProcessedItems}</p>
          <p className="text-xs text-[var(--admin-muted)]">Распознано AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Информация</h2>
            <dl className="grid grid-cols-1 gap-x-10 gap-y-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5">
                <dt className="text-[var(--admin-muted)]">Создан</dt>
                <dd className="text-[var(--admin-ink)]">{formatRelativeTime(business.createdAt)}</dd>
              </div>
              <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5">
                <dt className="text-[var(--admin-muted)]">Статус меню</dt>
                <dd className="text-[var(--admin-ink)]">{business.published ? "Опубликовано" : "Черновик"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Обработка AI</h2>
            {business.uploadJobs.length === 0 ? (
              <EmptyState icon={SparkleIcon} title="Меню ещё не загружали через AI" />
            ) : (
              <ul className="flex flex-col gap-2">
                {business.uploadJobs.map((job) => (
                  <li key={job.id} className="flex items-center justify-between border-b border-[var(--admin-border)] py-2 text-sm last:border-0">
                    <span className="text-[var(--admin-ink)]">{formatRelativeTime(job.createdAt)}</span>
                    {job.status === "DONE" && <StatusBadge label="Успешно" variant="success" />}
                    {job.status === "FAILED" && <StatusBadge label="Ошибка" variant="danger" />}
                    {(job.status === "PENDING" || job.status === "PROCESSING") && (
                      <StatusBadge label="В процессе" variant="warning" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Предпросмотр меню</p>
          <MobileMenuPreview
            businessName={business.name}
            logoUrl={logoDisplayUrl}
            categories={
              business.menu?.categories.map((c) => ({
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
  );
}
