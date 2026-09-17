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

// --- Admin panel icons ---

export function GridIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c.6-3.6 3-5.5 5.5-5.5S13.9 16.4 14.5 20" />
      <circle cx="17" cy="8.5" r="2.5" />
      <path d="M15.5 14.2c2.1.3 3.7 2 4.1 4.8" />
    </svg>
  );
}

export function BuildingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <rect x="5" y="3.5" width="10" height="17" rx="1.2" />
      <path d="M15 9.5h4v11h-4M8.3 7.5h1M11.7 7.5h1M8.3 11h1M11.7 11h1M8.3 14.5h1M11.7 14.5h1" />
    </svg>
  );
}

export function DocumentListIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M6 3.5h8l4 4V20a.8.8 0 01-.8.8H6a.8.8 0 01-.8-.8V4.3A.8.8 0 016 3.5z" />
      <path d="M14 3.5V8h4" />
      <path d="M8.3 12h7.4M8.3 15.3h7.4M8.3 18.6h4.5" />
    </svg>
  );
}

export function ChartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M4 20V4M4 20h16" />
      <path d="M7.5 17v-5M12 17V7.5M16.5 17v-3.5" />
    </svg>
  );
}

export function ActivityIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M3.5 12.5h3.2l2-5.7 3.2 11.4 2.2-8.2 1.6 2.5h4.3" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M17.6 6.4l-1.6 1.6M8 16l-1.6 1.6M17.6 17.6L16 16M8 8L6.4 6.4" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5l-4.3-4.3" />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M6 10a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10z" />
      <path d="M10 18.5a2 2 0 004 0" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M6 9.5l6 6 6-6" />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M9.5 20H5.8a.8.8 0 01-.8-.8V4.8a.8.8 0 01.8-.8h3.7" />
      <path d="M14.5 16.5l4.5-4.5-4.5-4.5" />
      <path d="M19 12H9.5" />
    </svg>
  );
}

export function DotsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M4 11.5L12 4l8 7.5" />
      <path d="M6 10v9.2a.8.8 0 00.8.8H10v-5.5h4V20h3.2a.8.8 0 00.8-.8V10" />
    </svg>
  );
}

export function UserCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="9.8" r="2.8" />
      <path d="M6.2 18.2c1.1-2.4 3.2-3.7 5.8-3.7s4.7 1.3 5.8 3.7" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`${base} ${className ?? ""}`} {...strokeProps}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
