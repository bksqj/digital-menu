import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";
import { MenuEditor } from "@/components/menu/menu-editor";

export default async function MenuEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ imported?: string; flagged?: string; categories?: string }>;
}) {
  const { id } = await params;
  const { imported, flagged, categories: importedCategories } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await db.business.findUnique({
    where: { id },
    include: {
      menus: {
        include: {
          categories: {
            orderBy: { sortOrder: "asc" },
            include: { items: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });
  if (!business) notFound();
  if (business.ownerId !== session.user.id) notFound();

  const menu = business.menus[0];
  if (!menu) notFound();

  // Prisma's Decimal isn't a plain object — it can't cross the server/client
  // boundary as a prop, so flatten it to a number here.
  const storage = getStorageAdapter();
  const categories = menu.categories.map((category) => ({
    id: category.id,
    name: category.name,
    items: category.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price ? Number(item.price) : null,
      currency: item.currency,
      available: item.available,
      needsReview: item.needsReview,
      imageUrl: item.imageUrl ? storage.getUrl(item.imageUrl) : null,
    })),
  }));

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12 sm:px-6 sm:py-16">
      <Link
        href={`/dashboard/business/${business.id}`}
        className="text-sm text-[var(--color-subtle)] hover:text-[var(--color-ink)]"
      >
        ← {business.name}
      </Link>
      <h1 className="mt-4 mb-8 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
        Редактор меню
      </h1>

      {imported && (
        <p className="mb-6 rounded-lg bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
          Распознали {importedCategories} {importedCategories === "1" ? "категорию" : "категории"}{" "}
          и {imported} {imported === "1" ? "позицию" : "позиций"}.
          {flagged && flagged !== "0" && (
            <> {flagged} {flagged === "1" ? "отмечена" : "отмечены"} как «проверить» — не уверены в распознавании.</>
          )}{" "}
          Проверьте всё перед публикацией.
        </p>
      )}

      <MenuEditor
        businessId={business.id}
        menuId={menu.id}
        menuStatus={menu.status}
        categories={categories}
      />
    </main>
  );
}
