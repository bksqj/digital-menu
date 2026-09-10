import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";
import { generateQr } from "@/lib/qr";
import { CopyLinkButton } from "@/components/business/copy-link-button";

export default async function QrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await db.business.findUnique({ where: { id } });
  if (!business) notFound();
  if (business.ownerId !== session.user.id) notFound();

  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL}/m/${business.slug}`;
  // Only the code itself carries ?src=qr — copy/share links stay clean —
  // so the public page can count scans separately from regular views.
  const qrTargetUrl = `${menuUrl}?src=qr`;

  const storage = getStorageAdapter();
  const logoBytes = business.logoUrl ? await storage.get(business.logoUrl) : undefined;

  // Regenerated on every visit — cheap (local render, no external API) and
  // keeps the QR in sync if the business name/logo changes later. The
  // encoded URL itself never changes, since it's keyed off the stable slug.
  const { png, svg } = await generateQr({
    url: qrTargetUrl,
    businessName: business.name,
    logo: logoBytes,
  });
  const pngKey = `qr/${business.id}.png`;
  const svgKey = `qr/${business.id}.svg`;
  await storage.put(pngKey, png, "image/png");
  await storage.put(svgKey, Buffer.from(svg), "image/svg+xml");
  await db.qrCode.upsert({
    where: { businessId: business.id },
    create: { businessId: business.id, pngPath: pngKey, svgPath: svgKey },
    update: { pngPath: pngKey, svgPath: svgKey },
  });

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
    </main>
  );
}
