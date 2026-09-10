import { SearchIcon } from "@/components/ui/icons";

export function SearchInput({
  action,
  defaultValue,
  placeholder,
  hiddenFields,
}: {
  action: string;
  defaultValue?: string;
  placeholder: string;
  hiddenFields?: Record<string, string | undefined>;
}) {
  return (
    <form action={action} method="get" className="relative max-w-sm flex-1">
      {hiddenFields &&
        Object.entries(hiddenFields).map(
          ([key, value]) => value && <input key={key} type="hidden" name={key} value={value} />,
        )}
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--admin-muted)]" />
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card)] py-2 pr-3 pl-9 text-sm text-[var(--admin-ink)] outline-none focus:border-[var(--admin-ink)]"
      />
    </form>
  );
}
