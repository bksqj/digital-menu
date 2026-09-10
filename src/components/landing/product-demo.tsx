import { UploadIcon, SparkleIcon } from "./icons";
import { PhoneMockup } from "./phone-mockup";
import { QrMockup } from "./qr-mockup";

function FlowArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 rotate-90 text-[var(--color-line)] md:rotate-0"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
      fill="none"
      aria-hidden
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

const CHECKS = ["Категории", "Блюда", "Цены"];

export function ProductDemo() {
  return (
    <section aria-label="Как выглядит процесс" className="px-5 pt-10 pb-20 sm:pt-14 sm:pb-28">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 md:flex-row md:justify-center md:gap-3">
        {/* Raw uploaded photo — deliberately messy/unstructured */}
        <div className="w-[190px] rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-sm md:-rotate-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-canvas)] text-[var(--color-subtle)]">
              <UploadIcon className="h-3.5 w-3.5" />
            </span>
            <p className="text-[11px] font-medium text-[var(--color-subtle)]">menu.jpg</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-2 w-3/4 rounded-full bg-[var(--color-line)]" />
            <div className="h-2 w-full rounded-full bg-[var(--color-line)]" />
            <div className="h-2 w-1/2 rounded-full bg-[var(--color-line)]" />
            <div className="h-2 w-5/6 rounded-full bg-[var(--color-line)]" />
            <div className="h-2 w-2/3 rounded-full bg-[var(--color-line)]" />
          </div>
        </div>

        <FlowArrow />

        {/* Floating AI processing card */}
        <div className="animate-landing-float w-[200px] rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-lg md:z-10">
          <div className="mb-3 flex items-center gap-2">
            <SparkleIcon className="h-4 w-4 text-[var(--color-accent-strong)]" />
            <p className="text-sm font-semibold text-[var(--color-ink)]">AI распознаёт меню</p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {CHECKS.map((label) => (
              <li key={label} className="flex items-center gap-2 text-xs text-[var(--color-subtle)]">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[9px] font-bold text-[var(--color-ink)]">
                  ✓
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <FlowArrow />

        {/* Finished mobile menu + QR */}
        <div className="relative">
          <PhoneMockup />
          <div className="absolute -right-4 -bottom-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 shadow-md">
            <QrMockup className="w-12" />
          </div>
        </div>
      </div>
    </section>
  );
}
