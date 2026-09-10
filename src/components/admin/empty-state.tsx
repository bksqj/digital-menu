import type { ComponentType, ReactNode } from "react";
import { DocumentListIcon } from "@/components/ui/icons";

export function EmptyState({
  title,
  description,
  icon: Icon = DocumentListIcon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--admin-bg)] text-[var(--admin-muted)]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-[var(--admin-ink)]">{title}</p>
      {description && <p className="max-w-xs text-xs text-[var(--admin-muted)]">{description}</p>}
      {action}
    </div>
  );
}
