import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";
import { MenuEditor } from "@/components/menu/menu-editor";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MobileMenuPreview } from "@/components/admin/mobile-menu-preview";

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

  const logoDisplayUrl = business.logoUrl
    ? `${storage.getUrl(business.logoUrl)}?v=${business.updatedAt.getTime()}`
    : null;

  return (
    <DashboardShell
      userEmail={session.user.email ?? ""}
      business={{ id: business.id, name: business.name, slug: business.slug, logoUrl: logoDisplayUrl }}
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="mb-8 text-2xl font-bold tracking-tight text-[var(--color-ink)]">Редактор меню</h1>

        {imported && (
          <p className="mb-6 rounded-lg bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[var(--color-accent-strong)]">
            Распознали {importedCategories} {importedCategories === "1" ? "категорию" : "категории"}{" "}
            и {imported} {imported === "1" ? "позицию" : "позиций"}.
            {flagged && flagged !== "0" && (
              <>
                {" "}
                {flagged} {flagged === "1" ? "отмечена" : "отмечены"} как «проверить» — не уверены в
                распознавании.
              </>
            )}{" "}
            Проверьте всё перед публикацией.
          </p>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <MenuEditor
            businessId={business.id}
            menuId={menu.id}
            menuStatus={menu.status}
            categories={categories}
          />

          <div className="hidden lg:block">
            <p className="sticky top-6 mb-3 text-sm font-semibold text-[var(--color-ink)]">Предпросмотр</p>
            <div className="sticky top-14">
              <MobileMenuPreview
                businessName={business.name}
                logoUrl={logoDisplayUrl}
                categories={categories
                  .map((c) => ({ ...c, items: c.items.filter((i) => i.available) }))
                  .filter((c) => c.items.length > 0)}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
