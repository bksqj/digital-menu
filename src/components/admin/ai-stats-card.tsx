import Link from "next/link";
import { formatNumber } from "@/lib/admin/format";

export function AiStatsCard({
  total,
  done,
  failed,
  successRate,
  avgProcessingSeconds,
}: {
  total: number;
  done: number;
  failed: number;
  successRate: number;
  avgProcessingSeconds: number;
}) {
  const pct = Math.round(successRate);

  return (
    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--admin-ink)]">Статистика AI / OCR</h2>
        <Link href="/admin/ai" className="text-xs font-medium text-[var(--admin-muted)] hover:text-[var(--admin-ink)]">
          Детали
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-5">
        <div
          className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
          style={{
            background:
              total === 0
                ? "conic-gradient(var(--admin-border) 0deg 360deg)"
                : `conic-gradient(var(--admin-accent) ${pct * 3.6}deg, var(--admin-border) ${pct * 3.6}deg 360deg)`,
          }}
        >
          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-[var(--admin-card)]">
            <span className="text-base font-bold text-[var(--admin-ink)]">{total === 0 ? "—" : `${pct}%`}</span>
          </div>
        </div>

        <dl className="flex-1 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--admin-muted)]">Запросы к AI</dt>
            <dd className="font-medium text-[var(--admin-ink)]">{formatNumber(total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--admin-muted)]">Успешных</dt>
            <dd className="font-medium text-[var(--admin-ink)]">{formatNumber(done)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--admin-muted)]">Ошибок</dt>
            <dd className="font-medium text-[var(--admin-ink)]">{formatNumber(failed)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--admin-muted)]">Среднее время</dt>
            <dd className="font-medium text-[var(--admin-ink)]">
              {total === 0 ? "—" : `${avgProcessingSeconds.toFixed(1)} сек`}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
