import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";
import { AuthCard, authInputClass, authPrimaryButtonClass } from "@/components/ui/auth-card";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Заполните email и пароль.",
  credentials: "Неверный email или пароль.",
  rate_limited: "Слишком много попыток входа. Попробуйте позже.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthCard>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">Вход</h1>
      <p className="mt-1 text-sm text-[var(--color-subtle)]">Рады видеть вас снова.</p>

      {error && (
        <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {ERROR_MESSAGES[error] ?? "Что-то пошло не так, попробуйте ещё раз."}
        </p>
      )}

      <form action={loginAction} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm text-[var(--color-ink)]">
          Email
          <input type="email" name="email" required autoComplete="email" className={authInputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-[var(--color-ink)]">
          <span className="flex items-center justify-between">
            Пароль
            <Link href="/forgot-password" className="text-xs text-[var(--color-subtle)] hover:text-[var(--color-ink)]">
              Забыли пароль?
            </Link>
          </span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className={authInputClass}
          />
        </label>
        <SubmitButton pendingLabel="Входим…" className={authPrimaryButtonClass}>
          Войти
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-subtle)]">
        Ещё нет аккаунта?{" "}
        <Link href="/register" className="font-medium text-[var(--color-ink)] underline">
          Зарегистрироваться
        </Link>
      </p>
    </AuthCard>
  );
}
