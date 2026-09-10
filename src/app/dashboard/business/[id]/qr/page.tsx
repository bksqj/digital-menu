import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";
import { buildAndStoreQr, regenerateQrAction } from "@/lib/actions/qr";
import { CopyLinkButton } from "@/components/business/copy-link-button";
import { SubmitButton } from "@/components/ui/submit-button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function QrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await db.business.findUnique({ where: { id }, include: { qrCode: true } });
  if (!business) notFound();
  if (business.ownerId !== session.user.id) notFound();

  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL}/m/${business.slug}`;

  // The heavy part (sharp compositing + two Blob writes) only runs the
  // first time — after that this is a single cheap read. Uploading/removing
  // a logo re-triggers it explicitly (see lib/actions/logo.ts); otherwise
  // there's a manual "Обновить" button below for anything else that changed.
  const { pngKey, svgKey, updatedAt } =
    business.qrCode?.pngPath && business.qrCode?.svgPath
      ? { pngKey: business.qrCode.pngPath, svgKey: business.qrCode.svgPath, updatedAt: business.qrCode.updatedAt }
      : await buildAndStoreQr(business);

  const storage = getStorageAdapter();
  // The PNG/SVG live at a stable key that gets overwritten in place on
  // regeneration, but the blob route serves them with a year-long immutable
  // Cache-Control — without a version param, a browser that cached the old
  // bytes (e.g. the plain-circle placeholder before a logo existed) would
  // keep showing them forever even after the real logo is composited in.
  const version = updatedAt.getTime();
  const pngUrl = `${storage.getUrl(pngKey)}?v=${version}`;
  const svgUrl = `${storage.getUrl(svgKey)}?v=${version}`;
  const logoDisplayUrl = business.logoUrl
    ? `${storage.getUrl(business.logoUrl)}?v=${business.updatedAt.getTime()}`
    : null;

  return (
    <DashboardShell
      userEmail={session.user.email ?? ""}
      business={{ id: business.id, name: business.name, slug: business.slug, logoUrl: logoDisplayUrl }}
    >
      <div className="mx-auto w-full max-w-md px-5 py-12 sm:px-6 sm:py-16">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
        QR-код
      </h1>

      <div className="flex flex-col items-center gap-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8">
        {/* eslint-disable-next-line @next/next/no-img-element -- local file, regenerated per request, not worth next/image config for an MVP */}
        <img
          src={pngUrl}
          alt={`QR-код меню ${business.name}`}
          className="h-64 w-64 rounded-xl border border-[var(--color-line)]"
        />
        <p className="text-center text-sm break-all text-[var(--color-subtle)]">{menuUrl}</p>
        <CopyLinkButton url={menuUrl} />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a
          href={pngUrl}
          download={`qr-${business.slug}.png`}
          className="rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-accent-strong)] hover:text-white"
        >
          Скачать PNG
        </a>
        <a
          href={svgUrl}
          download={`qr-${business.slug}.svg`}
          className="rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-ink)]"
        >
          Скачать SVG
        </a>
        <Link
          href={`/m/${business.slug}`}
          target="_blank"
          className="rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-ink)]"
        >
          Открыть меню
        </Link>
      </div>

      <form action={regenerateQrAction} className="mt-6 text-center">
        <input type="hidden" name="businessId" value={business.id} />
        <SubmitButton
          pendingLabel="Обновляем…"
          className="text-sm text-[var(--color-subtle)] underline hover:text-[var(--color-ink)]"
        >
          Обновить QR
        </SubmitButton>
      </form>
      </div>
    </DashboardShell>
  );
}
