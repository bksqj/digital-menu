import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Second, independent check behind the proxy's edge-level gate on /admin —
 * every admin page and every admin server action calls this itself rather
 * than trusting the proxy alone (the proxy's role check can be stale: JWT
 * strategy means a role/suspension change doesn't invalidate an existing
 * session until next login). Never rely on this being reachable only
 * because a link is hidden in the UI.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return { id: session.user.id, email: session.user.email as string };
}
