import {
  getPlatformKpis,
  getPlatformActivitySeries,
  getMenuCreationSeries,
} from "@/lib/admin/overview";
import { getQrScansSeries, getAiUsageSeries } from "@/lib/admin/analytics";
import { KpiCard } from "@/components/admin/kpi-card";
import { PlatformActivityChart } from "@/components/admin/platform-activity-chart";
import { MenuCreationChart } from "@/components/admin/menu-creation-chart";
import { UsersIcon, BuildingIcon, DocumentListIcon, LinkIcon, LinkQrIcon, SparkleIcon } from "@/components/ui/icons";

const VALID_RANGES = [7, 30, 90, 365];

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range = VALID_RANGES.includes(Number(rangeParam)) ? Number(rangeParam) : 30;

  const [kpis, activitySeries, menuSeries, qrSeries, aiSeries] = await Promise.all([
    getPlatformKpis(),
    getPlatformActivitySeries(range),
    getMenuCreationSeries(range),
    getQrScansSeries(range),
    getAiUsageSeries(range),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-ink)]">Аналитика</h1>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">Сводная статистика по всей платформе.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
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
      </div>

      <PlatformActivityChart data={activitySeries} range={range} basePath="/admin/analytics" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MenuCreationChart data={menuSeries} title="Создание меню" />
        <MenuCreationChart data={qrSeries} title="QR-сканирования" />
        <MenuCreationChart data={aiSeries} title="Использование AI" />
      </div>
    </div>
  );
}
