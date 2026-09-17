import type { Metadata } from "next";
import { after } from "next/server";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";
import { getPlatformSettings } from "@/lib/admin/settings";
import { MenuCategoryTabs } from "@/components/menu/category-tabs";

async function getPublishedBusiness(slug: string) {
  return db.business.findUnique({
    where: { slug },
    include: {
      menus: {
        where: { status: "PUBLISHED" },
        include: {
          categories: {
            orderBy: { sortOrder: "asc" },
            include: {
              items: {
                where: { available: true },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const business = await getPublishedBusiness(slug);
  if (!business) return { title: "Меню не найдено" };

  return {
    title: `${business.name} — меню`,
    description: business.description ?? `Цифровое меню ${business.name}`,
  };
}

export default async function PublicMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ src?: string }>;
}) {
  const { slug } = await params;
  const { src } = await searchParams;
  const business = await getPublishedBusiness(slug);
  const menu = business?.menus[0];

  if (business) {
    // Fires after the response is sent — a guest's phone shouldn't wait on
    // an analytics write (or on the settings lookup that gates it). `src=qr`
    // is the marker the QR code itself encodes (see lib/qr usage in the qr
    // page) so scans count separately from regular link views.
    after(async () => {
      const settings = await getPlatformSettings();
      if (!settings.analyticsEnabled) return;
      await db.analyticsEvent.create({
        data: { businessId: business.id, type: src === "qr" ? "qr_scan" : "view" },
      });
    });
  }

  if (!business || !menu) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-2 bg-[var(--color-canvas)] px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">Меню пока недоступно</h1>
        <p className="text-sm text-[var(--color-subtle)]">
          Владелец ещё не опубликовал это меню. Загляните позже.
        </p>
      </main>
    );
  }

  const categoriesWithItems = menu.categories.filter((category) => category.items.length > 0);
  // Cache-bust: a re-uploaded logo overwrites the same storage key, but the
  // blob route serves it with a year-long immutable Cache-Control — without
  // a version param a guest's browser that already cached the old logo
  // would never see a replaced one.
  const logoDisplayUrl = business.logoUrl
    ? `${getStorageAdapter().getUrl(business.logoUrl)}?v=${business.updatedAt.getTime()}`
    : null;

  return (
    <main className="mx-auto w-full max-w-md flex-1 bg-[var(--color-canvas)] px-5 py-10">
      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        {logoDisplayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local upload path, not worth next/image config for an MVP
          <img
            src={logoDisplayUrl}
            alt={business.name}
            className="h-20 w-20 rounded-full border border-[var(--color-line)] object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-2xl font-semibold text-[var(--color-accent-strong)]">
            {business.name.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">
          {business.name}
        </h1>
        {business.description && (
          <p className="text-sm text-[var(--color-subtle)]">{business.description}</p>
        )}
      </header>

      {categoriesWithItems.length === 0 ? (
        <p className="text-center text-sm text-[var(--color-subtle)]">Меню скоро появится.</p>
      ) : (
        <MenuCategoryTabs
          categories={categoriesWithItems.map((category) => ({
            id: category.id,
            name: category.name,
            items: category.items.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price !== null ? Number(item.price) : null,
              currency: item.currency,
              imageUrl: item.imageUrl ? getStorageAdapter().getUrl(item.imageUrl) : null,
            })),
          }))}
        />
      )}

      <footer className="mt-12 border-t border-[var(--color-line)] pt-6 text-center text-xs text-[var(--color-subtle)]">
        Сделано на Digital Menu
      </footer>
    </main>
  );
}
