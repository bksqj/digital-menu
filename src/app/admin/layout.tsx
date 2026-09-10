import { requireAdmin } from "@/lib/auth/require-admin";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  return <AdminShell adminEmail={admin.email}>{children}</AdminShell>;
}
