import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";
import { deleteBusinessAction } from "@/lib/actions/business";
import { LogoUploader } from "@/components/business/logo-uploader";

const LOGO_ERROR_MESSAGES: Record<string, string> = {
  no_logo: "Выберите файл логотипа.",
  bad_logo_type: "Поддерживаются только JPG, PNG и WEBP.",
  logo_too_large: "Файл слишком большой (максимум 5 МБ).",
};

export default async function BusinessOverviewPage({
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

  const business = await db.business.findUnique({
    where: { id },
    include: { menus: true },
  });
  if (!business) notFound();
  if (business.ownerId !== session.user.id) notFound();

  const menu = business.menus[0];
  const storage = getStorageAdapter();
  const logoDisplayUrl = business.logoUrl ? storage.getUrl(business.logoUrl) : null;

  const [viewCount, scanCount] = await Promise.all([
    db.analyticsEvent.count({ where: { businessId: business.id, type: "view" } }),
    db.analyticsEvent.count({ where: { businessId: business.id, type: "qr_scan" } }),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <Link href="/dashboard" className="text-sm text-neutral-500 underline">
        ← Мои бизнесы
      </Link>

      <div className="mt-4 mb-6 flex items-center gap-4">
        <LogoUploader
          businessId={business.id}
          logoDisplayUrl={logoDisplayUrl}
          businessName={business.name}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{business.name}</h1>
            <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  menu?.status === "PUBLISHED" ? "bg-green-500" : "bg-neutral-400"
                }`}
              />
              {menu?.status === "PUBLISHED" ? "Опубликовано" : "Черновик"}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {LOGO_ERROR_MESSAGES[error] ?? "Что-то пошло не так."}
        </p>
      )}

      <p className="mb-2 text-sm text-neutral-500">
        Публичная страница: <span className="font-mono">/m/{business.slug}</span>
      </p>

      <p className="mb-8 flex gap-4 text-sm text-neutral-500">
        <span>
          Просмотры: <span className="font-medium text-neutral-900">{viewCount}</span>
        </span>
        <span>
          Сканирования QR: <span className="font-medium text-neutral-900">{scanCount}</span>
        </span>
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/m/${business.slug}`}
          className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:border-neutral-900"
        >
          Открыть меню
        </Link>
        <Link
          href={`/dashboard/business/${business.id}/menu`}
          className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:border-neutral-900"
        >
          Загрузить меню
        </Link>
        <Link
          href={`/dashboard/business/${business.id}/menu/editor`}
          className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:border-neutral-900"
        >
          Редактировать
        </Link>
        <Link
          href={`/dashboard/business/${business.id}/qr`}
          className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:border-neutral-900"
        >
          QR-код
        </Link>
      </div>

      <form action={deleteBusinessAction} className="mt-12 border-t border-neutral-200 pt-6">
        <input type="hidden" name="id" value={business.id} />
        <button type="submit" className="text-sm text-red-600 underline">
          Удалить бизнес
        </button>
      </form>
    </main>
  );
}
