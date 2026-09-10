import Link from "next/link";
import { getMenusList, type MenuStatusFilter } from "@/lib/admin/menus";
import { StatusBadge } from "@/components/admin/status-badge";
import { SearchInput } from "@/components/admin/search-input";
import { FilterPills } from "@/components/admin/filter-pills";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { formatRelativeTime } from "@/lib/admin/format";
import { DocumentListIcon } from "@/components/ui/icons";

const STATUS_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "PUBLISHED", label: "Опубликовано" },
  { value: "DRAFT", label: "Черновик" },
];

export default async function AdminMenusPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status: statusParam, page: pageParam } = await searchParams;
  const status: MenuStatusFilter =
    statusParam === "PUBLISHED" || statusParam === "DRAFT" ? statusParam : "all";
  const page = Math.max(1, Number(pageParam) || 1);
  const { menus, total, totalPages } = await getMenusList({ q, status, page });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-ink)]">Меню</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">Всего: {total}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          action="/admin/menus"
          defaultValue={q}
          placeholder="Поиск по названию бизнеса…"
          hiddenFields={{ status: status !== "all" ? status : undefined }}
        />
        <FilterPills options={STATUS_OPTIONS} active={status} basePath="/admin/menus" searchParams={{ q }} />
      </div>

      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
        {menus.length === 0 ? (
          <EmptyState icon={DocumentListIcon} title={q ? "Ничего не найдено" : "Пока нет меню"} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--admin-muted)]">
                  <th className="pb-2 font-medium">Бизнес</th>
                  <th className="pb-2 font-medium">Язык</th>
                  <th className="pb-2 font-medium">Позиций</th>
                  <th className="pb-2 font-medium">Статус</th>
                  <th className="pb-2 font-medium">Создано</th>
                  <th className="pb-2 font-medium">Обновлено</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {menus.map((menu) => (
                  <tr key={menu.id}>
                    <td className="py-2.5 pr-3">
                      <Link href={`/admin/menus/${menu.id}`} className="font-medium text-[var(--admin-ink)] hover:underline">
                        {menu.business.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3 text-[var(--admin-muted)] uppercase">{menu.language}</td>
                    <td className="py-2.5 pr-3 text-[var(--admin-ink)]">{menu.itemCount}</td>
                    <td className="py-2.5 pr-3">
                      {menu.status === "PUBLISHED" ? (
                        <StatusBadge label="Опубликовано" variant="success" />
                      ) : (
                        <StatusBadge label="Черновик" variant="neutral" />
                      )}
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-[var(--admin-muted)]">
                      {formatRelativeTime(menu.createdAt)}
                    </td>
                    <td className="py-2.5 whitespace-nowrap text-[var(--admin-muted)]">
                      {formatRelativeTime(menu.updatedAt)}
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
          basePath="/admin/menus"
          searchParams={{ q, status: status !== "all" ? status : undefined }}
        />
      </div>
    </div>
  );
}
