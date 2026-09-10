import Link from "next/link";
import { formatNumber } from "@/lib/admin/format";
import { EmptyState } from "./empty-state";
import { BuildingIcon } from "@/components/ui/icons";

export type TopBusinessRow = { id: string; name: string; logoUrl: string | null; views: number };

export function TopBusinessesList({ businesses }: { businesses: TopBusinessRow[] }) {
  if (businesses.length === 0) {
    return <EmptyState title="Пока нет просмотров" description="Топ бизнесов появится, когда гости начнут открывать меню." />;
  }

  return (
    <ul className="flex flex-col gap-1">
      {businesses.map((business, index) => (
        <li key={business.id}>
          <Link
            href={`/admin/businesses/${business.id}`}
            className="flex items-center gap-3 rounded-lg px-1.5 py-2 transition hover:bg-[var(--admin-bg)]"
          >
            <span className="w-4 shrink-0 text-xs font-medium text-[var(--admin-muted)]">{index + 1}</span>
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local upload path, not worth next/image config for an admin panel
              <img src={business.logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--admin-bg)] text-[var(--admin-muted)]">
                <BuildingIcon className="h-4 w-4" />
              </span>
            )}
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--admin-ink)]">
              {business.name}
            </span>
            <span className="shrink-0 text-sm text-[var(--admin-muted)]">{formatNumber(business.views)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
