import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

// Edge-runtime session check only — see the comment in lib/auth/config.ts
// for why this can't just import the full auth() from lib/auth.
export const { auth: middleware } = NextAuth(authConfig);
export default middleware;

export const config = {
  matcher: ["/dashboard/:path*"],
};
