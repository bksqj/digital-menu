"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";
import { buildAndStoreQr } from "@/lib/actions/qr";
import { ALLOWED_LOGO_FILE_TYPES, MAX_LOGO_FILE_SIZE_BYTES } from "@/lib/upload-constraints";

// The QR page skips regeneration once a QrCode row exists (it's not cheap —
// sharp + two Blob writes), so a logo change has to explicitly refresh it,
// otherwise the code would keep showing the old logo/plain badge forever.
async function refreshQrIfExists(business: { id: string; slug: string; logoUrl: string | null }) {
  const existing = await db.qrCode.findUnique({ where: { businessId: business.id } });
  if (existing) await buildAndStoreQr(business);
}

async function requireOwnedBusiness(businessId: string, userId: string) {
  const business = await db.business.findUnique({ where: { id: businessId } });
  if (!business || business.ownerId !== userId) redirect("/dashboard");
  return business;
}

export async function uploadLogoAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const businessId = String(formData.get("businessId") ?? "");
  const business = await requireOwnedBusiness(businessId, session.user.id);
  const businessPath = `/dashboard/business/${businessId}`;

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) redirect(`${businessPath}?error=no_logo`);
  if (!(ALLOWED_LOGO_FILE_TYPES as readonly string[]).includes(file.type)) {
    redirect(`${businessPath}?error=bad_logo_type`);
  }
  if (file.size > MAX_LOGO_FILE_SIZE_BYTES) redirect(`${businessPath}?error=logo_too_large`);

  const storage = getStorageAdapter();
  if (business.logoUrl) await storage.delete(business.logoUrl);

  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const key = `logos/${business.id}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await storage.put(key, buffer, file.type);

  const updated = await db.business.update({ where: { id: business.id }, data: { logoUrl: key } });
  await refreshQrIfExists(updated);
  revalidatePath(businessPath);
  revalidatePath(`/dashboard/business/${businessId}/qr`);
  revalidatePath(`/m/${business.slug}`);
}

export async function removeLogoAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const businessId = String(formData.get("businessId") ?? "");
  const business = await requireOwnedBusiness(businessId, session.user.id);

  if (business.logoUrl) {
    const storage = getStorageAdapter();
    await storage.delete(business.logoUrl);
    const updated = await db.business.update({ where: { id: business.id }, data: { logoUrl: null } });
    await refreshQrIfExists(updated);
  }

  revalidatePath(`/dashboard/business/${businessId}`);
  revalidatePath(`/dashboard/business/${businessId}/qr`);
  revalidatePath(`/m/${business.slug}`);
}
