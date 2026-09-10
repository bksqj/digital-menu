import Link from "next/link";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";
import { AuthCard, authInputClass, authPrimaryButtonClass } from "@/components/ui/auth-card";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Введите корректный email.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <AuthCard>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
        Восстановление пароля
      </h1>

      {sent ? (
        <p className="mt-5 rounded-lg bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
          Если такой email зарегистрирован, мы отправили на него ссылку для сброса пароля.
          Проверьте почту (и папку «Спам»).
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-[var(--color-subtle)]">
            Введите email, с которым регистрировались — пришлём ссылку для сброса пароля.
          </p>

          {error && (
            <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {ERROR_MESSAGES[error] ?? "Что-то пошло не так, попробуйте ещё раз."}
            </p>
          )}

          <form action={requestPasswordResetAction} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-[var(--color-ink)]">
              Email
              <input type="email" name="email" required autoComplete="email" className={authInputClass} />
            </label>
            <SubmitButton pendingLabel="Отправляем…" className={authPrimaryButtonClass}>
              Прислать ссылку
            </SubmitButton>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-[var(--color-subtle)]">
        <Link href="/login" className="font-medium text-[var(--color-ink)] underline">
          Вернуться ко входу
        </Link>
      </p>
    </AuthCard>
  );
}
