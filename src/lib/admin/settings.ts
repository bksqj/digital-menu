import { db } from "@/lib/db";

const SINGLETON_ID = "singleton";

/** Auto-creates the singleton row on first read — no seed migration needed,
 * and every field already has a schema default matching current behavior. */
export async function getPlatformSettings() {
  return db.platformSettings.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID },
    update: {},
  });
}
