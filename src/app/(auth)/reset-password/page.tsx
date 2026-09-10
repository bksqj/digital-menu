import Link from "next/link";
import { resetPasswordAction } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";
import { AuthCard, authInputClass, authPrimaryButtonClass } from "@/components/ui/auth-card";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Проверьте пароль (минимум 8 символов).",
  expired: "Ссылка недействительна или уже использована. Запросите новую.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  if (!token) {
    return (
      <AuthCard>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
            Ссылка неполная
          </h1>
          <p className="mt-2 text-sm text-[var(--color-subtle)]">
            Перейдите по ссылке из письма целиком, или запросите новую.
          </p>
          <Link
            href="/forgot-password"
            className="mt-5 inline-block font-medium text-[var(--color-ink)] underline"
          >
            Запросить ссылку заново
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">Новый пароль</h1>

      {error && (
        <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {ERROR_MESSAGES[error] ?? "Что-то пошло не так, попробуйте ещё раз."}
          {error === "expired" && (
            <>
              {" "}
              <Link href="/forgot-password" className="font-medium underline">
                Запросить новую ссылку
              </Link>
            </>
          )}
        </div>
      )}

      <form action={resetPasswordAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <label className="flex flex-col gap-1.5 text-sm text-[var(--color-ink)]">
          Новый пароль
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={authInputClass}
          />
        </label>
        <SubmitButton pendingLabel="Сохраняем…" className={authPrimaryButtonClass}>
          Сохранить пароль
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
