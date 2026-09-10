import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UploadMenuForm } from "@/components/menu/upload-form";

const ERROR_MESSAGES: Record<string, string> = {
  no_files: "Выберите хотя бы один файл.",
  too_many: "Слишком много файлов за раз — загрузите меньше.",
  bad_type: "Поддерживаются только JPG, PNG, WEBP и PDF.",
  too_large: "Файл слишком большой (максимум 15 МБ).",
  ocr_failed:
    "Мы не смогли уверенно распознать часть меню. Вы можете добавить позиции вручную в редакторе.",
  rate_limited: "Слишком много загрузок за последний час. Попробуйте позже или добавьте меню вручную.",
};

export default async function MenuUploadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await db.business.findUnique({ where: { id } });
  if (!business) notFound();
  if (business.ownerId !== session.user.id) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12 sm:px-6 sm:py-16">
      <Link
        href={`/dashboard/business/${business.id}`}
        className="text-sm text-[var(--color-subtle)] hover:text-[var(--color-ink)]"
      >
        ← {business.name}
      </Link>
      <h1 className="mt-4 mb-2 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
        Загрузить меню
      </h1>
      <p className="mb-8 text-sm text-[var(--color-subtle)]">
        Сфотографируйте бумажное меню или прайс — мы распознаем позиции и категории, а вы
        проверите результат перед публикацией.
      </p>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {ERROR_MESSAGES[error] ?? "Что-то пошло не так, попробуйте ещё раз."}
        </p>
      )}

      <UploadMenuForm businessId={business.id} />

      <p className="mt-8 text-center text-sm text-[var(--color-subtle)]">
        Или сразу{" "}
        <Link
          href={`/dashboard/business/${business.id}/menu/editor`}
          className="font-medium text-[var(--color-ink)] underline"
        >
          добавьте меню вручную
        </Link>
      </p>
    </main>
  );
}
