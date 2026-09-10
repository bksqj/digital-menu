import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";
import { buildAndStoreQr, regenerateQrAction } from "@/lib/actions/qr";
import { CopyLinkButton } from "@/components/business/copy-link-button";
import { SubmitButton } from "@/components/ui/submit-button";

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
  const { pngKey, svgKey } =
    business.qrCode?.pngPath && business.qrCode?.svgPath
      ? { pngKey: business.qrCode.pngPath, svgKey: business.qrCode.svgPath }
      : await buildAndStoreQr(business);

  const storage = getStorageAdapter();

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-16">
      <Link
        href={`/dashboard/business/${business.id}`}
        className="text-sm text-neutral-500 underline"
      >
        ← {business.name}
      </Link>
      <h1 className="mt-4 mb-8 text-2xl font-semibold">QR-код</h1>

      <div className="flex flex-col items-center gap-6 rounded-2xl border border-neutral-200 p-8">
        {/* eslint-disable-next-line @next/next/no-img-element -- local file, regenerated per request, not worth next/image config for an MVP */}
        <img
          src={storage.getUrl(pngKey)}
          alt={`QR-код меню ${business.name}`}
          className="h-64 w-64 rounded-xl"
        />
        <p className="text-center text-sm text-neutral-500 break-all">{menuUrl}</p>
        <CopyLinkButton url={menuUrl} />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a
          href={storage.getUrl(pngKey)}
          download={`qr-${business.slug}.png`}
          className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          Скачать PNG
        </a>
        <a
          href={storage.getUrl(svgKey)}
          download={`qr-${business.slug}.svg`}
          className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:border-neutral-900"
        >
          Скачать SVG
        </a>
        <Link
          href={`/m/${business.slug}`}
          target="_blank"
          className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:border-neutral-900"
        >
          Открыть меню
        </Link>
      </div>

      <form action={regenerateQrAction} className="mt-6 text-center">
        <input type="hidden" name="businessId" value={business.id} />
        <SubmitButton pendingLabel="Обновляем…" className="text-sm text-neutral-500 underline">
          Обновить QR
        </SubmitButton>
      </form>
    </main>
  );
}
