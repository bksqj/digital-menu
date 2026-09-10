import Link from "next/link";
import type { PlatformActivityPoint } from "@/lib/admin/overview";

const RANGE_OPTIONS = [
  { value: 7, label: "7 дней" },
  { value: 30, label: "30 дней" },
  { value: 90, label: "90 дней" },
  { value: 365, label: "1 год" },
];

const SERIES = [
  { key: "users" as const, label: "Пользователи", color: "#65a30d" },
  { key: "businesses" as const, label: "Бизнесы", color: "#161616" },
  { key: "views" as const, label: "Просмотры", color: "#c8ff00" },
];

const WIDTH = 640;
const HEIGHT = 180;
const PADDING = 8;

function buildPath(points: PlatformActivityPoint[], key: "users" | "businesses" | "views", max: number) {
  if (points.length < 2) return "";
  const stepX = (WIDTH - PADDING * 2) / (points.length - 1);
  return points
    .map((point, index) => {
      const x = PADDING + index * stepX;
      const y = max === 0 ? HEIGHT - PADDING : HEIGHT - PADDING - (point[key] / max) * (HEIGHT - PADDING * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function PlatformActivityChart({
  data,
  range,
  basePath,
}: {
  data: PlatformActivityPoint[];
  range: number;
  basePath: string;
}) {
  const max = Math.max(1, ...data.flatMap((d) => [d.users, d.businesses, d.views]));
  const isEmpty = data.every((d) => d.users === 0 && d.businesses === 0 && d.views === 0);

  return (
    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--admin-ink)]">Активность платформы</h2>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--admin-muted)]">
            {SERIES.map((series) => (
              <span key={series.key} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: series.color }} />
                {series.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-1 rounded-lg border border-[var(--admin-border)] p-0.5">
          {RANGE_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={`${basePath}?range=${option.value}`}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                range === option.value
                  ? "bg-[var(--admin-dark)] text-white"
                  : "text-[var(--admin-muted)] hover:text-[var(--admin-ink)]"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className="mt-6 flex h-[180px] items-center justify-center text-sm text-[var(--admin-muted)]">
          Пока нет данных за этот период.
        </div>
      ) : (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-4 h-[180px] w-full" preserveAspectRatio="none">
          {SERIES.map((series) => (
            <path
              key={series.key}
              d={buildPath(data, series.key, max)}
              fill="none"
              stroke={series.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      )}
    </div>
  );
}
