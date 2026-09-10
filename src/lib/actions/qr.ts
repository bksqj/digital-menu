"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";
import { generateQr } from "@/lib/qr";

type QrTargetBusiness = { id: string; slug: string; logoUrl: string | null };

/**
 * Renders the QR (sharp compositing + two Blob writes) and upserts the
 * QrCode row. Not cheap — callers should only invoke this when the encoded
 * content or the logo has actually changed, not on every page view.
 */
export async function buildAndStoreQr(business: QrTargetBusiness) {
  const storage = getStorageAdapter();
  const logoBytes = business.logoUrl
    ? await storage.get(business.logoUrl).catch(() => undefined)
    : undefined;
  const qrTargetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/m/${business.slug}?src=qr`;
  const { png, svg } = await generateQr({ url: qrTargetUrl, logo: logoBytes });

  const pngKey = `qr/${business.id}.png`;
  const svgKey = `qr/${business.id}.svg`;
  await storage.put(pngKey, png, "image/png");
  await storage.put(svgKey, Buffer.from(svg), "image/svg+xml");
  const qrCode = await db.qrCode.upsert({
    where: { businessId: business.id },
    create: { businessId: business.id, pngPath: pngKey, svgPath: svgKey },
    update: { pngPath: pngKey, svgPath: svgKey },
  });

  return { pngKey, svgKey, updatedAt: qrCode.updatedAt };
}

export async function regenerateQrAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const businessId = String(formData.get("businessId") ?? "");

  const business = await db.business.findUnique({ where: { id: businessId } });
  if (!business || business.ownerId !== session.user.id) redirect("/dashboard");

  await buildAndStoreQr(business);
  revalidatePath(`/dashboard/business/${businessId}/qr`);
  redirect(`/dashboard/business/${businessId}/qr`);
}
