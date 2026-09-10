import { defineConfig, env } from "prisma/config";

// Prisma 7's config loader does not auto-load .env (unlike the old
// schema-based flow) — load it explicitly so `env("DATABASE_URL")` below
// can resolve during `prisma generate`/`migrate`.
try {
  process.loadEnvFile();
} catch {
  // no .env file yet — fine for a fresh checkout before Phase 2 sets one up
}

// Prisma 7 config: the CLI (migrate/studio/db push) reads the connection
// string from here, while the runtime PrismaClient gets it via the driver
// adapter in src/lib/db/index.ts. Both read DATABASE_URL — one source of truth.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Neon: pooled URL for the app, direct URL for migrations (PgBouncer
    // doesn't support the DDL/prepared-statement flow `migrate` needs).
    url: env("DIRECT_URL"),
  },
});
