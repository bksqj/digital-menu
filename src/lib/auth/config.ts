import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * Edge-safe subset of the auth config — no providers, no `db` import.
 * Middleware runs on the Edge runtime, which can't load `pg` (Node sockets),
 * so it uses this config (via NextAuth(authConfig).auth) instead of the full
 * one in `./index.ts`. Both must agree on `session`/`pages`/`callbacks`.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  // Behind Netlify's proxy the request's Host header is the real public
  // host, not something spoofable by the client — Auth.js just doesn't know
  // that by default and throws UntrustedHost without this.
  trustHost: true,
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      // /admin needs the ADMIN role, not just a session — checked again on
      // every admin page/action server-side (see requireAdmin()), since the
      // role here is only as fresh as the last login (JWT strategy, no
      // server-side session store to invalidate on a role/suspension change).
      if (pathname.startsWith("/admin")) {
        if (!auth?.user) return false; // no session — NextAuth sends this to /login
        // Logged in but not an admin: send them somewhere they can actually
        // use, not back to a login page they're already past.
        if (auth.user.role !== "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return true;
      }
      if (pathname.startsWith("/dashboard")) return !!auth?.user;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole | undefined) ?? "USER";
      }
      return session;
    },
  },
};
