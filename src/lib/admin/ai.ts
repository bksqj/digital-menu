import { db } from "@/lib/db";

const PAGE_SIZE = 20;

export async function getAiOverview() {
  const [total, done, failed, pending, doneJobs] = await Promise.all([
    db.uploadJob.count(),
    db.uploadJob.count({ where: { status: "DONE" } }),
    db.uploadJob.count({ where: { status: "FAILED" } }),
    db.uploadJob.count({ where: { status: { in: ["PENDING", "PROCESSING"] } } }),
    db.uploadJob.findMany({ where: { status: "DONE" }, select: { createdAt: true, updatedAt: true } }),
  ]);

  const successRate = total > 0 ? (done / total) * 100 : 0;
  const avgProcessingSeconds =
    doneJobs.length > 0
      ? doneJobs.reduce((sum, j) => sum + (j.updatedAt.getTime() - j.createdAt.getTime()) / 1000, 0) /
        doneJobs.length
      : 0;

  return { total, done, failed, pending, successRate, avgProcessingSeconds };
}

export type AiJobStatusFilter = "all" | "DONE" | "FAILED" | "PENDING" | "PROCESSING";

export async function getAiJobsList({ status = "all", page }: { status?: AiJobStatusFilter; page: number }) {
  const where = status === "all" ? {} : { status };

  const [total, jobs] = await Promise.all([
    db.uploadJob.count({ where }),
    db.uploadJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        status: true,
        sourceKeys: true,
        resultJson: true,
        error: true,
        createdAt: true,
        updatedAt: true,
        business: { select: { id: true, name: true } },
      },
    }),
  ]);

  return {
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    jobs: jobs.map((job) => {
      const result = job.resultJson as { categories?: { items?: unknown[] }[] } | null;
      const itemsDetected = result?.categories?.reduce((sum, c) => sum + (c.items?.length ?? 0), 0) ?? 0;
      const processingSeconds =
        job.status === "DONE" || job.status === "FAILED"
          ? (job.updatedAt.getTime() - job.createdAt.getTime()) / 1000
          : null;
      return {
        id: job.id,
        status: job.status,
        fileCount: job.sourceKeys.length,
        itemsDetected,
        error: job.error,
        createdAt: job.createdAt,
        processingSeconds,
        business: job.business,
      };
    }),
  };
}
