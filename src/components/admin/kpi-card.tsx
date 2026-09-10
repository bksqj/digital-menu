import type { ComponentType } from "react";
import { formatNumber } from "@/lib/admin/format";

export function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaLabel = "за 30 дней",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  delta?: number;
  deltaLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--admin-bg)] text-[var(--admin-ink)]">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm text-[var(--admin-muted)]">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--admin-ink)]">{formatNumber(value)}</p>
      {delta !== undefined && (
        <p className="mt-1 text-xs text-[var(--admin-muted)]">
          {delta > 0 && (
            <span className="font-medium text-[color:#4d7c0f]">+{formatNumber(delta)}</span>
          )}
          {delta === 0 && <span>0</span>}
          {" "}
          {deltaLabel}
        </p>
      )}
    </div>
  );
}
