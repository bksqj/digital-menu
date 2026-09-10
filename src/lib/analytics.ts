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
