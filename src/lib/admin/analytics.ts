import { db } from "@/lib/db";
import type { MenuCreationPoint } from "./overview";

function daysAgo(days: number) {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function zeroFilledSeries(since: Date, days: number): Map<string, MenuCreationPoint> {
  const buckets = new Map<string, MenuCreationPoint>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key, count: 0 });
  }
  return buckets;
}

export async function getQrScansSeries(days: number): Promise<MenuCreationPoint[]> {
  const since = daysAgo(days - 1);
  const events = await db.analyticsEvent.findMany({
    where: { type: "qr_scan", createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const buckets = zeroFilledSeries(since, days);
  for (const e of events) buckets.get(e.createdAt.toISOString().slice(0, 10))!.count += 1;
  return [...buckets.values()];
}

export async function getAiUsageSeries(days: number): Promise<MenuCreationPoint[]> {
  const since = daysAgo(days - 1);
  const jobs = await db.uploadJob.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const buckets = zeroFilledSeries(since, days);
  for (const j of jobs) buckets.get(j.createdAt.toISOString().slice(0, 10))!.count += 1;
  return [...buckets.values()];
}
