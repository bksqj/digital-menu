import Link from "next/link";
import { getAiOverview, getAiJobsList, type AiJobStatusFilter } from "@/lib/admin/ai";
import { StatusBadge } from "@/components/admin/status-badge";
import { FilterPills } from "@/components/admin/filter-pills";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { formatNumber, formatRelativeTime } from "@/lib/admin/format";
import { SparkleIcon } from "@/components/ui/icons";

const STATUS_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "DONE", label: "Успешно" },
  { value: "FAILED", label: "Ошибка" },
  { value: "PROCESSING", label: "В процессе" },
];

export default async function AdminAiPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status: statusParam, page: pageParam } = await searchParams;
  const status: AiJobStatusFilter =
    statusParam === "DONE" || statusParam === "FAILED" || statusParam === "PROCESSING" || statusParam === "PENDING"
      ? statusParam
      : "all";
  const page = Math.max(1, Number(pageParam) || 1);

  const [overview, { jobs, total, totalPages }] = await Promise.all([
    getAiOverview(),
    getAiJobsList({ status, page }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-ink)]">AI / OCR</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Мониторинг распознавания меню через Gemini vision.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
          <p className="text-2xl font-bold text-[var(--admin-ink)]">{formatNumber(overview.total)}</p>
          <p className="text-xs text-[var(--admin-muted)]">AI processing</p>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
          <p className="text-2xl font-bold text-[var(--admin-ink)]">
            {overview.total === 0 ? "—" : `${overview.successRate.toFixed(1)}%`}
          </p>
          <p className="text-xs text-[var(--admin-muted)]">Success rate</p>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
          <p className="text-2xl font-bold text-[var(--admin-ink)]">
            {overview.total === 0 ? "—" : `${overview.avgProcessingSeconds.toFixed(1)} сек`}
          </p>
          <p className="text-xs text-[var(--admin-muted)]">Average processing time</p>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
          <p className="text-2xl font-bold text-[var(--admin-ink)]">{formatNumber(overview.failed)}</p>
          <p className="text-xs text-[var(--admin-muted)]">Failed parses</p>
        </div>
      </div>

      <FilterPills options={STATUS_OPTIONS} active={status} basePath="/admin/ai" />

      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Recent AI processing · {total}</h2>
        {jobs.length === 0 ? (
          <EmptyState icon={SparkleIcon} title="Пока нет истории распознавания" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--admin-muted)]">
                  <th className="pb-2 font-medium">Бизнес</th>
                  <th className="pb-2 font-medium">Файлов</th>
                  <th className="pb-2 font-medium">Найдено позиций</th>
                  <th className="pb-2 font-medium">Статус</th>
                  <th className="pb-2 font-medium">Время обработки</th>
                  <th className="pb-2 font-medium">Создано</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="py-2.5 pr-3">
                      <Link href={`/admin/businesses/${job.business.id}`} className="font-medium text-[var(--admin-ink)] hover:underline">
                        {job.business.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3 text-[var(--admin-ink)]">{job.fileCount}</td>
                    <td className="py-2.5 pr-3 text-[var(--admin-ink)]">{job.itemsDetected}</td>
                    <td className="py-2.5 pr-3">
                      {job.status === "DONE" && <StatusBadge label="Success" variant="success" />}
                      {job.status === "FAILED" && <StatusBadge label="Failed" variant="danger" />}
                      {(job.status === "PENDING" || job.status === "PROCESSING") && (
                        <StatusBadge label="Processing" variant="warning" />
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-[var(--admin-ink)]">
                      {job.processingSeconds !== null ? `${job.processingSeconds.toFixed(1)} сек` : "—"}
                    </td>
                    <td className="py-2.5 whitespace-nowrap text-[var(--admin-muted)]">
                      {formatRelativeTime(job.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          basePath="/admin/ai"
          searchParams={{ status: status !== "all" ? status : undefined }}
        />
      </div>
    </div>
  );
}
