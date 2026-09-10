import { getStore } from "@netlify/blobs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Serves files from Netlify Blobs — only reachable in production, since
// lib/storage only points getUrl() here when NETLIFY is set (see
// lib/storage/index.ts). Local dev serves public/uploads directly instead.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;

  // logos/ and qr/ are meant to be public — they're embedded in the
  // unauthenticated /m/:slug page and downloaded from the QR page without
  // login. menus/ (the raw photos a menu was OCR'd from) is not: only the
  // owning business's owner should be able to read them back.
  if (key[0] === "menus") {
    const menuId = key[1];
    const session = await auth();
    const menu = menuId
      ? await db.menu.findUnique({ where: { id: menuId }, select: { business: { select: { ownerId: true } } } })
      : null;
    if (!session?.user?.id || !menu || menu.business.ownerId !== session.user.id) {
      return new Response("Not found", { status: 404 });
    }
  }

  const store = getStore("digital-menu-uploads");
  const result = await store.getWithMetadata(key.join("/"), { type: "arrayBuffer" });
  if (!result) return new Response("Not found", { status: 404 });

  const contentType = (result.metadata?.contentType as string) || "application/octet-stream";
  // menus/ is owner-gated above — "public" here would let a shared/CDN
  // cache serve one owner's already-authorized response straight to a
  // different, unauthenticated requester on a later request for the same
  // key, skipping the auth check above entirely.
  const cacheControl =
    key[0] === "menus"
      ? "private, no-store"
      : "public, max-age=31536000, immutable";
  return new Response(result.data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
    },
  });
}
