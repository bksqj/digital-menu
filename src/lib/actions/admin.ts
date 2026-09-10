"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";

async function writeAuditLog(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, Prisma.JsonValue>,
) {
  await db.auditLog.create({
    data: { adminId, action, targetType, targetId, metadata: metadata as Prisma.InputJsonValue },
  });
}

export async function setUserRoleAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (role !== "USER" && role !== "ADMIN") redirect(`/admin/users/${userId}`);

  // An admin can't strip their own access — the only way back in would be a
  // direct SQL update, same as bootstrapping the very first admin.
  if (userId === admin.id) redirect(`/admin/users/${userId}?error=self_role`);

  const target = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target) redirect("/admin/users");

  await db.user.update({ where: { id: userId }, data: { role } });
  await writeAuditLog(admin.id, "user.role_changed", "User", userId, { from: target.role, to: role });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function suspendUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (userId === admin.id) redirect(`/admin/users/${userId}?error=self_suspend`);

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) redirect("/admin/users");

  await db.user.update({ where: { id: userId }, data: { suspended: true } });
  await writeAuditLog(admin.id, "user.suspended", "User", userId, { email: target.email });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function restoreUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");

  const target = await db.user.findUnique({ where: { id: userId } });
  if (!target) redirect("/admin/users");

  await db.user.update({ where: { id: userId }, data: { suspended: false } });
  await writeAuditLog(admin.id, "user.restored", "User", userId, { email: target.email });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function updatePlatformSettingsAction(formData: FormData) {
  const admin = await requireAdmin();

  const data = {
    platformName: String(formData.get("platformName") ?? "Digital Menu").trim() || "Digital Menu",
    supportEmail: String(formData.get("supportEmail") ?? "").trim() || null,
    registrationEnabled: formData.get("registrationEnabled") === "on",
    aiEnabled: formData.get("aiEnabled") === "on",
    analyticsEnabled: formData.get("analyticsEnabled") === "on",
  };

  await db.platformSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });
  await writeAuditLog(admin.id, "settings.updated", "PlatformSettings", "singleton", data);

  revalidatePath("/admin/settings");
}
