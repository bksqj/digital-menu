import { db } from "@/lib/db";

export type DailyStat = { date: string; views: number; scans: number };

/**
 * Per-day view/scan counts for the last `days` days (including today),
 * zero-filled so the caller never has to handle gaps. Aggregated in JS
 * rather than a raw SQL date_trunc — event volume for a single business is
 * small enough that this is simpler and avoids reaching for $queryRaw.
 */
export async function getDailyStats(businessId: string, days: number): Promise<DailyStat[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);

  const events = await db.analyticsEvent.findMany({
    where: { businessId, createdAt: { gte: since }, type: { in: ["view", "qr_scan"] } },
    select: { type: true, createdAt: true },
  });

  const buckets = new Map<string, DailyStat>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, views: 0, scans: 0 });
  }

  for (const event of events) {
    const bucket = buckets.get(event.createdAt.toISOString().slice(0, 10));
    if (!bucket) continue;
    if (event.type === "view") bucket.views += 1;
    else if (event.type === "qr_scan") bucket.scans += 1;
  }

  return [...buckets.values()];
}

export type PeriodComparison = {
  views: number;
  scans: number;
  viewsDeltaPct: number | null;
  scansDeltaPct: number | null;
};

function deltaPct(current: number, previous: number): number | null {
  // null covers both "no baseline to compare against" (previous=0, current>0)
  // and "nothing happened either period" (both 0) — neither has a meaningful
  // percentage to show.
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Totals for the last `days` days plus the percent change against the
 * preceding period of equal length (e.g. this 30 days vs the 30 days before
 * that) — `null` when there's no previous-period baseline to compare to,
 * since a percentage against zero is meaningless rather than "infinite".
 */
export async function getPeriodComparison(businessId: string, days: number): Promise<PeriodComparison> {
  const currentStart = new Date();
  currentStart.setUTCDate(currentStart.getUTCDate() - (days - 1));
  currentStart.setUTCHours(0, 0, 0, 0);
  const previousStart = new Date(currentStart);
  previousStart.setUTCDate(previousStart.getUTCDate() - days);

  const [current, previous] = await Promise.all([
    db.analyticsEvent.groupBy({
      by: ["type"],
      where: { businessId, createdAt: { gte: currentStart }, type: { in: ["view", "qr_scan"] } },
      _count: { _all: true },
    }),
    db.analyticsEvent.groupBy({
      by: ["type"],
      where: { businessId, createdAt: { gte: previousStart, lt: currentStart }, type: { in: ["view", "qr_scan"] } },
      _count: { _all: true },
    }),
  ]);

  const count = (rows: typeof current, type: string) =>
    rows.find((r) => r.type === type)?._count._all ?? 0;

  const views = count(current, "view");
  const scans = count(current, "qr_scan");
  const prevViews = count(previous, "view");
  const prevScans = count(previous, "qr_scan");

  return {
    views,
    scans,
    viewsDeltaPct: deltaPct(views, prevViews),
    scansDeltaPct: deltaPct(scans, prevScans),
  };
}
