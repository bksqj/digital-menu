import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] px-5 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div>
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--color-ink)]">
              <span className="h-1.5 w-1.5 rounded-[1.5px] bg-[var(--color-accent)]" />
            </span>
            <span className="text-sm font-semibold text-[var(--color-ink)]">Digital Menu</span>
          </div>
          <p className="mt-2 text-sm text-[var(--color-subtle)]">
            Цифровые меню для современного бизнеса.
          </p>
        </div>

        <nav className="flex items-center gap-6 text-sm text-[var(--color-subtle)]">
          <a href="#how-it-works" className="hover:text-[var(--color-ink)]">
            Как это работает
          </a>
          <Link href="/login" className="hover:text-[var(--color-ink)]">
            Войти
          </Link>
        </nav>
      </div>
      <p className="mt-8 text-center text-xs text-[var(--color-subtle)]">
        © {new Date().getFullYear()} Digital Menu
      </p>
    </footer>
  );
}
