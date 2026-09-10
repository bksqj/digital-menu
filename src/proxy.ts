import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

// Session check for /dashboard routes, via the edge-safe authConfig (no
// `db` import) — see the comment in lib/auth/config.ts for why. Proxy
// itself defaults to the Node.js runtime as of Next.js 16, but keeping this
// split costs nothing and avoids relying on that staying true.
export const { auth: proxy } = NextAuth(authConfig);
export default proxy;

export const config = {
  matcher: ["/dashboard/:path*"],
};
