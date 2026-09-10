import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createBusinessAction } from "@/lib/actions/business";
import { SubmitButton } from "@/components/ui/submit-button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const ERROR_MESSAGES: Record<string, string> = {
  name: "Введите название бизнеса.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await auth();
  const businesses = await db.business.findMany({
    where: { ownerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { menus: true },
  });

  return (
    <DashboardShell userEmail={session!.user.email ?? ""}>
      <div className="mx-auto w-full max-w-2xl px-5 py-12 sm:px-6 sm:py-16">
      <h1 className="mb-8 text-lg font-bold tracking-tight text-[var(--color-ink)]">Мои бизнесы</h1>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {ERROR_MESSAGES[error] ?? "Что-то пошло не так."}
        </p>
      )}

      <ul className="mb-8 flex flex-col gap-3">
        {businesses.map((business) => {
          const published = business.menus[0]?.status === "PUBLISHED";
          return (
            <li key={business.id}>
              <Link
                href={`/dashboard/business/${business.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3.5 transition hover:border-[var(--color-ink)]/20 hover:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.1)]"
              >
                <span className="flex items-center gap-2.5 font-medium text-[var(--color-ink)]">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${published ? "bg-[var(--color-accent-strong)]" : "bg-[var(--color-line)]"}`}
                  />
                  {business.name}
                </span>
                <span className="shrink-0 font-mono text-xs text-[var(--color-subtle)]">
                  /m/{business.slug}
                </span>
              </Link>
            </li>
          );
        })}
        {businesses.length === 0 && (
          <li className="rounded-xl border border-dashed border-[var(--color-line)] px-4 py-8 text-center text-sm text-[var(--color-subtle)]">
            Пока нет ни одного бизнеса — создайте первый ниже.
          </li>
        )}
      </ul>

      <form
        action={createBusinessAction}
        className="flex flex-col items-stretch gap-3 border-t border-[var(--color-line)] pt-6 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          name="name"
          required
          placeholder="Название бизнеса, например «Bella Roma»"
          className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-base text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]"
        />
        <SubmitButton
          pendingLabel="Создаём…"
          className="whitespace-nowrap rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-accent-strong)] hover:text-white"
        >
          + Создать
        </SubmitButton>
      </form>
      </div>
    </DashboardShell>
  );
}
