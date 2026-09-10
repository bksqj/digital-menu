import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";

const PAGE_SIZE = 20;

export async function getUsersList({ q, page }: { q?: string; page: number }) {
  const where = q
    ? { OR: [{ email: { contains: q, mode: "insensitive" as const } }, { name: { contains: q, mode: "insensitive" as const } }] }
    : {};

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        suspended: true,
        createdAt: true,
        lastLoginAt: true,
        businesses: { select: { id: true, menus: { select: { id: true } } } },
      },
    }),
  ]);

  return {
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      suspended: u.suspended,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      businessCount: u.businesses.length,
      menuCount: u.businesses.reduce((sum, b) => sum + b.menus.length, 0),
    })),
  };
}

export type UserDetail = Awaited<ReturnType<typeof getUserDetail>>;

export async function getUserDetail(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    include: {
      businesses: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          createdAt: true,
          menus: { select: { id: true, status: true } },
        },
      },
    },
  });
  if (!user) return null;

  const businessIds = user.businesses.map((b) => b.id);
  const [views, scans] = businessIds.length
    ? await Promise.all([
        db.analyticsEvent.count({ where: { businessId: { in: businessIds }, type: "view" } }),
        db.analyticsEvent.count({ where: { businessId: { in: businessIds }, type: "qr_scan" } }),
      ])
    : [0, 0];

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    suspended: user.suspended,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    businesses: user.businesses,
    stats: {
      businessCount: user.businesses.length,
      menuCount: user.businesses.reduce((sum, b) => sum + b.menus.length, 0),
      views,
      scans,
    },
  };
}
