"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { upsertCategorySchema, upsertItemSchema } from "@/lib/validation/menu";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

async function requireMenuOwner(menuId: string, userId: string) {
  const menu = await db.menu.findUnique({
    where: { id: menuId },
    include: { business: true },
  });
  if (!menu || menu.business.ownerId !== userId) redirect("/dashboard");
  return menu;
}

async function requireCategoryOwner(categoryId: string, userId: string) {
  const category = await db.category.findUnique({
    where: { id: categoryId },
    include: { menu: { include: { business: true } } },
  });
  if (!category || category.menu.business.ownerId !== userId) redirect("/dashboard");
  return category;
}

async function requireItemOwner(itemId: string, userId: string) {
  const item = await db.item.findUnique({
    where: { id: itemId },
    include: { category: { include: { menu: { include: { business: true } } } } },
  });
  if (!item || item.category.menu.business.ownerId !== userId) redirect("/dashboard");
  return item;
}

function revalidateEditor(businessId: string) {
  revalidatePath(`/dashboard/business/${businessId}/menu/editor`);
}

export async function createCategoryAction(formData: FormData) {
  const userId = await requireUserId();
  const menuId = String(formData.get("menuId") ?? "");
  const menu = await requireMenuOwner(menuId, userId);

  const parsed = upsertCategorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return;

  const last = await db.category.findFirst({ where: { menuId }, orderBy: { sortOrder: "desc" } });
  await db.category.create({
    data: { menuId, name: parsed.data.name, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
  revalidateEditor(menu.business.id);
}

export async function renameCategoryAction(formData: FormData) {
  const userId = await requireUserId();
  const categoryId = String(formData.get("categoryId") ?? "");
  const category = await requireCategoryOwner(categoryId, userId);

  const parsed = upsertCategorySchema.pick({ name: true }).safeParse({ name: formData.get("name") });
  if (!parsed.success) return;

  await db.category.update({ where: { id: categoryId }, data: { name: parsed.data.name } });
  revalidateEditor(category.menu.business.id);
}

export async function deleteCategoryAction(formData: FormData) {
  const userId = await requireUserId();
  const categoryId = String(formData.get("categoryId") ?? "");
  const category = await requireCategoryOwner(categoryId, userId);

  await db.category.delete({ where: { id: categoryId } });
  revalidateEditor(category.menu.business.id);
}

export async function reorderCategoriesAction(businessId: string, orderedIds: string[]) {
  const userId = await requireUserId();
  // Cheap ownership check: every id must belong to a category owned by this user.
  await Promise.all(orderedIds.map((id) => requireCategoryOwner(id, userId)));

  await db.$transaction(
    orderedIds.map((id, index) => db.category.update({ where: { id }, data: { sortOrder: index } })),
  );
  revalidateEditor(businessId);
}

export async function createItemAction(formData: FormData) {
  const userId = await requireUserId();
  const categoryId = String(formData.get("categoryId") ?? "");
  const category = await requireCategoryOwner(categoryId, userId);

  const rawPrice = formData.get("price");
  const parsed = upsertItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    price: rawPrice ? Number(rawPrice) : null,
    currency: formData.get("currency") || "EUR",
  });
  if (!parsed.success) return;

  const last = await db.item.findFirst({ where: { categoryId }, orderBy: { sortOrder: "desc" } });
  await db.item.create({
    data: {
      categoryId,
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      currency: parsed.data.currency,
      available: parsed.data.available,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
  });
  revalidateEditor(category.menu.business.id);
}

export async function updateItemAction(formData: FormData) {
  const userId = await requireUserId();
  const itemId = String(formData.get("itemId") ?? "");
  const item = await requireItemOwner(itemId, userId);

  const rawPrice = formData.get("price");
  const parsed = upsertItemSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    price: rawPrice ? Number(rawPrice) : null,
    currency: formData.get("currency") || "EUR",
    available: formData.get("available") === "on",
  });
  if (!parsed.success) return;

  await db.item.update({
    where: { id: itemId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      currency: parsed.data.currency,
      available: parsed.data.available,
      needsReview: false,
    },
  });
  revalidateEditor(item.category.menu.business.id);
}

export async function toggleItemAvailableAction(itemId: string, available: boolean) {
  const userId = await requireUserId();
  const item = await requireItemOwner(itemId, userId);
  await db.item.update({ where: { id: itemId }, data: { available } });
  revalidateEditor(item.category.menu.business.id);
}
export async function deleteItemAction(formData: FormData) {
  const userId = await requireUserId();
  const itemId = String(formData.get("itemId") ?? "");
  const item = await requireItemOwner(itemId, userId);

  await db.item.delete({ where: { id: itemId } });
  revalidateEditor(item.category.menu.business.id);
}

export async function reorderItemsAction(businessId: string, orderedIds: string[]) {
  const userId = await requireUserId();
  await Promise.all(orderedIds.map((id) => requireItemOwner(id, userId)));

  await db.$transaction(
    orderedIds.map((id, index) => db.item.update({ where: { id }, data: { sortOrder: index } })),
  );
  revalidateEditor(businessId);
}

export async function setMenuStatusAction(menuId: string, status: "DRAFT" | "PUBLISHED") {
  const userId = await requireUserId();
  const menu = await requireMenuOwner(menuId, userId);
  await db.menu.update({ where: { id: menuId }, data: { status } });
  revalidateEditor(menu.business.id);
  revalidatePath(`/dashboard/business/${menu.business.id}`);
}
