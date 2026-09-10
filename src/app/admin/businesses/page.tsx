import Link from "next/link";
import { getBusinessesList, type BusinessStatusFilter } from "@/lib/admin/businesses";
import { getStorageAdapter } from "@/lib/storage";
import { StatusBadge } from "@/components/admin/status-badge";
import { SearchInput } from "@/components/admin/search-input";
import { FilterPills } from "@/components/admin/filter-pills";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { formatNumber, formatRelativeTime } from "@/lib/admin/format";
import { BuildingIcon } from "@/components/ui/icons";

const STATUS_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "published", label: "Опубликовано" },
  { value: "draft", label: "Черновик" },
];

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status: statusParam, page: pageParam } = await searchParams;
  const status: BusinessStatusFilter =
    statusParam === "published" || statusParam === "draft" ? statusParam : "all";
  const page = Math.max(1, Number(pageParam) || 1);
  const { businesses, total, totalPages } = await getBusinessesList({ q, status, page });
  const storage = getStorageAdapter();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-ink)]">Бизнесы</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">Всего: {total}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          action="/admin/businesses"
          defaultValue={q}
          placeholder="Поиск по названию, slug или email владельца…"
          hiddenFields={{ status: status !== "all" ? status : undefined }}
        />
        <FilterPills options={STATUS_OPTIONS} active={status} basePath="/admin/businesses" searchParams={{ q }} />
      </div>

      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
        {businesses.length === 0 ? (
          <EmptyState
            icon={BuildingIcon}
            title={q ? "Ничего не найдено" : "Пока нет бизнесов"}
            description={q ? `По запросу «${q}» ничего не найдено.` : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--admin-muted)]">
                  <th className="pb-2 font-medium">Бизнес</th>
                  <th className="pb-2 font-medium">Владелец</th>
                  <th className="pb-2 font-medium">Slug</th>
                  <th className="pb-2 font-medium">Статус</th>
                  <th className="pb-2 font-medium">Позиций</th>
                  <th className="pb-2 font-medium">Просмотры</th>
                  <th className="pb-2 font-medium">QR</th>
                  <th className="pb-2 font-medium">Создан</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {businesses.map((business) => (
                  <tr key={business.id}>
                    <td className="py-2.5 pr-3">
                      <Link href={`/admin/businesses/${business.id}`} className="flex items-center gap-2.5">
                        {business.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- local upload path, not worth next/image config for an admin panel
                          <img
                            src={storage.getUrl(business.logoUrl)}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--admin-bg)] text-[var(--admin-muted)]">
                            <BuildingIcon className="h-4 w-4" />
                          </span>
                        )}
                        <span className="font-medium text-[var(--admin-ink)] hover:underline">{business.name}</span>
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3 text-[var(--admin-muted)]">{business.ownerEmail}</td>
                    <td className="py-2.5 pr-3 font-mono text-xs text-[var(--admin-muted)]">{business.slug}</td>
                    <td className="py-2.5 pr-3">
                      {business.published ? (
                        <StatusBadge label="Опубликовано" variant="success" />
                      ) : (
                        <StatusBadge label="Черновик" variant="neutral" />
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-[var(--admin-ink)]">{business.itemCount}</td>
                    <td className="py-2.5 pr-3 text-[var(--admin-ink)]">{formatNumber(business.views)}</td>
                    <td className="py-2.5 pr-3 text-[var(--admin-ink)]">{formatNumber(business.scans)}</td>
                    <td className="py-2.5 whitespace-nowrap text-[var(--admin-muted)]">
                      {formatRelativeTime(business.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          basePath="/admin/businesses"
          searchParams={{ q, status: status !== "all" ? status : undefined }}
        />
      </div>
    </div>
  );
}
