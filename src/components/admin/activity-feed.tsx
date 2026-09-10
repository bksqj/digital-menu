import { formatRelativeTime } from "@/lib/admin/format";
import { EmptyState } from "./empty-state";
import {
  UsersIcon,
  BuildingIcon,
  DocumentListIcon,
  SparkleIcon,
  LinkQrIcon,
  SettingsIcon,
} from "@/components/ui/icons";

const ICONS: Record<string, typeof UsersIcon> = {
  user_registered: UsersIcon,
  business_created: BuildingIcon,
  menu_published: DocumentListIcon,
  ai_processed: SparkleIcon,
  qr_generated: LinkQrIcon,
  admin_action: SettingsIcon,
};

type ActivityEntry = { id: string; kind: string; title: string; subtitle: string; createdAt: Date };

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return <EmptyState title="Пока нет активности" description="Здесь появятся события платформы." />;
  }

  return (
    <ul className="flex flex-col gap-3">
      {entries.map((entry) => {
        const Icon = ICONS[entry.kind] ?? SettingsIcon;
        return (
          <li key={entry.id} className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-bg)] text-[var(--admin-ink)]">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--admin-ink)]">{entry.title}</p>
              <p className="truncate text-xs text-[var(--admin-muted)]">{entry.subtitle}</p>
            </div>
            <span className="shrink-0 text-xs whitespace-nowrap text-[var(--admin-muted)]">
              {formatRelativeTime(entry.createdAt)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
