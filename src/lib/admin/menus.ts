import { db } from "@/lib/db";
import type { Prisma, MenuStatus } from "@prisma/client";

const PAGE_SIZE = 20;

export type MenuStatusFilter = "all" | MenuStatus;

export async function getMenusList({
  q,
  status = "all",
  page,
}: {
  q?: string;
  status?: MenuStatusFilter;
  page: number;
}) {
  const where: Prisma.MenuWhereInput = {};
  if (q) where.business = { name: { contains: q, mode: "insensitive" } };
  if (status !== "all") where.status = status;

  const [total, menus] = await Promise.all([
    db.menu.count({ where }),
    db.menu.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        language: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        business: { select: { id: true, name: true, slug: true } },
        categories: { select: { items: { select: { id: true } } } },
      },
    }),
  ]);

  return {
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    menus: menus.map((m) => ({
      id: m.id,
      language: m.language,
      status: m.status,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      business: m.business,
      itemCount: m.categories.reduce((sum, c) => sum + c.items.length, 0),
    })),
  };
}

export async function getMenuDetail(id: string) {
  const menu = await db.menu.findUnique({
    where: { id },
    include: {
      business: { select: { id: true, name: true, slug: true, logoUrl: true } },
      categories: {
        orderBy: { sortOrder: "asc" },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!menu) return null;

  const itemCount = menu.categories.reduce((sum, c) => sum + c.items.length, 0);
  const needsReviewCount = menu.categories.reduce(
    (sum, c) => sum + c.items.filter((i) => i.needsReview).length,
    0,
  );

  return { menu, itemCount, needsReviewCount };
}
