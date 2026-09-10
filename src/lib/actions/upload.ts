"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";
import { getOcrProvider } from "@/lib/ocr";
import { menuParseResultSchema, REVIEW_CONFIDENCE_THRESHOLD } from "@/lib/validation/menu";
import {
  ALLOWED_MENU_FILE_TYPES,
  MAX_MENU_FILES,
  MAX_MENU_FILE_SIZE_BYTES,
  MAX_UPLOADS_PER_HOUR,
} from "@/lib/upload-constraints";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export async function uploadMenuFilesAction(formData: FormData) {
  const userId = await requireUserId();
  const businessId = String(formData.get("businessId") ?? "");

  const business = await db.business.findUnique({
    where: { id: businessId },
    include: { menus: true },
  });
  if (!business || business.ownerId !== userId) redirect("/dashboard");

  const menu = business.menus[0];
  if (!menu) redirect(`/dashboard/business/${businessId}`);

  const menuPath = `/dashboard/business/${businessId}/menu`;

  const recentUploads = await db.uploadJob.count({
    where: {
      business: { ownerId: userId },
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recentUploads >= MAX_UPLOADS_PER_HOUR) redirect(`${menuPath}?error=rate_limited`);

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) redirect(`${menuPath}?error=no_files`);
  if (files.length > MAX_MENU_FILES) redirect(`${menuPath}?error=too_many`);
  for (const file of files) {
    if (!(ALLOWED_MENU_FILE_TYPES as readonly string[]).includes(file.type)) {
      redirect(`${menuPath}?error=bad_type`);
    }
    if (file.size > MAX_MENU_FILE_SIZE_BYTES) redirect(`${menuPath}?error=too_large`);
  }

  const storage = getStorageAdapter();
  const sourceKeys: string[] = [];
  const ocrInputs: { key: string; mimeType: string }[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const key = `menus/${menu.id}/${randomUUID()}.${extension}`;
    await storage.put(key, buffer, file.type);
    sourceKeys.push(key);
    ocrInputs.push({ key, mimeType: file.type });
  }

  const uploadJob = await db.uploadJob.create({
    data: { businessId: business.id, status: "PROCESSING", sourceKeys },
  });

  let successRedirectUrl: string;
  try {
    const parsed = menuParseResultSchema.parse(await getOcrProvider().parseMenu(ocrInputs));

    const lastCategory = await db.category.findFirst({
      where: { menuId: menu.id },
      orderBy: { sortOrder: "desc" },
    });
    let nextCategorySort = (lastCategory?.sortOrder ?? -1) + 1;

    let itemsCreated = 0;
    let itemsFlagged = 0;

    for (const category of parsed.categories) {
      const createdCategory = await db.category.create({
        data: { menuId: menu.id, name: category.name, sortOrder: nextCategorySort++ },
      });

      for (const [index, item] of category.items.entries()) {
        const needsReview = item.confidence < REVIEW_CONFIDENCE_THRESHOLD;
        await db.item.create({
          data: {
            categoryId: createdCategory.id,
            name: item.name,
            description: item.description ?? null,
            price: item.price ?? null,
            currency: item.currency ?? "EUR",
            sortOrder: index,
            needsReview,
          },
        });
        itemsCreated += 1;
        if (needsReview) itemsFlagged += 1;
      }
    }

    await db.uploadJob.update({
      where: { id: uploadJob.id },
      data: { status: "DONE", resultJson: parsed },
    });

    successRedirectUrl =
      `/dashboard/business/${business.id}/menu/editor` +
      `?imported=${itemsCreated}&flagged=${itemsFlagged}&categories=${parsed.categories.length}`;
  } catch (error) {
    // Don't fail hard on a bad OCR result — the owner can still build the
    // menu by hand (see spec: never crash the upload, offer manual entry).
    const message = error instanceof Error ? error.message : "Unknown OCR error";
    await db.uploadJob.update({
      where: { id: uploadJob.id },
      data: { status: "FAILED", error: message },
    });
    redirect(`${menuPath}?error=ocr_failed`);
  }

  redirect(successRedirectUrl);
}
