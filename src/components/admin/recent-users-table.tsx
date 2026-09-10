import Link from "next/link";
import type { RecentUserRow } from "@/lib/admin/overview";
import { formatRelativeTime } from "@/lib/admin/format";
import { StatusBadge } from "./status-badge";
import { EmptyState } from "./empty-state";
import { UsersIcon } from "@/components/ui/icons";

export function RecentUsersTable({ users }: { users: RecentUserRow[] }) {
  if (users.length === 0) {
    return <EmptyState icon={UsersIcon} title="Пока нет пользователей" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="text-left text-xs text-[var(--admin-muted)]">
            <th className="pb-2 font-medium">Пользователь</th>
            <th className="pb-2 font-medium">Бизнесы</th>
            <th className="pb-2 font-medium">Меню</th>
            <th className="pb-2 font-medium">Регистрация</th>
            <th className="pb-2 font-medium">Статус</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--admin-border)]">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-2.5 pr-3">
                <Link href={`/admin/users/${user.id}`} className="font-medium text-[var(--admin-ink)] hover:underline">
                  {user.name || user.email}
                </Link>
                {user.name && <p className="text-xs text-[var(--admin-muted)]">{user.email}</p>}
              </td>
              <td className="py-2.5 pr-3 text-[var(--admin-ink)]">{user.businessCount}</td>
              <td className="py-2.5 pr-3 text-[var(--admin-ink)]">{user.menuCount}</td>
              <td className="py-2.5 pr-3 whitespace-nowrap text-[var(--admin-muted)]">
                {formatRelativeTime(user.createdAt)}
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
  );
}
