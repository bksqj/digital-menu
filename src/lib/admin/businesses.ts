import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 20;

export type BusinessStatusFilter = "all" | "published" | "draft";

export async function getBusinessesList({
  q,
  status = "all",
  page,
}: {
  q?: string;
  status?: BusinessStatusFilter;
  page: number;
}) {
  const where: Prisma.BusinessWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
      { owner: { email: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (status === "published") where.menus = { some: { status: "PUBLISHED" } };
  if (status === "draft") where.menus = { none: { status: "PUBLISHED" } };

  const [total, businesses] = await Promise.all([
    db.business.count({ where }),
    db.business.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        createdAt: true,
        owner: { select: { email: true } },
        menus: { select: { status: true, categories: { select: { items: { select: { id: true } } } } } },
        events: { select: { type: true } },
      },
    }),
  ]);

  return {
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    businesses: businesses.map((b) => {
      const published = b.menus.some((m) => m.status === "PUBLISHED");
      const itemCount = b.menus.reduce(
        (sum, m) => sum + m.categories.reduce((s, c) => s + c.items.length, 0),
        0,
      );
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        logoUrl: b.logoUrl,
        createdAt: b.createdAt,
        ownerEmail: b.owner.email,
        published,
        itemCount,
        views: b.events.filter((e) => e.type === "view").length,
        scans: b.events.filter((e) => e.type === "qr_scan").length,
      };
    }),
  };
}

export async function getBusinessDetail(id: string) {
  const business = await db.business.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      qrCode: true,
      menus: {
        include: {
          categories: {
            orderBy: { sortOrder: "asc" },
            include: { items: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
      uploadJobs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!business) return null;

  const [views, scans] = await Promise.all([
    db.analyticsEvent.count({ where: { businessId: id, type: "view" } }),
    db.analyticsEvent.count({ where: { businessId: id, type: "qr_scan" } }),
  ]);

  const menu = business.menus[0];
  const itemCount = menu?.categories.reduce((sum, c) => sum + c.items.length, 0) ?? 0;
  const aiProcessedItems = business.uploadJobs
    .filter((j) => j.status === "DONE")
    .reduce((sum, j) => {
      const result = j.resultJson as { categories?: { items?: unknown[] }[] } | null;
      const count = result?.categories?.reduce((s, c) => s + (c.items?.length ?? 0), 0) ?? 0;
      return sum + count;
    }, 0);

  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    description: business.description,
    logoUrl: business.logoUrl,
    createdAt: business.createdAt,
    owner: business.owner,
    menu,
    itemCount,
    published: menu?.status === "PUBLISHED",
    qrCode: business.qrCode,
    views,
    scans,
    aiProcessedItems,
    uploadJobs: business.uploadJobs,
  };
}
