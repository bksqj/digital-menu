import type { MenuCreationPoint } from "@/lib/admin/overview";

export function MenuCreationChart({ data, title = "Создание меню" }: { data: MenuCreationPoint[]; title?: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const isEmpty = data.every((d) => d.count === 0);

  return (
    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-[var(--admin-ink)]">{title}</h2>
      {isEmpty ? (
        <div className="mt-4 flex h-[180px] items-center justify-center text-sm text-[var(--admin-muted)]">
          Пока нет данных за этот период.
        </div>
      ) : (
        <div className="mt-4 flex h-[180px] items-end gap-1">
          {data.map((day) => (
            <div key={day.date} className="group relative flex h-full flex-1 items-end">
              <div
                className="w-full rounded-sm bg-[var(--admin-accent)] transition-opacity group-hover:opacity-80"
                style={{ height: `${Math.max(2, (day.count / max) * 100)}%`, opacity: day.count === 0 ? 0.2 : 1 }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 hidden -translate-x-1/2 rounded-md bg-[var(--admin-dark)] px-2 py-1 text-[10px] whitespace-nowrap text-white group-hover:block">
                {day.date}: {day.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
