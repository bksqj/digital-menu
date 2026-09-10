import type { Metadata } from "next";
import { after } from "next/server";
import { db } from "@/lib/db";
import { getStorageAdapter } from "@/lib/storage";

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
    // an analytics write. `src=qr` is the marker the QR code itself encodes
    // (see lib/qr usage in the qr page) so scans count separately from
    // regular link views.
    after(() =>
      db.analyticsEvent.create({
        data: { businessId: business.id, type: src === "qr" ? "qr_scan" : "view" },
      }),
    );
  }

  if (!business || !menu) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <h1 className="text-xl font-semibold">Меню пока недоступно</h1>
        <p className="text-sm text-neutral-500">
          Владелец ещё не опубликовал это меню. Загляните позже.
        </p>
      </main>
    );
  }

  const categoriesWithItems = menu.categories.filter((category) => category.items.length > 0);
  const logoDisplayUrl = business.logoUrl ? getStorageAdapter().getUrl(business.logoUrl) : null;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-10">
      <header className="mb-8 flex flex-col items-center gap-3 text-center">
        {logoDisplayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local upload path, not worth next/image config for an MVP
          <img
            src={logoDisplayUrl}
            alt={business.name}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-2xl font-semibold text-neutral-400">
            {business.name.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="text-2xl font-semibold">{business.name}</h1>
        {business.description && (
          <p className="text-sm text-neutral-500">{business.description}</p>
        )}
      </header>

      {categoriesWithItems.length === 0 ? (
        <p className="text-center text-sm text-neutral-500">Меню скоро появится.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {categoriesWithItems.map((category) => (
            <section key={category.id}>
              <h2 className="mb-3 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
                {category.name}
              </h2>
              <ul className="flex flex-col gap-4">
                {category.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="mt-0.5 text-sm text-neutral-500">{item.description}</p>
                      )}
                    </div>
                    {item.price !== null && (
                      <p className="shrink-0 font-medium whitespace-nowrap">
                        {Number(item.price)} {item.currency}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <footer className="mt-12 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-400">
        Сделано на Digital Menu
      </footer>
    </main>
  );
}
