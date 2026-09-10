import Link from "next/link";
import { notFound } from "next/navigation";
import { getMenuDetail } from "@/lib/admin/menus";
import { getStorageAdapter } from "@/lib/storage";
import { StatusBadge } from "@/components/admin/status-badge";
import { MobileMenuPreview } from "@/components/admin/mobile-menu-preview";
import { formatRelativeTime } from "@/lib/admin/format";

export default async function AdminMenuDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getMenuDetail(id);
  if (!detail) notFound();

  const { menu, itemCount, needsReviewCount } = detail;
  const storage = getStorageAdapter();
  const logoDisplayUrl = menu.business.logoUrl ? storage.getUrl(menu.business.logoUrl) : null;

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/menus" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-ink)]">
        ← Меню
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight text-[var(--admin-ink)]">{menu.business.name}</h1>
        {menu.status === "PUBLISHED" ? (
          <StatusBadge label="Опубликовано" variant="success" />
        ) : (
          <StatusBadge label="Черновик" variant="neutral" />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/businesses/${menu.business.id}`}
          className="rounded-lg border border-[var(--admin-border)] px-3.5 py-2 text-sm font-medium text-[var(--admin-ink)] transition hover:border-[var(--admin-ink)]"
        >
          Открыть бизнес
        </Link>
        <Link
          href={`/m/${menu.business.slug}`}
          target="_blank"
          className="rounded-lg border border-[var(--admin-border)] px-3.5 py-2 text-sm font-medium text-[var(--admin-ink)] transition hover:border-[var(--admin-ink)]"
        >
          Открыть публичное меню
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Информация</h2>
            <dl className="grid grid-cols-1 gap-x-10 gap-y-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5">
                <dt className="text-[var(--admin-muted)]">Язык</dt>
                <dd className="text-[var(--admin-ink)] uppercase">{menu.language}</dd>
              </div>
              <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5">
                <dt className="text-[var(--admin-muted)]">Категорий</dt>
                <dd className="text-[var(--admin-ink)]">{menu.categories.length}</dd>
              </div>
              <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5">
                <dt className="text-[var(--admin-muted)]">Позиций</dt>
                <dd className="text-[var(--admin-ink)]">{itemCount}</dd>
              </div>
              <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5">
                <dt className="text-[var(--admin-muted)]">Требуют проверки</dt>
                <dd className="text-[var(--admin-ink)]">{needsReviewCount}</dd>
              </div>
              <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5">
                <dt className="text-[var(--admin-muted)]">Создано</dt>
                <dd className="text-[var(--admin-ink)]">{formatRelativeTime(menu.createdAt)}</dd>
              </div>
              <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5">
                <dt className="text-[var(--admin-muted)]">Обновлено</dt>
                <dd className="text-[var(--admin-ink)]">{formatRelativeTime(menu.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Категории и позиции</h2>
            {menu.categories.length === 0 ? (
              <p className="text-sm text-[var(--admin-muted)]">Категорий пока нет.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {menu.categories.map((category) => (
                  <div key={category.id}>
                    <p className="mb-1.5 text-xs font-semibold tracking-wide text-[var(--admin-muted)] uppercase">
                      {category.name} · {category.items.length}
                    </p>
                    <ul className="flex flex-col divide-y divide-[var(--admin-border)]">
                      {category.items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                          <span className="text-[var(--admin-ink)]">
                            {item.name}
                            {item.needsReview && (
                              <span className="ml-1.5 text-xs text-amber-600">проверить</span>
                            )}
                            {!item.available && <span className="ml-1.5 text-xs text-[var(--admin-muted)]">скрыто</span>}
                          </span>
                          {item.price !== null && (
                            <span className="shrink-0 font-medium text-[var(--admin-ink)]">
                              {Number(item.price)} {item.currency}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Предпросмотр</p>
          <MobileMenuPreview
            businessName={menu.business.name}
            logoUrl={logoDisplayUrl}
            categories={menu.categories.map((c) => ({
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
            }))}
          />
        </div>
      </div>
    </div>
  );
}
