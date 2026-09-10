import { getActivityFeed, type ActivityKind } from "@/lib/admin/activity";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { FilterPills } from "@/components/admin/filter-pills";
import { Pagination } from "@/components/admin/pagination";

const KIND_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "user_registered", label: "Регистрации" },
  { value: "business_created", label: "Бизнесы" },
  { value: "menu_published", label: "Публикации" },
  { value: "ai_processed", label: "AI" },
  { value: "qr_generated", label: "QR" },
  { value: "admin_action", label: "Действия админа" },
];

const PAGE_SIZE = 20;

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; page?: string }>;
}) {
  const { kind: kindParam, page: pageParam } = await searchParams;
  const kind = KIND_OPTIONS.some((o) => o.value === kindParam) ? (kindParam as ActivityKind | "all") : "all";
  const page = Math.max(1, Number(pageParam) || 1);

  const allEntries = await getActivityFeed(kind === "all" ? {} : { kind });
  const totalPages = Math.max(1, Math.ceil(allEntries.length / PAGE_SIZE));
  const pageEntries = allEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-ink)]">Активность</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Журнал событий платформы и действий администраторов.
        </p>
      </div>

      <FilterPills options={KIND_OPTIONS} active={kind} basePath="/admin/activity" paramName="kind" />

      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
        <ActivityFeed entries={pageEntries} />
        <Pagination
          page={page}
          totalPages={totalPages}
          basePath="/admin/activity"
          searchParams={{ kind: kind !== "all" ? kind : undefined }}
        />
      </div>
    </div>
  );
}
