export function UserAvatar({ name, email, size = 32 }: { name: string | null; email: string; size?: number }) {
  const initial = (name || email).charAt(0).toUpperCase();
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-[var(--admin-bg)] font-semibold text-[var(--admin-ink)]"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </span>
  );
}
