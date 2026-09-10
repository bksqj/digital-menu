import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";
import { AuthCard, authInputClass, authPrimaryButtonClass } from "@/components/ui/auth-card";

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
    <AuthCard>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">Регистрация</h1>
      <p className="mt-1 text-sm text-[var(--color-subtle)]">Создайте цифровое меню за пару минут.</p>

      {error && (
        <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {ERROR_MESSAGES[error] ?? "Что-то пошло не так, попробуйте ещё раз."}
        </p>
      )}

      <form action={registerAction} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-[var(--color-ink)]">
          Имя (необязательно)
          <input type="text" name="name" autoComplete="name" className={authInputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-[var(--color-ink)]">
          Email
          <input type="email" name="email" required autoComplete="email" className={authInputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-[var(--color-ink)]">
          Пароль
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={authInputClass}
          />
        </label>
        <SubmitButton pendingLabel="Создаём аккаунт…" className={authPrimaryButtonClass}>
          Создать аккаунт
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-subtle)]">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-medium text-[var(--color-ink)] underline">
          Войти
        </Link>
      </p>
    </AuthCard>
  );
}
