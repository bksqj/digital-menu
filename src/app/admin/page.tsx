import { getStorageAdapter } from "@/lib/storage";
import {
  getPlatformKpis,
  getPlatformActivitySeries,
  getMenuCreationSeries,
  getAiStats,
  getRecentActivity,
  getTopBusinessesByViews,
  getRecentUsers,
} from "@/lib/admin/overview";
import { KpiCard } from "@/components/admin/kpi-card";
import { PlatformActivityChart } from "@/components/admin/platform-activity-chart";
import { MenuCreationChart } from "@/components/admin/menu-creation-chart";
import { AiStatsCard } from "@/components/admin/ai-stats-card";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { TopBusinessesList } from "@/components/admin/top-businesses-list";
import { RecentUsersTable } from "@/components/admin/recent-users-table";
import {
  UsersIcon,
  BuildingIcon,
  DocumentListIcon,
  LinkIcon,
  LinkQrIcon,
  SparkleIcon,
} from "@/components/ui/icons";

const VALID_RANGES = [7, 30, 90, 365];

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range = VALID_RANGES.includes(Number(rangeParam)) ? Number(rangeParam) : 30;

  const [kpis, activitySeries, menuSeries, aiStats, activity, topBusinesses, recentUsers] = await Promise.all([
    getPlatformKpis(),
    getPlatformActivitySeries(range),
    getMenuCreationSeries(range),
    getAiStats(),
    getRecentActivity(6),
    getTopBusinessesByViews(5),
    getRecentUsers(5),
  ]);

  const storage = getStorageAdapter();
  const topBusinessesWithLogos = topBusinesses.map((b) => ({
    ...b,
    logoUrl: b.logoUrl ? storage.getUrl(b.logoUrl) : null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-ink)]">Добро пожаловать в Admin</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">
          Здесь вы можете управлять платформой Digital Menu.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard icon={UsersIcon} label="Пользователи" value={kpis.totalUsers} delta={kpis.newUsers30d} />
        <KpiCard icon={BuildingIcon} label="Бизнесы" value={kpis.totalBusinesses} delta={kpis.newBusinesses30d} />
        <KpiCard
          icon={DocumentListIcon}
          label="Опубликованные меню"
          value={kpis.publishedMenus}
          delta={kpis.newPublishedMenus30d}
        />
        <KpiCard icon={LinkIcon} label="Просмотры меню" value={kpis.totalViews} delta={kpis.newViews30d} />
        <KpiCard icon={LinkQrIcon} label="QR-сканирования" value={kpis.totalScans} delta={kpis.newScans30d} />
        <KpiCard icon={SparkleIcon} label="AI-запросы" value={kpis.aiProcessed} delta={kpis.newAiProcessed30d} />
        <KpiCard icon={DocumentListIcon} label="Создано меню сегодня" value={kpis.menusCreatedToday} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlatformActivityChart data={activitySeries} range={range} basePath="/admin" />
        </div>
        <MenuCreationChart data={menuSeries} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Последние пользователи</h2>
            <RecentUsersTable users={recentUsers} />
          </div>
          <AiStatsCard {...aiStats} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Последняя активность</h2>
            <ActivityFeed entries={activity} />
          </div>
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold text-[var(--admin-ink)]">Топ бизнесы по просмотрам</h2>
            <TopBusinessesList businesses={topBusinessesWithLogos} />
          </div>
        </div>
      </div>
    </div>
  );
}
