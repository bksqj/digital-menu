import { getStore } from "@netlify/blobs";

// Serves files from Netlify Blobs — only reachable in production, since
// lib/storage only points getUrl() here when NETLIFY is set (see
// lib/storage/index.ts). Local dev serves public/uploads directly instead.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const store = getStore("digital-menu-uploads");
  const result = await store.getWithMetadata(key.join("/"), { type: "arrayBuffer" });
  if (!result) return new Response("Not found", { status: 404 });

  const contentType = (result.metadata?.contentType as string) || "application/octet-stream";
  return new Response(result.data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
