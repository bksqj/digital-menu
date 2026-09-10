import type { DailyStat } from "@/lib/analytics";

const DATE_FORMATTER = new Intl.DateTimeFormat("ru", { day: "numeric", month: "short", timeZone: "UTC" });

function formatShortDate(isoDate: string) {
  return DATE_FORMATTER.format(new Date(`${isoDate}T00:00:00Z`));
}

export function AnalyticsChart({ stats }: { stats: DailyStat[] }) {
  const max = Math.max(1, ...stats.flatMap((day) => [day.views, day.scans]));

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--color-ink)]">
          Просмотры и сканы за {stats.length} дней
        </p>
        <div className="flex items-center gap-3 text-xs text-[var(--color-subtle)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" /> Просмотры
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--color-ink)]" /> QR
          </span>
        </div>
      </div>

      <div className="flex h-24 items-end gap-1">
        {stats.map((day) => (
          <div
            key={day.date}
            className="group relative flex h-full flex-1 items-end justify-center gap-0.5"
          >
            <div
              className="w-full rounded-sm bg-[var(--color-accent)] transition-opacity group-hover:opacity-80"
              style={{ height: `${Math.max(2, (day.views / max) * 100)}%`, opacity: day.views === 0 ? 0.15 : 1 }}
            />
            <div
              className="w-full rounded-sm bg-[var(--color-ink)] transition-opacity group-hover:opacity-80"
              style={{ height: `${Math.max(2, (day.scans / max) * 100)}%`, opacity: day.scans === 0 ? 0.15 : 1 }}
            />
            <span className="pointer-events-none absolute bottom-full mb-1.5 hidden whitespace-nowrap rounded-md bg-[var(--color-ink)] px-2 py-1 text-[10px] text-white group-hover:block">
              {formatShortDate(day.date)}: {day.views} просмотров, {day.scans} сканов
            </span>
          </div>
        ))}
      </div>

      <div className="mt-1.5 flex justify-between text-[10px] text-[var(--color-subtle)]">
        <span>{formatShortDate(stats[0].date)}</span>
        <span>{formatShortDate(stats[stats.length - 1].date)}</span>
      </div>
    </div>
  );
}
