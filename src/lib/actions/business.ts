"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";
import { createBusinessSchema } from "@/lib/validation/menu";
import { slugify } from "@/lib/slug";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export async function createBusinessAction(formData: FormData) {
  const userId = await requireUserId();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/dashboard?error=name");

  const baseSlug = slugify(name) || "business";
  let slug = baseSlug;
  let attempt = 1;
  // Collision on slug (two "Bella Roma"s) — append -2, -3... until free.
  while (await db.business.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const parsed = createBusinessSchema.safeParse({ name, slug });
  if (!parsed.success) redirect("/dashboard?error=name");

  const business = await db.business.create({
    data: { name: parsed.data.name, slug: parsed.data.slug, ownerId: userId },
  });

  // Every business starts with one draft menu — the editor, QR and public
  // pages all assume a Business has at least one Menu.
  await db.menu.create({ data: { businessId: business.id, language: "ru" } });

  redirect(`/dashboard/business/${business.id}`);
}

export async function deleteBusinessAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");

  const business = await db.business.findUnique({
    where: { id },
    include: { qrCode: true, uploadJobs: { select: { sourceKeys: true } } },
  });
  if (!business || business.ownerId !== userId) redirect("/dashboard");

  // The DB row cascades (QrCode/Menu/Category/Item/UploadJob/AnalyticsEvent
  // all onDelete: Cascade), but the actual files in blob storage don't —
  // clean those up too so deleting a business doesn't just leave them
  // orphaned forever. Best-effort: a failed blob delete shouldn't block
  // removing the business itself.
  const storage = getStorageAdapter();
  const keysToDelete = [
    business.logoUrl,
    business.qrCode?.pngPath,
    business.qrCode?.svgPath,
    ...business.uploadJobs.flatMap((job) => job.sourceKeys),
  ].filter((key): key is string => Boolean(key));
  await Promise.allSettled(keysToDelete.map((key) => storage.delete(key)));

  await db.business.delete({ where: { id } });
  redirect("/dashboard");
}
