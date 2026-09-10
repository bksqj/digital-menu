import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Neon's serverless driver (WebSocket-based) instead of node-postgres: plain
// `pg` connections to Neon's pooler reliably hung/timed out here even though
// `psql` and raw TCP worked, so the app runtime goes through this driver
// instead. `prisma migrate`/`generate` are unaffected — they use Prisma's own
// engine binary (via DIRECT_URL in prisma.config.ts), not this file.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaUnhealthy?: boolean;
};

function createClient() {
  const adapter = new PrismaNeon(
    { connectionString: process.env.DATABASE_URL ?? "" },
    {
      // A dropped WebSocket leaves the adapter permanently unhealthy — it
      // never reconnects on its own — so every query after one network blip
      // would otherwise fail forever until the process restarts. Flag it
      // instead, and the proxy below rebuilds the client on the next call.
      onPoolError: () => {
        globalForPrisma.prismaUnhealthy = true;
      },
      onConnectionError: () => {
        globalForPrisma.prismaUnhealthy = true;
      },
    },
  );
  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma || globalForPrisma.prismaUnhealthy) {
    globalForPrisma.prisma = createClient();
    globalForPrisma.prismaUnhealthy = false;
  }
  return globalForPrisma.prisma;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
