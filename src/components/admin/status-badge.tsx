const VARIANTS = {
  success: "bg-[color:#ecfccb] text-[color:#4d7c0f]",
  neutral: "bg-[var(--admin-bg)] text-[var(--admin-muted)]",
  danger: "bg-red-50 text-red-600",
  warning: "bg-amber-50 text-amber-700",
} as const;

export function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: keyof typeof VARIANTS;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}>
      {label}
    </span>
  );
}
