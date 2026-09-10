import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserDetail } from "@/lib/admin/users";
import { getStorageAdapter } from "@/lib/storage";
import { setUserRoleAction, suspendUserAction, restoreUserAction } from "@/lib/actions/admin";
import { UserAvatar } from "@/components/admin/user-avatar";
import { StatusBadge } from "@/components/admin/status-badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { formatNumber, formatRelativeTime } from "@/lib/admin/format";
import { BuildingIcon } from "@/components/ui/icons";

const ERROR_MESSAGES: Record<string, string> = {
  self_role: "Нельзя изменить роль самому себе.",
  self_suspend: "Нельзя заблокировать самого себя.",
};

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await getUserDetail(id);
  if (!user) notFound();

  const storage = getStorageAdapter();

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/users" className="text-sm text-[var(--admin-muted)] hover:text-[var(--admin-ink)]">
        ← Пользователи
      </Link>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {ERROR_MESSAGES[error] ?? "Что-то пошло не так."}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <UserAvatar name={user.name} email={user.email} size={48} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-[var(--admin-ink)]">
            {user.name || user.email}
          </h1>
          <p className="text-sm text-[var(--admin-muted)]">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {user.role === "ADMIN" ? (
            <StatusBadge label="ADMIN" variant="neutral" />
          ) : (
            <StatusBadge label="USER" variant="neutral" />
          )}
          {user.suspended ? (
            <StatusBadge label="Заблокирован" variant="danger" />
          ) : (
            <StatusBadge label="Активен" variant="success" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
          <p className="text-2xl font-bold text-[var(--admin-ink)]">{user.stats.businessCount}</p>
          <p className="text-xs text-[var(--admin-muted)]">Бизнесы</p>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
          <p className="text-2xl font-bold text-[var(--admin-ink)]">{user.stats.menuCount}</p>
          <p className="text-xs text-[var(--admin-muted)]">Меню</p>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
          <p className="text-2xl font-bold text-[var(--admin-ink)]">{formatNumber(user.stats.views)}</p>
          <p className="text-xs text-[var(--admin-muted)]">Просмотры</p>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
          <p className="text-2xl font-bold text-[var(--admin-ink)]">{formatNumber(user.stats.scans)}</p>
          <p className="text-xs text-[var(--admin-muted)]">QR-сканирования</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Информация</h2>
        <dl className="grid grid-cols-1 gap-x-10 gap-y-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5">
            <dt className="text-[var(--admin-muted)]">Зарегистрирован</dt>
            <dd className="text-[var(--admin-ink)]">{formatRelativeTime(user.createdAt)}</dd>
          </div>
          <div className="flex justify-between border-b border-[var(--admin-border)] py-1.5">
            <dt className="text-[var(--admin-muted)]">Был на сайте</dt>
            <dd className="text-[var(--admin-ink)]">
              {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "ещё не заходил"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Управление</h2>
        <div className="flex flex-wrap gap-2">
          <form action={setUserRoleAction}>
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="role" value={user.role === "ADMIN" ? "USER" : "ADMIN"} />
            <button
              type="submit"
              className="rounded-lg border border-[var(--admin-border)] px-3.5 py-2 text-sm font-medium text-[var(--admin-ink)] transition hover:border-[var(--admin-ink)]"
            >
              {user.role === "ADMIN" ? "Убрать права администратора" : "Сделать администратором"}
            </button>
          </form>

          {user.suspended ? (
            <form action={restoreUserAction}>
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                className="rounded-lg bg-[var(--admin-accent)] px-3.5 py-2 text-sm font-semibold text-[var(--admin-dark)] transition hover:brightness-95"
              >
                Восстановить доступ
              </button>
            </form>
          ) : (
            <ConfirmDialog
              trigger={
                <span className="inline-block rounded-lg border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">
                  Заблокировать пользователя
                </span>
              }
              title="Заблокировать пользователя?"
              description={`${user.email} больше не сможет войти в аккаунт, пока вы не восстановите доступ.`}
              confirmLabel="Заблокировать"
              danger
              formAction={suspendUserAction}
              hiddenFields={{ userId: user.id }}
            />
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Бизнесы пользователя</h2>
        {user.businesses.length === 0 ? (
          <EmptyState icon={BuildingIcon} title="Нет бизнесов" />
        ) : (
          <ul className="flex flex-col gap-1">
            {user.businesses.map((business) => (
              <li key={business.id}>
                <Link
                  href={`/admin/businesses/${business.id}`}
                  className="flex items-center gap-3 rounded-lg px-1.5 py-2 transition hover:bg-[var(--admin-bg)]"
                >
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
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--admin-ink)]">
                    {business.name}
                  </span>
                  <span className="shrink-0 text-xs text-[var(--admin-muted)]">
                    {business.menus.some((m) => m.status === "PUBLISHED") ? "Опубликовано" : "Черновик"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
