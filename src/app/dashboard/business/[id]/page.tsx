import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";
import { deleteBusinessAction } from "@/lib/actions/business";
import { LogoUploader } from "@/components/business/logo-uploader";
import { LinkIcon, UploadIcon, PencilIcon, LinkQrIcon } from "@/components/ui/icons";

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
  const published = menu?.status === "PUBLISHED";
  const storage = getStorageAdapter();
  // Cache-bust: the blob route serves files with a year-long immutable
  // Cache-Control, but a re-uploaded logo overwrites the same storage key —
  // without a version param a browser that cached the old logo would never
  // see the new one.
  const logoDisplayUrl = business.logoUrl
    ? `${storage.getUrl(business.logoUrl)}?v=${business.updatedAt.getTime()}`
    : null;

  const [viewCount, scanCount] = await Promise.all([
    db.analyticsEvent.count({ where: { businessId: business.id, type: "view" } }),
    db.analyticsEvent.count({ where: { businessId: business.id, type: "qr_scan" } }),
  ]);

  const actions = [
    { href: `/m/${business.slug}`, icon: LinkIcon, label: "Открыть меню" },
    { href: `/dashboard/business/${business.id}/menu`, icon: UploadIcon, label: "Загрузить меню" },
    { href: `/dashboard/business/${business.id}/menu/editor`, icon: PencilIcon, label: "Редактировать" },
    { href: `/dashboard/business/${business.id}/qr`, icon: LinkQrIcon, label: "QR-код" },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12 sm:px-6 sm:py-16">
      <Link href="/dashboard" className="text-sm text-[var(--color-subtle)] hover:text-[var(--color-ink)]">
        ← Мои бизнесы
      </Link>

      <div className="mt-4 mb-6 flex items-center gap-4">
        <LogoUploader
          businessId={business.id}
          logoDisplayUrl={logoDisplayUrl}
          businessName={business.name}
        />
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <h1 className="truncate text-2xl font-bold tracking-tight text-[var(--color-ink)]">
            {business.name}
          </h1>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-subtle)]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${published ? "bg-[var(--color-accent-strong)]" : "bg-[var(--color-line)]"}`}
            />
            {published ? "Опубликовано" : "Черновик"}
          </span>
        </div>
      </div>

      {error && (
        <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {LOGO_ERROR_MESSAGES[error] ?? "Что-то пошло не так."}
        </p>
      )}

      <p className="mb-6 text-sm text-[var(--color-subtle)]">
        Публичная страница:{" "}
        <span className="font-mono text-[var(--color-ink)]">/m/{business.slug}</span>
      </p>

      <div className="mb-8 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
          <p className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">{viewCount}</p>
          <p className="text-xs text-[var(--color-subtle)]">Просмотры</p>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
          <p className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">{scanCount}</p>
          <p className="text-xs text-[var(--color-subtle)]">Сканирования QR</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex flex-col items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-4 text-center transition hover:border-[var(--color-accent)] hover:shadow-[0_4px_16px_-8px_rgba(0,0,0,0.1)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-canvas)] text-[var(--color-ink)]">
              <action.icon className="h-4.5 w-4.5" />
            </span>
            <span className="text-xs font-medium text-[var(--color-ink)]">{action.label}</span>
          </Link>
        ))}
      </div>

      <form action={deleteBusinessAction} className="mt-12 border-t border-[var(--color-line)] pt-6">
        <input type="hidden" name="id" value={business.id} />
        <button type="submit" className="text-sm text-red-600 underline">
          Удалить бизнес
        </button>
      </form>
    </main>
  );
}
