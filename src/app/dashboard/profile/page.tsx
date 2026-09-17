import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateProfileNameAction, requestOwnPasswordResetAction } from "@/lib/actions/profile";
import { logoutAction } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UserCircleIcon } from "@/components/ui/icons";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_name: "Введите имя от 1 до 120 символов.",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; reset_sent?: string; error?: string }>;
}) {
  const { saved, reset_sent: resetSent, error } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true },
  });
  if (!user) redirect("/login");

  return (
    <DashboardShell userEmail={user.email}>
      <div className="mx-auto w-full max-w-lg px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="mb-8 text-2xl font-bold tracking-tight text-[var(--color-ink)]">Профиль</h1>

        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]">
            <UserCircleIcon className="h-8 w-8" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-[var(--color-ink)]">
              {user.name || user.email}
            </p>
            <p className="truncate text-sm text-[var(--color-subtle)]">{user.email}</p>
          </div>
          {user.role === "ADMIN" && (
            <span className="ml-auto shrink-0 rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-medium text-[var(--color-accent-strong)]">
              Администратор
            </span>
          )}
        </div>

        {error && (
          <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {ERROR_MESSAGES[error] ?? "Что-то пошло не так."}
          </p>
        )}
        {saved && (
          <p className="mb-6 rounded-lg bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
            Имя обновлено.
          </p>
        )}
        {resetSent && (
          <p className="mb-6 rounded-lg bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
            Ссылка для смены пароля отправлена на {user.email}.
          </p>
        )}

        <section className="mb-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">Личные данные</h2>
          <form action={updateProfileNameAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              name="name"
              maxLength={120}
              defaultValue={user.name ?? ""}
              placeholder="Ваше имя"
              className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-canvas)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]"
            />
            <SubmitButton
              pendingLabel="Сохраняем…"
              className="whitespace-nowrap rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-accent-strong)] hover:text-white"
            >
              Сохранить
            </SubmitButton>
          </form>
        </section>

        <section className="mb-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
          <h2 className="mb-1.5 text-sm font-semibold text-[var(--color-ink)]">Безопасность</h2>
          <p className="mb-4 text-sm text-[var(--color-subtle)]">
            Мы отправим на {user.email} ссылку для смены пароля.
          </p>
          <form action={requestOwnPasswordResetAction}>
            <SubmitButton
              pendingLabel="Отправляем…"
              className="rounded-full border border-[var(--color-line)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-ink)]"
            >
              Сменить пароль
            </SubmitButton>
          </form>
        </section>

        <form action={logoutAction}>
          <button type="submit" className="text-sm text-red-600 underline">
            Выйти
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}
