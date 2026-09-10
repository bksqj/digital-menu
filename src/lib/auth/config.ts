import type { NextAuthConfig } from "next-auth";

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
      const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      return isDashboard ? !!auth?.user : true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
};
