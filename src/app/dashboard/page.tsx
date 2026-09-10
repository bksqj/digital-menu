import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createBusinessAction } from "@/lib/actions/business";
import { logoutAction } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

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
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Мои бизнесы</h1>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-neutral-500 underline">
            Выйти
          </button>
        </form>
      </div>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {ERROR_MESSAGES[error] ?? "Что-то пошло не так."}
        </p>
      )}

      <ul className="mb-8 flex flex-col gap-3">
        {businesses.map((business) => (
          <li key={business.id}>
            <Link
              href={`/dashboard/business/${business.id}`}
              className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3.5 transition hover:border-neutral-400"
            >
              <span className="font-medium">{business.name}</span>
              <span className="text-sm text-neutral-500">/m/{business.slug}</span>
            </Link>
          </li>
        ))}
        {businesses.length === 0 && (
          <li className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500">
            Пока нет ни одного бизнеса — создайте первый ниже.
          </li>
        )}
      </ul>

      <form
        action={createBusinessAction}
        className="flex items-center gap-3 border-t border-neutral-200 pt-6"
      >
        <input
          type="text"
          name="name"
          required
          placeholder="Название бизнеса, например «Bella Roma»"
          className="flex-1 rounded-lg border border-neutral-300 px-3.5 py-2.5 text-base outline-none focus:border-neutral-900"
        />
        <SubmitButton
          pendingLabel="Создаём…"
          className="whitespace-nowrap rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          + Создать
        </SubmitButton>
      </form>
    </main>
  );
}
