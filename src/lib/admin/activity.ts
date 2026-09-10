import { db } from "@/lib/db";

export type ActivityKind =
  | "user_registered"
  | "business_created"
  | "menu_published"
  | "ai_processed"
  | "qr_generated"
  | "admin_action";

export type ActivityRow = {
  id: string;
  kind: ActivityKind;
  title: string;
  subtitle: string;
  createdAt: Date;
};

const FETCH_LIMIT = 60;

/** Same "no dedicated event log for ordinary activity" approach as the
 * overview feed (see AuditLog's schema comment), just pulling more rows
 * and adding admin-initiated actions from AuditLog, which — unlike the
 * others — has no other data source at all. */
export async function getActivityFeed({ kind }: { kind?: ActivityKind } = {}) {
  const [users, businesses, publishedMenus, aiJobs, qrCodes, auditLogs] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: FETCH_LIMIT,
      select: { id: true, email: true, createdAt: true },
    }),
    db.business.findMany({
      orderBy: { createdAt: "desc" },
      take: FETCH_LIMIT,
      select: { id: true, name: true, createdAt: true },
    }),
    db.menu.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      take: FETCH_LIMIT,
      select: { id: true, updatedAt: true, business: { select: { name: true } } },
    }),
    db.uploadJob.findMany({
      where: { status: "DONE" },
      orderBy: { updatedAt: "desc" },
      take: FETCH_LIMIT,
      select: { id: true, updatedAt: true, business: { select: { name: true } } },
    }),
    db.qrCode.findMany({
      orderBy: { createdAt: "desc" },
      take: FETCH_LIMIT,
      select: { id: true, createdAt: true, business: { select: { name: true } } },
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: FETCH_LIMIT,
      select: { id: true, action: true, createdAt: true, admin: { select: { email: true } }, metadata: true },
    }),
  ]);

  const entries: ActivityRow[] = [
    ...users.map((u) => ({
      id: `user-${u.id}`,
      kind: "user_registered" as const,
      title: "Новый пользователь",
      subtitle: u.email,
      createdAt: u.createdAt,
    })),
    ...businesses.map((b) => ({
      id: `business-${b.id}`,
      kind: "business_created" as const,
      title: "Новый бизнес создан",
      subtitle: b.name,
      createdAt: b.createdAt,
    })),
    ...publishedMenus.map((m) => ({
      id: `menu-${m.id}`,
      kind: "menu_published" as const,
      title: "Меню опубликовано",
      subtitle: m.business.name,
      createdAt: m.updatedAt,
    })),
    ...aiJobs.map((j) => ({
      id: `ai-${j.id}`,
      kind: "ai_processed" as const,
      title: "Обработано AI",
      subtitle: j.business.name,
      createdAt: j.updatedAt,
    })),
    ...qrCodes.map((q) => ({
      id: `qr-${q.id}`,
      kind: "qr_generated" as const,
      title: "QR-код сгенерирован",
      subtitle: q.business.name,
      createdAt: q.createdAt,
    })),
    ...auditLogs.map((a) => ({
      id: `audit-${a.id}`,
      kind: "admin_action" as const,
      title: describeAuditAction(a.action),
      subtitle: a.admin.email,
      createdAt: a.createdAt,
    })),
  ];

  const filtered = kind ? entries.filter((e) => e.kind === kind) : entries;
  return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function describeAuditAction(action: string) {
  switch (action) {
    case "user.role_changed":
      return "Админ изменил роль пользователя";
    case "user.suspended":
      return "Админ заблокировал пользователя";
    case "user.restored":
      return "Админ восстановил доступ пользователю";
    default:
      return action;
  }
}
