import { db } from "@/lib/db";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number) {
  return new Date(Date.now() - days * DAY_MS);
}

export async function getPlatformKpis() {
  const since30d = daysAgo(30);
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [
    totalUsers,
    newUsers30d,
    totalBusinesses,
    newBusinesses30d,
    publishedMenus,
    newPublishedMenus30d,
    totalViews,
    newViews30d,
    totalScans,
    newScans30d,
    aiProcessed,
    newAiProcessed30d,
    menusCreatedToday,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: since30d } } }),
    db.business.count(),
    db.business.count({ where: { createdAt: { gte: since30d } } }),
    db.menu.count({ where: { status: "PUBLISHED" } }),
    db.menu.count({ where: { status: "PUBLISHED", updatedAt: { gte: since30d } } }),
    db.analyticsEvent.count({ where: { type: "view" } }),
    db.analyticsEvent.count({ where: { type: "view", createdAt: { gte: since30d } } }),
    db.analyticsEvent.count({ where: { type: "qr_scan" } }),
    db.analyticsEvent.count({ where: { type: "qr_scan", createdAt: { gte: since30d } } }),
    db.uploadJob.count({ where: { status: "DONE" } }),
    db.uploadJob.count({ where: { status: "DONE", updatedAt: { gte: since30d } } }),
    db.menu.count({ where: { createdAt: { gte: todayStart } } }),
  ]);

  return {
    totalUsers,
    newUsers30d,
    totalBusinesses,
    newBusinesses30d,
    publishedMenus,
    newPublishedMenus30d,
    totalViews,
    newViews30d,
    totalScans,
    newScans30d,
    aiProcessed,
    newAiProcessed30d,
    menusCreatedToday,
  };
}

export type PlatformActivityPoint = { date: string; users: number; businesses: number; views: number };

/** Zero-filled per-day counts for the platform activity chart. */
export async function getPlatformActivitySeries(days: number): Promise<PlatformActivityPoint[]> {
  const since = daysAgo(days - 1);
  since.setUTCHours(0, 0, 0, 0);

  const [users, businesses, views] = await Promise.all([
    db.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    db.business.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    db.analyticsEvent.findMany({
      where: { type: "view", createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const buckets = new Map<string, PlatformActivityPoint>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, users: 0, businesses: 0, views: 0 });
  }

  for (const u of users) buckets.get(u.createdAt.toISOString().slice(0, 10))!.users += 1;
  for (const b of businesses) buckets.get(b.createdAt.toISOString().slice(0, 10))!.businesses += 1;
  for (const v of views) buckets.get(v.createdAt.toISOString().slice(0, 10))!.views += 1;

  return [...buckets.values()];
}

export type MenuCreationPoint = { date: string; count: number };

export async function getMenuCreationSeries(days: number): Promise<MenuCreationPoint[]> {
  const since = daysAgo(days - 1);
  since.setUTCHours(0, 0, 0, 0);

  const menus = await db.menu.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const buckets = new Map<string, MenuCreationPoint>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, count: 0 });
  }
  for (const m of menus) buckets.get(m.createdAt.toISOString().slice(0, 10))!.count += 1;

  return [...buckets.values()];
}

export async function getAiStats() {
  const [total, done, failed, doneJobs] = await Promise.all([
    db.uploadJob.count(),
    db.uploadJob.count({ where: { status: "DONE" } }),
    db.uploadJob.count({ where: { status: "FAILED" } }),
    db.uploadJob.findMany({
      where: { status: "DONE" },
      select: { createdAt: true, updatedAt: true },
    }),
  ]);

  const successRate = total > 0 ? (done / total) * 100 : 0;
  const avgProcessingSeconds =
    doneJobs.length > 0
      ? doneJobs.reduce((sum, job) => sum + (job.updatedAt.getTime() - job.createdAt.getTime()) / 1000, 0) /
        doneJobs.length
      : 0;

  return { total, done, failed, successRate, avgProcessingSeconds };
}

export type ActivityEntry = {
  id: string;
  kind: "user_registered" | "business_created" | "menu_published" | "ai_processed" | "qr_generated";
  title: string;
  subtitle: string;
  createdAt: Date;
};

/** Merges timestamps from existing tables into one feed — no dedicated
 * event log for ordinary platform activity (see schema comment on
 * AuditLog for why). */
export async function getRecentActivity(limit = 8): Promise<ActivityEntry[]> {
  const [users, businesses, publishedMenus, aiJobs, qrCodes] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "desc" }, take: limit, select: { id: true, email: true, createdAt: true } }),
    db.business.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, name: true, createdAt: true },
    }),
    db.menu.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, updatedAt: true, business: { select: { name: true } } },
    }),
    db.uploadJob.findMany({
      where: { status: "DONE" },
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: { id: true, updatedAt: true, business: { select: { name: true } } },
    }),
    db.qrCode.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, createdAt: true, business: { select: { name: true } } },
    }),
  ]);

  const entries: ActivityEntry[] = [
    ...users.map((u) => ({
      id: `user-${u.id}`,
      kind: "user_registered" as const,
      title: "Новый пользователь",
      subtitle: u.email,
      createdAt: u.createdAt,
    })),
    ...businesses.map((b) => ({
      id: `business-${b.id}`,
      kind: "business_created" as const,
      title: "Новый бизнес создан",
      subtitle: b.name,
      createdAt: b.createdAt,
    })),
    ...publishedMenus.map((m) => ({
      id: `menu-${m.id}`,
      kind: "menu_published" as const,
      title: "Меню опубликовано",
      subtitle: m.business.name,
      createdAt: m.updatedAt,
    })),
    ...aiJobs.map((j) => ({
      id: `ai-${j.id}`,
      kind: "ai_processed" as const,
      title: "Обработано AI",
      subtitle: j.business.name,
      createdAt: j.updatedAt,
    })),
    ...qrCodes.map((q) => ({
      id: `qr-${q.id}`,
      kind: "qr_generated" as const,
      title: "QR-код сгенерирован",
      subtitle: q.business.name,
      createdAt: q.createdAt,
    })),
  ];

  return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
}

export type TopBusiness = { id: string; name: string; slug: string; logoUrl: string | null; views: number };

export async function getTopBusinessesByViews(limit = 5): Promise<TopBusiness[]> {
  const grouped = await db.analyticsEvent.groupBy({
    by: ["businessId"],
    where: { type: "view" },
    _count: { businessId: true },
    orderBy: { _count: { businessId: "desc" } },
    take: limit,
  });
  if (grouped.length === 0) return [];

  const businesses = await db.business.findMany({
    where: { id: { in: grouped.map((g) => g.businessId) } },
    select: { id: true, name: true, slug: true, logoUrl: true },
  });
  const byId = new Map(businesses.map((b) => [b.id, b]));

  return grouped
    .map((g) => {
      const business = byId.get(g.businessId);
      if (!business) return null;
      return { ...business, views: g._count.businessId };
    })
    .filter((b): b is TopBusiness => b !== null);
}

export type RecentUserRow = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  suspended: boolean;
  businessCount: number;
  menuCount: number;
};

export async function getRecentUsers(limit = 5): Promise<RecentUserRow[]> {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      suspended: true,
      businesses: { select: { menus: { select: { id: true } } } },
    },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt,
    suspended: u.suspended,
    businessCount: u.businesses.length,
    menuCount: u.businesses.reduce((sum, b) => sum + b.menus.length, 0),
  }));
}
