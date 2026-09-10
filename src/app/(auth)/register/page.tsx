import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Проверьте email и пароль (минимум 8 символов).",
  exists: "Этот email уже зарегистрирован. Попробуйте войти.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">Регистрация</h1>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {ERROR_MESSAGES[error] ?? "Что-то пошло не так, попробуйте ещё раз."}
        </p>
      )}

      <form action={registerAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          Имя (необязательно)
          <input
            type="text"
            name="name"
            autoComplete="name"
            className="rounded-lg border border-neutral-300 px-3.5 py-2.5 text-base outline-none focus:border-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="rounded-lg border border-neutral-300 px-3.5 py-2.5 text-base outline-none focus:border-neutral-900"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Пароль
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-lg border border-neutral-300 px-3.5 py-2.5 text-base outline-none focus:border-neutral-900"
          />
        </label>
        <SubmitButton
          pendingLabel="Создаём аккаунт…"
          className="mt-2 rounded-full bg-neutral-900 px-6 py-3 text-base font-medium text-white transition hover:bg-neutral-700"
        >
          Создать аккаунт
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-neutral-500">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-medium text-neutral-900 underline">
          Войти
        </Link>
      </p>
    </main>
  );
}
