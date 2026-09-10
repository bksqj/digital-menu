import Link from "next/link";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

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
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">Восстановление пароля</h1>

      {sent ? (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          Если такой email зарегистрирован, мы отправили на него ссылку для сброса пароля.
          Проверьте почту (и папку «Спам»).
        </p>
      ) : (
        <>
          <p className="text-sm text-neutral-500">
            Введите email, с которым регистрировались — пришлём ссылку для сброса пароля.
          </p>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {ERROR_MESSAGES[error] ?? "Что-то пошло не так, попробуйте ещё раз."}
            </p>
          )}

          <form action={requestPasswordResetAction} className="flex flex-col gap-4">
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
            <SubmitButton
              pendingLabel="Отправляем…"
              className="mt-2 rounded-full bg-neutral-900 px-6 py-3 text-base font-medium text-white transition hover:bg-neutral-700"
            >
              Прислать ссылку
            </SubmitButton>
          </form>
        </>
      )}

      <p className="text-center text-sm text-neutral-500">
        <Link href="/login" className="font-medium text-neutral-900 underline">
          Вернуться ко входу
        </Link>
      </p>
    </main>
  );
}
