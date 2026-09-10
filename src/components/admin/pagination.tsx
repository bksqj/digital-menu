import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams ?? {})) {
      if (value) params.set(key, value);
    }
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between gap-3 pt-3 text-sm text-[var(--admin-muted)]">
      <span>
        Страница {page} из {totalPages}
      </span>
      <div className="flex gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`rounded-lg border border-[var(--admin-border)] px-3 py-1.5 font-medium transition ${
            page <= 1 ? "pointer-events-none opacity-40" : "text-[var(--admin-ink)] hover:border-[var(--admin-ink)]"
          }`}
        >
          Назад
        </Link>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`rounded-lg border border-[var(--admin-border)] px-3 py-1.5 font-medium transition ${
            page >= totalPages
              ? "pointer-events-none opacity-40"
              : "text-[var(--admin-ink)] hover:border-[var(--admin-ink)]"
          }`}
        >
          Вперёд
        </Link>
      </div>
    </div>
  );
}
