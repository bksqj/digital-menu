import Link from "next/link";
import { resetPasswordAction } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

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
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Ссылка неполная</h1>
        <p className="text-sm text-neutral-500">
          Перейдите по ссылке из письма целиком, или запросите новую.
        </p>
        <Link href="/forgot-password" className="font-medium text-neutral-900 underline">
          Запросить ссылку заново
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">Новый пароль</h1>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
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

      <form action={resetPasswordAction} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        <label className="flex flex-col gap-1.5 text-sm">
          Новый пароль
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
          pendingLabel="Сохраняем…"
          className="mt-2 rounded-full bg-neutral-900 px-6 py-3 text-base font-medium text-white transition hover:bg-neutral-700"
        >
          Сохранить пароль
        </SubmitButton>
      </form>
    </main>
  );
}
