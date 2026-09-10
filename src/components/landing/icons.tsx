// Minimal 24x24 line icons, hand-drawn to match the landing page's visual
// language without pulling in an icon library dependency.
type IconProps = { className?: string };

const base = "stroke-current fill-none";
const strokeProps = { strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function UploadIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M12 15V8M12 8L8.5 11.5M12 8l3.5 3.5" />
    </svg>
  );
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M12 4l1.6 4.9L18.5 10.4l-4.9 1.6L12 17l-1.6-4.9L5.5 10.4l4.9-1.6L12 4z" />
      <path d="M19 4.5l.6 1.8 1.9.6-1.9.6-.6 1.8-.6-1.8-1.9-.6 1.9-.6z" />
    </svg>
  );
}

export function LinkQrIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1.2" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1.2" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1.2" />
      <path d="M14.5 15h2.7M14.5 19h6M20.5 15v6" />
    </svg>
  );
}

export function PencilIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M14.2 5.3l4.5 4.5L8.2 20.3l-4.9.6.6-4.9L14.2 5.3z" />
      <path d="M12.4 7.1l4.5 4.5" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="3" />
      <path d="M10.5 18.5h3" />
    </svg>
  );
}

export function BoltIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M12.5 2.5L4.5 13.5h6l-1 8 8.5-11h-6l0.5-8z" />
    </svg>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M9.5 14.5l5-5" />
      <path d="M11 6.5l1.4-1.4a4 4 0 015.6 5.6L16.6 12" />
      <path d="M13 17.5l-1.4 1.4a4 4 0 01-5.6-5.6L7.4 12" />
    </svg>
  );
}
