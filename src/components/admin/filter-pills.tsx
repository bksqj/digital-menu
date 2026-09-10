import Link from "next/link";

export function FilterPills({
  options,
  active,
  basePath,
  searchParams,
  paramName = "status",
}: {
  options: { value: string; label: string }[];
  active: string;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
  paramName?: string;
}) {
  function hrefFor(value: string) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(searchParams ?? {})) {
      if (val && key !== paramName) params.set(key, val);
    }
    if (value !== "all") params.set(paramName, value);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--admin-border)] p-0.5">
      {options.map((option) => (
        <Link
          key={option.value}
          href={hrefFor(option.value)}
          className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
            active === option.value
              ? "bg-[var(--admin-dark)] text-white"
              : "text-[var(--admin-muted)] hover:text-[var(--admin-ink)]"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
