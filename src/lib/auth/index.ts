import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "./config";

/**
 * Email+password auth via Auth.js Credentials provider. Deliberately the
 * simplest thing that's still secure: bcrypt-hashed passwords, no custom
 * crypto, no session code of our own to get wrong.
 *
 * This is the full config (imports `db`) — Node runtime only. Middleware
 * uses the edge-safe `authConfig` from ./config directly instead.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Checked at login, not per-request — an admin suspending someone
        // mid-session won't kick them out immediately (JWT strategy has no
        // server-side session to revoke), but blocks every new sign-in.
        if (user.suspended) return null;

        // Fire-and-forget: powers the admin "last active" column. Not
        // awaited — a slow write here shouldn't add latency to every login.
        db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => {});

        return { id: user.id, email: user.email, name: user.name ?? undefined, role: user.role };
      },
    }),
  ],
});
