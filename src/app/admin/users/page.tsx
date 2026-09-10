import Link from "next/link";
import { getUsersList } from "@/lib/admin/users";
import { UserAvatar } from "@/components/admin/user-avatar";
import { StatusBadge } from "@/components/admin/status-badge";
import { SearchInput } from "@/components/admin/search-input";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { formatRelativeTime } from "@/lib/admin/format";
import { UsersIcon } from "@/components/ui/icons";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { users, total, totalPages } = await getUsersList({ q, page });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-ink)]">Пользователи</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">Всего: {total}</p>
      </div>

      <SearchInput action="/admin/users" defaultValue={q} placeholder="Поиск по email или имени…" />

      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
        {users.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title={q ? "Ничего не найдено" : "Пока нет пользователей"}
            description={q ? `По запросу «${q}» пользователей не найдено.` : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--admin-muted)]">
                  <th className="pb-2 font-medium">Пользователь</th>
                  <th className="pb-2 font-medium">Бизнесы</th>
                  <th className="pb-2 font-medium">Меню</th>
                  <th className="pb-2 font-medium">Регистрация</th>
                  <th className="pb-2 font-medium">Был на сайте</th>
                  <th className="pb-2 font-medium">Роль</th>
                  <th className="pb-2 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-2.5 pr-3">
                      <Link href={`/admin/users/${user.id}`} className="flex items-center gap-2.5">
                        <UserAvatar name={user.name} email={user.email} />
                        <span>
                          <span className="block font-medium text-[var(--admin-ink)] hover:underline">
                            {user.name || user.email}
                          </span>
                          {user.name && <span className="block text-xs text-[var(--admin-muted)]">{user.email}</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3 text-[var(--admin-ink)]">{user.businessCount}</td>
                    <td className="py-2.5 pr-3 text-[var(--admin-ink)]">{user.menuCount}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-[var(--admin-muted)]">
                      {formatRelativeTime(user.createdAt)}
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-[var(--admin-muted)]">
                      {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "—"}
                    </td>
                    <td className="py-2.5 pr-3">
                      {user.role === "ADMIN" ? (
                        <StatusBadge label="ADMIN" variant="neutral" />
                      ) : (
                        <span className="text-[var(--admin-muted)]">USER</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      {user.suspended ? (
                        <StatusBadge label="Заблокирован" variant="danger" />
                      ) : (
                        <StatusBadge label="Активен" variant="success" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} basePath="/admin/users" searchParams={{ q }} />
      </div>
    </div>
  );
}
